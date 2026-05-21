export type FraudRiskLevel = "low" | "medium" | "high";
export type ContactSource =
  | "verified_portal"
  | "provider_statement"
  | "unsolicited_call"
  | "unknown";

export interface ClaimForReview {
  claimId: string;
  providerVerified: boolean;
  billedAmount: number;
  expectedAllowedAmount: number;
  duplicateClaimCount?: number;
  contactSource?: ContactSource;
  serviceCategory?: string;
}

export interface FraudRiskResult {
  claimId: string;
  score: number;
  level: FraudRiskLevel;
  reasons: string[];
}

export interface PartDOptimizationInput {
  projectedAnnualDrugSpend: number;
  negotiatedSavings: number;
  annualOutOfPocketCap: number;
}

export interface PartDOptimization {
  projectedOutOfPocket: number;
  netSavings: number;
}

export interface ClaimReviewSummary {
  risk: FraudRiskResult;
  actions: string[];
}

export function scoreClaimFraudRisk(claim: ClaimForReview): FraudRiskResult {
  assertNonNegative(claim.billedAmount, "billedAmount");
  assertNonNegative(claim.expectedAllowedAmount, "expectedAllowedAmount");
  assertNonNegative(claim.duplicateClaimCount ?? 0, "duplicateClaimCount");

  const reasons: string[] = [];
  let score = 0;

  if (!claim.providerVerified) {
    score += 40;
    reasons.push("Provider could not be verified");
  }

  const billingRatio =
    claim.expectedAllowedAmount === 0
      ? Number.POSITIVE_INFINITY
      : claim.billedAmount / claim.expectedAllowedAmount;

  if (billingRatio >= 3) {
    score += 35;
    reasons.push("Billed amount is far above expected allowed amount");
  } else if (billingRatio >= 1.75) {
    score += 20;
    reasons.push("Billed amount is above expected allowed amount");
  }

  if ((claim.duplicateClaimCount ?? 0) > 1) {
    score += 25;
    reasons.push("Duplicate claim pattern detected");
  }

  if (claim.contactSource === "unsolicited_call") {
    score += 20;
    reasons.push("Claim originated from unsolicited outreach");
  }

  const normalizedScore = Math.min(score, 100);

  return {
    claimId: claim.claimId,
    score: normalizedScore,
    level: riskLevel(normalizedScore),
    reasons,
  };
}

export function calculatePartDOptimization(
  input: PartDOptimizationInput,
): PartDOptimization {
  assertNonNegative(input.projectedAnnualDrugSpend, "projectedAnnualDrugSpend");
  assertNonNegative(input.negotiatedSavings, "negotiatedSavings");
  assertNonNegative(input.annualOutOfPocketCap, "annualOutOfPocketCap");

  const discountedSpend = Math.max(
    input.projectedAnnualDrugSpend - input.negotiatedSavings,
    0,
  );

  return {
    projectedOutOfPocket: money(
      Math.min(discountedSpend, input.annualOutOfPocketCap),
    ),
    netSavings: money(
      Math.min(input.negotiatedSavings, input.projectedAnnualDrugSpend),
    ),
  };
}

export function summarizeClaimReview(input: {
  memberType: "senior" | "veteran" | "caregiver";
  claim: ClaimForReview;
}): ClaimReviewSummary {
  const risk = scoreClaimFraudRisk(input.claim);
  const actions: string[] = [];

  if (risk.level === "high") {
    actions.push(
      "Contact the provider using verified contact information before paying",
    );
    actions.push("Compare the claim against the Medicare Summary Notice");
  }

  if (input.memberType === "veteran") {
    actions.push("Check whether VA benefits or TRICARE should coordinate first");
  }

  return { risk, actions };
}

function riskLevel(score: number): FraudRiskLevel {
  if (score >= 70) {
    return "high";
  }
  if (score >= 30) {
    return "medium";
  }
  return "low";
}

function assertNonNegative(value: number, fieldName: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${fieldName} must be a non-negative number`);
  }
}

function money(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
