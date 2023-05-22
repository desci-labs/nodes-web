import * as Yup from "yup";
// import validUrl from "valid-url";
import { GOOGLE_SCHOLAR_URL_SCHEMA } from "@components/organisms/PopOver/CreditsModal/schema";
// import axios from "axios";
import { ROR_PID_SCHEMA } from "@src/schema/schema";

// export const ROR_API_URL = "https://api.ror.org/organizations/";
// export const ROR_URL = "https://ror.org/";
// export const ROR_PID_SCHEMA = Yup.array().of(Yup.string())
//   // .url("Invalid url")
//   .optional()
//   .test({
//     name: "ROR PID",
//     message: "ROR ID is not a valid organisation ID",
//     test: async (values = [], ctx) => {
//       if (values.length === 0) return true;
//       /**
//        * TODO: Do we want to enforce user typing https?
//        * This will allow https or empty
//        */
//       // const value = values[values.length - 1]
//       const uriToCheck = values[values.length - 1]; // value.includes("http://") ? value : `https://${value}`;
//       if (!uriToCheck) return false;
//       const isValidUri = Boolean(validUrl.isWebUri(uriToCheck));

//       const containsRorDomain = uriToCheck.includes("ror.org");
//       const isValidRorUrl = isValidUri && containsRorDomain;

//       if (!isValidRorUrl) return false;

//       try {
//         const urlParts = uriToCheck.split("/");
//         const value = urlParts[urlParts.length - 1];
//         const { status } = await axios.get(`${ROR_API_URL}${value}`);
//         if (status !== 200) return false;
//         // ctx.from[0].schema
//         return true;
//       } catch (e) {
//         return false;
//       }

//     },
//   });

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
