import * as Yup from "yup";
import validUrl from "valid-url";

import {
  ResearchObjectV1Author,
  ResearchObjectV1AuthorRole,
  ResearchObjectV1Organization,
} from "@desci-labs/desci-models";

export type OrcidPartsKeys = "orcid1" | "orcid2" | "orcid3" | "orcid4";
export type OrcidParts = Record<OrcidPartsKeys, string>;

export type AuthorFormValues = ResearchObjectV1Author;

export interface CreditModalProps {
  author?: ResearchObjectV1Author;
  id?: number;
}

export const GOOGLE_SCHOLAR_URL_SCHEMA = Yup.string()
  .url()
  .optional()
  .test({
    name: "Google scholar url",
    message: "URL is not a valid Google Scholar profile",
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

export const ORCID_PATTERN = "XXXX-XXXX-XXXX-XXXX";
const ORCID_SCHEMA = Yup.string()
  .optional()
  .test({
    name: "Orcid",
    message: "Invalid ORCiD",
    test: (value = "", ctx) => {
      if (value === "") return true;

      let cids = value.split("-");

      let invalid = cids
        .map((data, index) => {
          if (index === cids.length - 1) {
            return data.length === 4 && /^\d{3}[a-zA-Z0-9]{1}$/.test(data)
              ? data
              : "";
          }
          return /^\d+$/.test(data) && data.length === 4 ? data : "";
        })
        .filter(Boolean);
      if (invalid.length !== 4) return false;
      return true;
    },
  });

export const authorRoles = Object.values(ResearchObjectV1AuthorRole);

const AUTHOR_ROLES_SCHEMA = Yup.string()
  .required()
  .test({
    name: "Role",
    message: "Invalid Author Role",
    test: (data, _) => {
      if (data === "") return false;
      return authorRoles.includes(data as ResearchObjectV1AuthorRole);
    },
  });

export const authorsFormSchema = Yup.object({
  orcid: ORCID_SCHEMA,
  name: Yup.string().required(),
  role: AUTHOR_ROLES_SCHEMA,
  googleScholar: GOOGLE_SCHOLAR_URL_SCHEMA.optional(),
  github: Yup.string()
    .url()
    .optional()
    .test({
      message: "Invalid github url",
      name: "Github",
      test: (data, _) => {
        if (data === "" || !data) return true;
        const pattern =
          /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9_-]{1,25}$/gim;
        if (!pattern.test(data)) return false;
        return true;
      },
    }),
  organizations: Yup.mixed<ResearchObjectV1Organization[]>().test({
    name: "Organization",
    message: "Invalid organization",
    test: (data) => {
      return true;
    },
  }),
});
