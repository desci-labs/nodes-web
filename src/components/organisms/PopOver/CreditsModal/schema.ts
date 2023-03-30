import * as Yup from "yup";
import Lazy from "yup/index";

import { ResearchObjectV1Author } from "@desci-labs/desci-models";

export type OrcidPartsKeys = "orcid1" | "orcid2" | "orcid3" | "orcid4";
export type OrcidParts = Record<OrcidPartsKeys, string>;

export type AuthorFormValues = ResearchObjectV1Author & OrcidParts;

type SchemaShape<S> = {
  [K in keyof S]: Yup.AnySchema;
};

const ORCID_SCHEMA = Yup.string().test({
  name: "Orcid",
  message: "Invalid Orcid number",
  test: (data = "", ctx) => {
    console.log("text context", data, ctx);
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
  googleScholar: Yup.string().url().optional(),
  orcid1: ORCID_SCHEMA.optional(),
  orcid2: ORCID_SCHEMA.optional(),
  orcid3: ORCID_SCHEMA.optional(),
  orcid4: ORCID_SCHEMA.optional(),
});
