import * as Yup from "yup";
import { GOOGLE_SCHOLAR_URL_SCHEMA } from "../PopOver/CreditsModal/schema";

export const userProfileActionSchema = Yup.object().shape({
  name: Yup.string().required(),
  googleScholarUrl: GOOGLE_SCHOLAR_URL_SCHEMA.optional(),
  organization: Yup.string().optional(),
  rorPid: Yup.string().optional(),
  hasAffiliation: Yup.bool().oneOf([true, false], "").required(),
  hasAcceptedTerms: Yup.bool()
    .oneOf([true], "Accept the terms to continue")
    .required(),
});
