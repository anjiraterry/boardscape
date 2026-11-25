import type { TrafficObservationInput } from "@/modules/intelligence/schemas";

/**
 * Validates that observational traffic data is never relabeled as
 * verified impressions, guaranteed reach, or decimal eye counts (FR-027, Section 12).
 */
export function buildObservationSummary(obs: TrafficObservationInput) {
  const totalObservedPassers = obs.vehicleCount + obs.pedestrianCount;
  return {
    observedVehicles: obs.vehicleCount,
    observedPedestrians: obs.pedestrianCount,
    totalObservedPassers,
    windowMinutes: obs.durationMinutes,
    direction: obs.vehicleDirection,
    method: obs.observationMethod,
    sourceType: obs.sourceType,
    confidence: obs.confidence,
    disclaimer:
      "Observed field count during sampled window only. Not verified impressions, unique reach, or guaranteed views.",
  };
}
