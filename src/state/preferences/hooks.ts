import { useGetter } from "@src/store/accessors";
import { AppPreferences, Orcid } from "./types";

export const useOrcidData = (): Orcid => {
  const orcid = useGetter((state) => state.preferences.orcid);
  return orcid;
};
export const useAppPreferences = (): AppPreferences => {
  const pref = useGetter((state) => state.preferences);
  return pref;
};
