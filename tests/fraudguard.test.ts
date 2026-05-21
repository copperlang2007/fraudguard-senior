import { describe, expect, it } from "vitest";
import {
  calculatePartDOptimization,
  scoreClaimFraudRisk,
  summarizeClaimReview,
} from "../src/index";

describe("scoreClaimFraudRisk", () => {
  it("flags unverified providers and suspicious billing spikes", () => {
    const result = scoreClaimFraudRisk({
      claimId: "claim-001",
      providerVerified: false,
      billedAmount: 1200,
      expectedAllowedAmount: 300,
      serviceCategory: "durable_medical_equipment",
    });

    expect(result.level).toBe("high");
  });

  it("escalates duplicate claims from unsolicited outreach", () => {
    const result = scoreClaimFraudRisk({
      claimId: "claim-002",
      providerVerified: true,
      billedAmount: 180,
      expectedAllowedAmount: 175,
      duplicateClaimCount: 2,
      contactSource: "unsolicited_call",
    });

    expect(result.reasons).toContain("Duplicate claim pattern detected");
  });
});

describe("calculatePartDOptimization", () => {
  it("caps annual Part D out-of-pocket exposure at the 2026 limit", () => {
    const result = calculatePartDOptimization({
      projectedAnnualDrugSpend: 3400,
      negotiatedSavings: 575,
      annualOutOfPocketCap: 2100,
    });

    expect(result.projectedOutOfPocket).toBe(2100);
  });

  it("shows net savings from negotiated drug price changes", () => {
    const result = calculatePartDOptimization({
      projectedAnnualDrugSpend: 1900,
      negotiatedSavings: 425,
      annualOutOfPocketCap: 2100,
    });

    expect(result.netSavings).toBe(425);
  });
});

describe("summarizeClaimReview", () => {
  it("returns review actions for veteran senior users with high-risk claims", () => {
    const result = summarizeClaimReview({
      memberType: "veteran",
      claim: {
        claimId: "claim-003",
        providerVerified: false,
        billedAmount: 2500,
        expectedAllowedAmount: 500,
      },
    });

    expect(result.actions).toContain("Contact the provider using verified contact information before paying");
  });
});
