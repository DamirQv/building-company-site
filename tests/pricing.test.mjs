import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import * as crypto from "node:crypto";
import * as fsp from "node:fs/promises";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";
import * as fflate from "fflate";

const root = new URL("../", import.meta.url);
const code = (name) => ts.transpileModule(fs.readFileSync(new URL(name, root), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const pricingCode = code("lib/pricing.ts");
const routeCode = code("app/api/lead/route.ts");
const ledgerCode = code("lib/lead-idempotency.ts");
const rows = [["FinnBlock", 211111, 311111], ["Газоблок", 222222, 322222], ["Кирпич", 233333, 333333]];
const csv = (data = rows, header = "material,almatyPricePerM2,astanaPricePerM2") => header + "\n" + data.map((row) => row.join(",")).join("\n");

function load(compiled, require, extra = {}) {
  const exports = {};
  vm.runInNewContext(compiled, { exports, require, ...extra });
  return exports;
}
function pricingHarness() {
  const state = { body: csv(), status: 200, error: null, calls: [], logs: [], env: { GOOGLE_SHEETS_CSV_URL: "https://fixture.invalid/pricing" } };
  const pricing = load(pricingCode, () => fflate, {
    URL, URLSearchParams, TextDecoder, Uint8Array, AbortSignal, process: { env: state.env },
    console: { warn: (...args) => state.logs.push(args) },
    fetch: async (url, options) => {
      state.calls.push({ url, options });
      if (state.error) throw state.error;
      return new Response(state.body, { status: state.status });
    },
  });
  return { state, pricing };
}

test("complete CSV: all six external tariffs and unchanged default values", async () => {
  const { state, pricing } = pricingHarness();
  const result = await pricing.getPricingData();
  assert.equal(result.source, "google-sheets");
  assert.equal(result.pricing.length, 3);
  for (const [material, almaty, astana] of rows) {
    assert.equal(pricing.resolveMaterialPrice(material, result.pricing, "Алматы"), almaty);
    assert.equal(pricing.resolveMaterialPrice(material, result.pricing, "Астана"), astana);
  }
  assert.equal(JSON.stringify(pricing.DEFAULT_PRICING.map((p) => [p.pricePerM2, p.astanaPricePerM2])), JSON.stringify([[160000, 200000], [150000, 190000], [155000, 195000]]));
  assert.equal(state.calls[0].options.cache, "no-store");
  assert.ok(state.calls[0].options.signal);
  assert.equal(Number.isNaN(pricing.resolveMaterialPrice("missing", result.pricing)), true);
});

for (const [name, body, expected] of [
  ["missing material", csv(rows.slice(0, 2)), "incomplete"],
  ["missing Astana column", csv(rows.map((r) => r.slice(0, 2)), "material,almatyPricePerM2"), "incomplete"],
  ["missing city cell", csv([["FinnBlock", 211111, ""], ...rows.slice(1)]), "incomplete"],
  ["duplicate material", csv([...rows, rows[0]]), "duplicate"],
  ["ambiguous city columns", csv(rows.map((row) => [...row, 1]), "material,almatyPricePerM2,astanaPricePerM2,price"), "duplicate"],
  ["extra CSV cell", csv([["FinnBlock", 211111, 311, "111"], ...rows.slice(1)]), "invalid_format"],
  ["malformed CSV quotes", csv([["FinnBlock", '21"111"1', 311111], ...rows.slice(1)]), "invalid_format"],
  ["zero rate", csv([["FinnBlock", 0, 311111], ...rows.slice(1)]), "invalid_rate"],
  ["negative rate", csv([["FinnBlock", -1, 311111], ...rows.slice(1)]), "invalid_rate"],
  ["malformed rate", csv([["FinnBlock", "123abc", 311111], ...rows.slice(1)]), "invalid_rate"],
  ["HTML instead of CSV", "<html>Sign in</html>", "invalid_format"],
  ["empty source", "", "incomplete"],
]) {
  test(`${name}: whole reserve set, explicit diagnostic, no mixed tariffs`, async () => {
    const { state, pricing } = pricingHarness();
    state.body = body;
    const result = await pricing.getPricingData();
    assert.equal(result.source, "default");
    assert.equal(result.error, expected);
    assert.equal(result.pricing, pricing.DEFAULT_PRICING);
    assert.equal(state.logs[0][1].code, expected);
  });
}

test("timeout and HTTP errors are classified without secret URLs", async () => {
  const { state, pricing } = pricingHarness();
  state.error = Object.assign(new TypeError("secret-url"), { cause: { code: "ETIMEDOUT" } });
  assert.equal((await pricing.getPricingData()).error, "timeout");
  assert.equal(JSON.stringify(state.logs).includes("secret-url"), false);
  state.error = null;
  state.status = 403;
  assert.equal((await pricing.getPricingData()).error, "http");
  assert.equal(state.logs.at(-1)[1].status, 403);
});

test("URL normalization retains hash gid and source priority", async () => {
  const { state, pricing } = pricingHarness();
  state.env.GOOGLE_SHEETS_CSV_URL = "https://docs.google.com/spreadsheets/d/TEST/edit#gid=123";
  state.env.PRICING_SHEET_URL = "https://secondary.invalid";
  await pricing.getPricingData();
  assert.equal(state.calls[0].url, "https://docs.google.com/spreadsheets/d/TEST/export?format=csv&gid=123");
  state.env.GOOGLE_SHEETS_CSV_URL = "";
  await pricing.getPricingData();
  assert.equal(state.calls[1].url, "https://secondary.invalid/");
});

test("XLSX inline strings accept all six tariffs", async () => {
  const { state, pricing } = pricingHarness();
  const table = [["material", "almatyPricePerM2", "astanaPricePerM2"], ...rows];
  const sheet = "<worksheet><sheetData>" + table.map((row, i) => `<row r="${i + 1}">` + row.map((value, j) => {
    const ref = `${String.fromCharCode(65 + j)}${i + 1}`;
    return typeof value === "string" ? `<c r="${ref}" t="inlineStr"><is><t>${value}</t></is></c>` : `<c r="${ref}"><v>${value}</v></c>`;
  }).join("") + "</row>").join("") + "</sheetData></worksheet>";
  state.body = fflate.zipSync({ "xl/worksheets/sheet1.xml": fflate.strToU8(sheet) });
  const result = await pricing.getPricingData();
  assert.equal(result.source, "google-sheets");
  assert.equal(result.pricing[2].astanaPricePerM2, 333333);
});

async function leadHarness(t) {
  const { state, pricing } = pricingHarness();
  const cwd = await fsp.mkdtemp(path.join(os.tmpdir(), "standard-stroy-pricing-"));
  t.after(() => fsp.rm(cwd, { recursive: true, force: true }));
  const writes = [];
  const crm = { failDeal: false, delay: false };
  function route() {
    const ledger = load(ledgerCode, (id) => ({ "node:crypto": crypto, "node:fs/promises": fsp, "node:path": { default: path } })[id], { process: { cwd: () => cwd } });
    return load(routeCode, (id) => {
      if (id === "@/lib/pricing") return pricing;
      if (id === "@/lib/lead-idempotency") return ledger;
      if (id === "next/server") return { NextResponse: { json: (body, options = {}) => Response.json(body, options) } };
      throw Error(id);
    }, {
      process: { env: { BITRIX24_WEBHOOK_URL: "https://crm.invalid/mock" } },
      console: { log() {}, error() {} },
      fetch: async (url, options) => {
        assert.ok(url.startsWith("https://crm.invalid/mock/"));
        writes.push({ url, body: JSON.parse(options.body) });
        if (crm.delay) await new Promise((resolve) => setTimeout(resolve, 15));
        if (url.endsWith("crm.contact.add.json")) return Response.json({ result: 123 });
        if (crm.failDeal) throw Error("uncertain network result");
        return Response.json({ result: { item: { id: 456 } } });
      },
    });
  }
  const body = {
    request_id: randomUUID(), formType: "quiz", blockCode: "S-QUIZ", quiz_completed: true,
    name: "mock", phone: "+70000000000", consent: true, city: "Алматы", material: "FinnBlock",
    area_m2: 100, finish_level: "Коробка дома", price_per_m2: 211111,
    estimate_min: 21111100, estimate_max: 21111100, pricing_source: "google-sheets",
  };
  const instance = route();
  return { state, writes, crm, body, route, post: (payload = body, handler = instance) => handler.POST({ json: async () => payload }) };
}

test("price changes twice: both confirmations recheck; only confirmed server sum reaches unchanged CRM fields", async (t) => {
  const h = await leadHarness(t);
  h.state.body = csv([["FinnBlock", 250000, 350000], ...rows.slice(1)]);
  let response = await h.post();
  assert.equal(response.status, 409);
  let data = await response.json();
  assert.equal(data.code, "price_changed");
  assert.equal(h.writes.length, 0);
  Object.assign(h.body, data.quote);
  h.state.body = csv([["FinnBlock", 260000, 350000], ...rows.slice(1)]);
  response = await h.post();
  assert.equal(response.status, 409);
  data = await response.json();
  assert.equal(data.quote.estimate_min, 26000000);
  Object.assign(h.body, data.quote);
  response = await h.post();
  assert.equal(response.status, 200);
  assert.equal(h.writes.length, 2);
  const [contact, deal] = h.writes;
  assert.deepEqual(contact.body, { fields: { NAME: "mock", PHONE: [{ VALUE: "+70000000000", VALUE_TYPE: "WORK" }] } });
  assert.equal(deal.body.entityTypeId, 2);
  assert.equal(deal.body.fields.contactId, 123);
  assert.equal(deal.body.fields.ufCrm_1783000383, 45);
  assert.equal(deal.body.fields.ufCrm_1783078367222, 203);
  assert.equal(deal.body.fields.ufCrm_1783000831, 111);
  assert.equal(deal.body.fields.ufCrm_1783000757, 100);
  assert.match(deal.body.fields.comments, /price_per_m2: 260000/);
  assert.match(deal.body.fields.comments, /estimate_min: 26000000/);
  assert.match(deal.body.fields.comments, /estimate_max: 26000000/);
  // Replay after a worker restart/outage returns the recorded result, never another CRM write.
  h.state.error = new Error("offline");
  assert.equal((await h.post(h.body, h.route())).status, 200);
  assert.equal(h.writes.length, 2);
});

test("timeout/incomplete data block CRM; recovery from reserve requires confirmation even when rates match", async (t) => {
  const h = await leadHarness(t);
  h.state.error = Object.assign(new TypeError("timeout"), { cause: { code: "ETIMEDOUT" } });
  assert.equal((await h.post()).status, 503);
  assert.equal(h.writes.length, 0);
  h.state.error = null;
  h.state.body = csv(rows.slice(0, 2));
  assert.equal((await h.post()).status, 503);
  h.state.body = csv();
  h.body.pricing_source = "default";
  const response = await h.post();
  assert.equal(response.status, 409);
  Object.assign(h.body, (await response.json()).quote);
  assert.equal((await h.post()).status, 200);
  assert.equal(h.writes.length, 2);
});

test("concurrent retries and changed payload cannot create duplicate applications", async (t) => {
  const h = await leadHarness(t);
  h.crm.delay = true;
  const results = await Promise.all([h.post(), h.post(h.body, h.route()), h.post()]);
  assert.ok(results.some((r) => r.status === 200));
  assert.ok(results.every((r) => [200, 409].includes(r.status)));
  assert.equal(h.writes.length, 2);
  assert.equal((await h.post({ ...h.body, area_m2: 101 })).status, 409);
  assert.equal(h.writes.length, 2);
});

test("uncertain CRM response remains locked after restart; retry creates no new contact or deal", async (t) => {
  const h = await leadHarness(t);
  h.crm.failDeal = true;
  assert.equal((await h.post()).status, 502);
  assert.equal((await h.post(h.body, h.route())).status, 502);
  assert.equal(h.writes.length, 2);
});

test("same formula and valid boundary areas for both cities; non-quiz path is unchanged", async (t) => {
  const h = await leadHarness(t);
  for (const city of ["Алматы", "Астана"]) {
    for (const area of [30, 1000]) {
      const rate = city === "Алматы" ? 211111 : 311111;
      const response = await h.post({ ...h.body, request_id: randomUUID(), city, area_m2: area, price_per_m2: rate, estimate_min: Math.round(rate * area), estimate_max: Math.round(rate * area) });
      assert.equal(response.status, 200);
    }
  }
  const before = h.state.calls.length;
  assert.equal((await h.post({ name: "mock", phone: "+70000000000", consent: true, formType: "consultation" })).status, 200);
  assert.equal(h.state.calls.length, before);
});
