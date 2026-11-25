import { haversineDistanceMeters } from "@/modules/geospatial/abuja";
import { SurveySubmissionSchema, type SurveySubmissionInput } from "@/modules/surveys/schemas";

export interface ExistingSiteCoord {
  siteId: string;
  publicId: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface DuplicateCandidate {
  siteId: string;
  publicId: string;
  address: string;
  distanceMeters: number;
}

export function detectNearbyDuplicateSites(
  targetLat: number,
  targetLng: number,
  existingSites: ExistingSiteCoord[],
  thresholdMeters = 50
): DuplicateCandidate[] {
  return existingSites
    .map((site) => ({
      siteId: site.siteId,
      publicId: site.publicId,
      address: site.address,
      distanceMeters: Math.round(
        haversineDistanceMeters(targetLat, targetLng, site.latitude, site.longitude)
      ),
    }))
    .filter((c) => c.distanceMeters <= thresholdMeters)
    .sort((a, b) => a.distanceMeters - b.distanceMeters);
}

export function assessCoordinateQuality(gpsAccuracyMeters: number): {
  quality: "good" | "acceptable" | "low_accuracy_flagged";
  warning?: string;
} {
  if (gpsAccuracyMeters <= 15) {
    return { quality: "good" };
  }
  if (gpsAccuracyMeters <= 40) {
    return { quality: "acceptable" };
  }
  return {
    quality: "low_accuracy_flagged",
    warning: `GPS accuracy (${gpsAccuracyMeters}m) exceeds 40m threshold; flagged for verifier review (FR-007).`,
  };
}

export function validateSurveySubmission(raw: unknown): SurveySubmissionInput {
  return SurveySubmissionSchema.parse(raw);
}
