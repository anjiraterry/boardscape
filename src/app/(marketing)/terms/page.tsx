export const metadata = { title: "Terms of Service" };

const TERMS_SECTIONS = [
  {
    num: "01",
    title: "Enquiries & Booking Confirmation",
    body: "Submitting a campaign brief or shortlist enquiry on boardscape Atlas does not constitute a confirmed media booking. Bookings are confirmed only after written client proposal acceptance and explicit operator rate and date confirmation.",
  },
  {
    num: "02",
    title: "Compliance Documentation",
    body: "Compliance status indicators reflect internal review of operator-supplied documentation and do not represent official government certification.",
  },
];

export default function TermsPage() {
  return (
    <div>
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <h1 className="font-sans text-3xl font-semibold tracking-tight text-charcoal sm:text-4xl">
            Terms of Service
          </h1>
          <p className="mt-5 max-w-2xl font-sans text-base leading-relaxed text-muted-foreground sm:text-lg">
            Governing campaign briefs, shortlist enquiries, and operator-supplied
            compliance records on boardscape.
          </p>
        </div>
      </section>

      <section className="bg-charcoal text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid gap-5 sm:gap-6 md:grid-cols-2">
            {TERMS_SECTIONS.map(({ num, title, body }) => (
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
