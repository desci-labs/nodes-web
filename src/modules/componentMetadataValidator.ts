import {
  ResearchObject,
  ResearchObjectV1,
  ResearchObjectV1Component,
} from "@desci-labs/desci-models";

export interface ValidationResult {
  valid: boolean;
  reason?: string[];
}

const validate = (
  component: ResearchObjectV1Component,
  researchObject: ResearchObjectV1
): ValidationResult => {
  // if(!component.payload.keywords) {}
  // if(!component.payload.description) {
  //   return false
  // }
  if (!researchObject) {
    return { valid: false, reason: ["Not loaded"] };
  }
  if (
    !researchObject ||
    (!component.payload.licenseType && !researchObject?.defaultLicense)
  ) {
    return {
      valid: false,
      reason: [
        ...(component.payload.licenseType ? [] : ["No license type set"]),
        ...(researchObject?.defaultLicense ? [] : ["No default license set"]),
        ...(!researchObject ? ["Research object not found"] : []),
      ],
    };
  }
  return { valid: true };
};

export default validate;
