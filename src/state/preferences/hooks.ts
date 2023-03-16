import { useGetter } from "@src/store/accessors";
import { Orcid } from "./types";

export const useOrcidData = (): Orcid => {
  const orcid = useGetter((state) => state.preferences.orcid);
  return orcid;
};
