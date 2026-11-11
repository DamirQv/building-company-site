import { CONTACT_PHONES } from "@/lib/contacts";

export function ContactPhones({ compact = false, astanaFirst = false }: { compact?: boolean; astanaFirst?: boolean }) {
  const phones = astanaFirst
    ? [...CONTACT_PHONES.filter((phone) => phone.city === "Астана"), ...CONTACT_PHONES.filter((phone) => phone.city === "Алматы")]
    : CONTACT_PHONES;
  return (
    <div className={`flex flex-col ${compact ? "gap-0.5 text-xs leading-4" : "gap-2 text-sm"}`}>
      {phones.map((phone) => (
        <a key={phone.href} href={phone.href} className={`inline-flex ${compact ? "min-h-4" : "min-h-8"} w-fit flex-wrap items-baseline gap-x-1.5 transition hover:text-sky-700`}>
          <span className="whitespace-nowrap">{phone.display}</span>
          <span className="text-xs font-normal text-slate-500">{phone.city}</span>
        </a>
      ))}
    </div>
  );
}
