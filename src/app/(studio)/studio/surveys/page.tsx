import { Badge } from "@/components/ui/badge";
import { ReviewSurveyButtons } from "@/components/studio/review-survey-buttons";
import { getSql } from "@/lib/db/neon";
import { isDatabaseConfigured } from "@/lib/env";

export const metadata = { title: "Survey Review — boardscape Studio" };

export default async function StudioSurveysPage() {
  const surveys = isDatabaseConfigured()
    ? await getSql()`
        SELECT
          id,
          sync_key,
          recorded_at,
          gps_accuracy_meters,
          duplicate_review_status,
          displayed_operator_name
        FROM surveys
        ORDER BY recorded_at DESC
        LIMIT 50
      `
    : [];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="font-sans text-2xl font-semibold tracking-tight text-charcoal sm:text-3xl">
          Survey Review &amp; Duplicate Check
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Inspect field submissions, GPS accuracy flags, and nearby site
          candidates (FR-007).
        </p>
      </div>

      <div className="overflow-x-auto overflow-hidden rounded-2xl bg-card shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-charcoal font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-300">
            <tr>
              <th className="p-4 font-medium">Sync Key</th>
              <th className="p-4 font-medium">Recorded At</th>
              <th className="p-4 font-medium">GPS Accuracy</th>
              <th className="p-4 font-medium">Displayed Operator</th>
              <th className="p-4 font-medium">Duplicate Status</th>
              <th className="p-4 font-medium">Review Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {surveys.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  No field surveys awaiting review.
                </td>
              </tr>
            ) : (
              surveys.map((s) => (
                <tr key={String(s.id)}>
                  <td className="p-4 font-mono text-xs">
                    {String(s.sync_key)}
                  </td>
                  <td className="p-4">
                    {new Date(String(s.recorded_at)).toLocaleString("en-NG")}
                  </td>
                  <td className="p-4 font-mono">
                    {String(s.gps_accuracy_meters ?? "—")}m
                  </td>
                  <td className="p-4">
                    {String(s.displayed_operator_name ?? "Not observed")}
                  </td>
                  <td className="p-4">
                    <Badge
                      variant={
                        s.duplicate_review_status === "flagged_nearby"
                          ? "warning"
                          : "secondary"
                      }
                    >
                      {String(s.duplicate_review_status)}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <ReviewSurveyButtons
                      surveyId={String(s.id)}
                      currentStatus={String(s.duplicate_review_status)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
