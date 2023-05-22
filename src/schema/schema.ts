import * as Yup from "yup";
import validUrl from "valid-url";
import axios from "axios";

export const ROR_API_URL = "https://api.ror.org/organizations/";
export const ROR_URL = "https://ror.org/";

export const ROR_PID_SCHEMA = Yup.array()
  .of(Yup.string().url())
  // .url("Invalid url")
  .test({
    name: "ROR PID",
    message: "ROR ID is not a valid organisation ID",
    test: async (rorPid = [], ctx) => {
      const values = (ctx.parent.rorPid || []) as string[];
      console.log("validate", values, ctx);
      if (values.length === 0) return true;
      /**
       * TODO: Do we want to enforce user typing https?
       * This will allow https or empty
       */
      // const value = values[values.length - 1]
      const uriToCheck = values[values.length - 1]; // value.includes("http://") ? value : `https://${value}`;
      if (!uriToCheck) return false;
      const isValidUri = Boolean(validUrl.isWebUri(uriToCheck));

      const containsRorDomain = uriToCheck.includes("ror.org");
      const isValidRorUrl = isValidUri && containsRorDomain;

      if (!isValidRorUrl) return false;

      try {
        const urlParts = uriToCheck.split("/");
        const value = urlParts[urlParts.length - 1];
        console.log("url to check", `${ROR_API_URL}${value}`);
        const { status } = await axios.get(`${ROR_API_URL}${value}`);
        console.log('checked', status);
        if (status !== 200) return false;
        // ctx.from[0].schema
        return true;
      } catch (e) {
        console.log("error", e);
        return false;
      }
    },
  });
