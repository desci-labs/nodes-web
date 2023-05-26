import * as Yup from "yup";
import { GOOGLE_SCHOLAR_URL_SCHEMA } from "@components/organisms/PopOver/CreditsModal/schema";
import { ROR_PID_SCHEMA } from "@src/schema/schema";

export const userProfileActionSchema = Yup.object().shape({
  name: Yup.string().optional(),
  googleScholarUrl: GOOGLE_SCHOLAR_URL_SCHEMA.optional(),
  organization: Yup.string().optional(),
  rorpid: ROR_PID_SCHEMA,
  hasAffiliation: Yup.bool().oneOf([true, false], "").required(),
  hasAcceptedTerms: Yup.bool()
    .oneOf([true], "Accept the terms to continue")
    .required(),
});
