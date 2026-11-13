import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

// Actual sitemap code, isolated news boundary: no network or CRM writes.
const compiled = ts.transpileModule(fs.readFileSync(new URL("../app/sitemap.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
class BitrixNewsError extends Error {
  constructor() {
    super("secret upstream URL must not be logged");
    this.method = "crm.deal.list.json";
    this.code = "timeout";
    this.status = 504;
  }
}
async function run(getPublishedNews) {
  const errors = [];
  const exports = {};
  vm.runInNewContext(compiled, {
    exports,
    require(id) {
      assert.equal(id, "@/lib/news");
      return { getPublishedNews, BitrixNewsError };
    },
    console: { error: (...args) => errors.push(args) },
  }, { filename: "sitemap.js" });
  return { entries: await exports.default(), errors };
}
function checkStatic(entries) {
  const staticEntries = entries.filter(({ url }) => !url.includes("/blog/"));
  assert.equal(staticEntries.length, 20);
  for (const entry of staticEntries) {
    assert.equal("lastModified" in entry, false);
    assert.equal(/\/(obekty|proekty)(\/|$)/.test(entry.url), false);
  }
  for (const route of ["", "/kontakty", "/astana", "/otzyvy", "/blog", "/uslugi/arhitekturnyy-interer"]) {
    assert.ok(entries.some(({ url }) => url === `https://standardstroy.kz${route}`));
  }
}
test("published news uses source dates; invalid and static dates are omitted", async () => {
  const { entries, errors } = await run(async () => [
    { slug: "controlled-article", publishedAt: "2026-11-01T10:00:00Z" },
    { slug: "article-without-date", publishedAt: "" },
  ]);
  checkStatic(entries);
  assert.equal(entries.length, 22);
  assert.equal(entries.find(({ url }) => url.endsWith("/controlled-article")).lastModified.toISOString(), "2026-11-01T10:00:00.000Z");
  assert.equal("lastModified" in entries.find(({ url }) => url.endsWith("/article-without-date")), false);
  assert.equal(errors.length, 0);
});
test("empty source preserves static URLs", async () => {
  const { entries, errors } = await run(async () => []);
  checkStatic(entries);
  assert.equal(entries.length, 20);
  assert.equal(errors.length, 0);
});
test("timeout preserves static URLs with safe diagnostics", async () => {
  const { entries, errors } = await run(async () => { throw new BitrixNewsError(); });
  checkStatic(entries);
  assert.equal(entries.length, 20);
  assert.equal(errors.length, 1);
  assert.equal(errors[0][1].code, "timeout");
  assert.equal(errors[0][1].status, 504);
  assert.equal(JSON.stringify(errors).includes("secret upstream"), false);
});
test("unexpected exception is diagnosed without exposing raw error data", async () => {
  const { entries, errors } = await run(async () => { throw new Error("private-token"); });
  checkStatic(entries);
  assert.equal(errors[0][1].code, "unexpected_news_error");
  assert.equal(JSON.stringify(errors).includes("private-token"), false);
});
