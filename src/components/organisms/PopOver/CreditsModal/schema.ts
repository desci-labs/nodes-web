import * as Yup from "yup";
import validUrl from "valid-url";

import { ResearchObjectV1Author } from "@desci-labs/desci-models";

export type OrcidPartsKeys = "orcid1" | "orcid2" | "orcid3" | "orcid4";
export type OrcidParts = Record<OrcidPartsKeys, string>;

export type AuthorFormValues = ResearchObjectV1Author & OrcidParts;

type SchemaShape<S> = {
  [K in keyof S]: Yup.AnySchema;
};

const GOOGLE_SCHOLAR_URL_SCHEMA = Yup.string()
  .url()
  .optional()
  .test({
    name: "Google scholar url",
    message: "URL is not a valid google scholar profile",
    test: (value = "", ctx) => {
      if (value === "") return true;
      /**
       * TODO: Do we want to enforce user typing https?
       * This will allow https or empty
       */
      const uriToCheck = value.includes("http://") ? value : `https://${value}`;

      /**
       * 'isWebUri' requires http or https to be there
       * https://github.com/ogt/valid-url/blob/master/test/is_web_uri.js
       * This is why we add it above if it's not there
       */
      const isValidUri = Boolean(validUrl.isWebUri(uriToCheck));

      const containsGoogleScholar = value?.includes("scholar.google.com");
      const isValidGoogleScholarUrl = isValidUri && containsGoogleScholar;

      if (isValidGoogleScholarUrl) {
        return true;
      } else {
        /**
         * TODO: Get proper error message from design
         */
        // return "URL is not a valid google scholar profile";
        return false;
      }
    },
  });

const ORCID_SCHEMA = Yup.string()
  .optional()
  .test({
    name: "Orcid",
    message: "Invalid Orcid number",
    test: (data = "", ctx) => {
      // console.log("text context", data, ctx);
      if (data === "") return true;
      return (
        !Number.isNaN(parseInt(data)) &&
        typeof Number(data) === "number" &&
        data.length === 4
      );
    },
  });

export const authorsFormSchema = Yup.object({
  name: Yup.string().required(),
  orcid: Yup.string().optional(),
  googleScholar: GOOGLE_SCHOLAR_URL_SCHEMA.optional(),
  orcid1: ORCID_SCHEMA.optional(),
  orcid2: ORCID_SCHEMA.optional(),
  orcid3: ORCID_SCHEMA.optional(),
  orcid4: ORCID_SCHEMA.optional(),
});
