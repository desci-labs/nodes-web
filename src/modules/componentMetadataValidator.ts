import { ResearchObject, ResearchObjectV1, ResearchObjectV1Component } from "@desci-labs/desci-models"

const validate = (component: ResearchObjectV1Component, researchObject: ResearchObjectV1) => {
  // if(!component.payload.keywords) {}
  // if(!component.payload.description) {
  //   return false
  // }
  if(!researchObject || (!component.payload.licenseType && !researchObject.defaultLicense)) {
    return false
  }
  return true
}

export default validate