import { BriefForm } from "@/components/forms/brief-form";

export const metadata = { title: "Submit Campaign Brief" };

export default async function BriefPage({
  searchParams,
}: {
  searchParams: Promise<{ faces?: string }>;
}) {
  const params = await searchParams;
  const faceIds = params.faces ? params.faces.split(",").filter(Boolean) : [];

  return (
    <section className="bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <h1 className="font-sans text-3xl font-semibold tracking-tight text-charcoal sm:text-4xl">
          Tell us what you are building in Abuja.
        </h1>
        <p className="mt-5 max-w-2xl font-sans text-base leading-relaxed text-muted-foreground sm:text-lg">
          Submitting a brief initiates a structured media and creative review
          with our account team. Operator availability and rates are reconfirmed
          before any proposal is issued.
        </p>

        {faceIds.length > 0 && (
          <div className="mt-6 rounded-xl bg-charcoal px-5 py-4 text-sm text-white">
            Including{" "}
            <strong className="font-semibold text-limebrand">
              {faceIds.length}
            </strong>{" "}
            shortlisted Atlas face(s) in this brief.
          </div>
        )}

        <div className="mt-10 rounded-2xl bg-card p-6 shadow-sm sm:p-8">
          <BriefForm
            initialFaceIds={faceIds}
            source={faceIds.length > 0 ? "atlas_shortlist" : "website_brief"}
          />
        </div>
      </div>
    </section>
  );
}
