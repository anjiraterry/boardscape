import { BriefForm } from "@/components/forms/brief-form";

export const metadata = { title: "Contact boardscape" };

export default function ContactPage() {
  return (
    <section className="bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <h1 className="font-sans text-3xl font-semibold tracking-tight text-charcoal sm:text-4xl">
          Speak with the Abuja team.
        </h1>
        <p className="mt-5 max-w-2xl font-sans text-base leading-relaxed text-muted-foreground sm:text-lg">
          For brand campaigns, agency partnerships, or billboard operator
          onboarding.
        </p>

        <div className="mt-10 rounded-2xl bg-card p-6 shadow-sm sm:p-8">
          <BriefForm source="contact_form" />
        </div>
      </div>
    </section>
  );
}
