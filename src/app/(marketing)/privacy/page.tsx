export const metadata = { title: "Privacy Policy" };

const PRIVACY_SECTIONS = [
  {
    num: "01",
    title: "Campaign & Contact Data",
    body: "boardscape processes business contact details, campaign briefs, and operator documentation strictly for campaign planning, quotation, and execution in accordance with the Nigeria Data Protection Act (NDPA).",
  },
  {
    num: "02",
    title: "Operator & Survey Confidentiality",
    body: "Private operator contacts, rate cards, and permit scans are never published on public Atlas listings. Field survey photographs are reviewed before any derived public image is published.",
  },
];

export default function PrivacyPage() {
  return (
    <div>
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <h1 className="font-sans text-3xl font-semibold tracking-tight text-charcoal sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-5 max-w-2xl font-sans text-base leading-relaxed text-muted-foreground sm:text-lg">
            How boardscape handles business contact records, campaign briefs, and
            operator documentation.
          </p>
        </div>
      </section>

      <section className="bg-charcoal text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid gap-5 sm:gap-6 md:grid-cols-2">
            {PRIVACY_SECTIONS.map(({ num, title, body }) => (
              <div key={num} className="rounded-xl bg-charcoal-800 p-6 sm:p-8">
                <span className="font-mono text-sm font-semibold text-limebrand">
                  {num}
                </span>
                <h2 className="mt-5 font-sans text-xl font-semibold tracking-tight text-white">
                  {title}
                </h2>
                <p className="mt-3 font-sans text-sm leading-relaxed text-neutral-300">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
