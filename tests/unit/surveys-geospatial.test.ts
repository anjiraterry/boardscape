import { describe, expect, it } from "vitest";
import {
  assessCoordinateQuality,
  detectNearbyDuplicateSites,
  validateSurveySubmission,
} from "@/modules/surveys/service";

describe("Field Surveys & Geospatial Duplicate Detection (FR-004–FR-007)", () => {
  it("validates a multi-face survey submission", () => {
    const parsed = validateSurveySubmission({
      syncKey: "srv_test_12345678",
      recordedAt: "2026-11-23T09:00:00Z",
      latitude: 9.0765,
      longitude: 7.3986,
      gpsAccuracyMeters: 10,
      address: "Opposite Transcorp Hilton",
      roadName: "Aguiyi Ironsi Street",
      district: "Maitama",
      attachmentCount: 2,
      faces: [
        {
          label: "Face A",
          format: "unipole",
          widthMeters: 12,
          heightMeters: 4,
          azimuthDeg: 90,
          illumination: "frontlit",
          obstructionLevel: "clear",
          roadDirection: "Inbound",
        },
        {
          label: "Face B",
          format: "unipole",
          widthMeters: 12,
          heightMeters: 4,
          azimuthDeg: 270,
          illumination: "frontlit",
          obstructionLevel: "clear",
          roadDirection: "Outbound",
        },
      ],
    });
    expect(parsed.faces).toHaveLength(2);
  });

  it("detects nearby existing sites within 50m", () => {
    const candidates = detectNearbyDuplicateSites(9.0765, 7.3986, [
      {
        siteId: "s-1",
        publicId: "ABJ-001",
        address: "Nearby Pole",
        latitude: 9.0766,
        longitude: 7.3987,
      },
      {
        siteId: "s-2",
        publicId: "ABJ-002",
        address: "Far Site",
        latitude: 9.1,
        longitude: 7.42,
      },
    ]);
    expect(candidates).toHaveLength(1);
    expect(candidates[0].siteId).toBe("s-1");
  });

  it("flags low GPS accuracy exceeding 40m", () => {
    const check = assessCoordinateQuality(65);
    expect(check.quality).toBe("low_accuracy_flagged");
  });
});
