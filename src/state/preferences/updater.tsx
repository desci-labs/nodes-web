import { __log } from "@src/components/utils";
import {
  LOCALSTORAGE_ORCID_ACCESS_TOKEN,
  LOCALSTORAGE_ORCID_ID,
} from "@src/lib/orcIdLib";
import axios from "axios";
import { useCallback, useEffect } from "react";
import { useSetter } from "@src/store/accessors";
import { useOrcidData } from "./hooks";
import { setOrcid } from "./preferencesSlice";
export const LOCALSTORAGE_DESCI_USER_PROFILE =
  "LOCALSTORAGE_DESCI_USER_PROFILE";
// import { set } from "./reducer";

export default function PreferencUpdater() {
  const dispatch = useSetter();
  const { orcidData, checking } = useOrcidData();

  const checkOrcid = useCallback(async () => {
    dispatch(setOrcid({ checking: false }));

    // __log("CHECK ORCID");
    /**
     * Local storage variables set in OrcIdCapture
     */
    const orcidToken = localStorage.getItem(LOCALSTORAGE_ORCID_ACCESS_TOKEN);
    if (orcidToken) {
      return await(async () => {
        // setOrcidLoading(true);
        dispatch(setOrcid({ loading: true }));
        const orcid = localStorage.getItem(LOCALSTORAGE_ORCID_ID);

        try {
          const url = `${process.env.REACT_APP_NODES_API}/v1/auth/orcid/validate?orcid=${orcid}&token=${orcidToken}`;
          const { data } = await axios.get(url);
          __log("orcid", data);
          // setOrcidData(data.data);
          dispatch(setOrcid({ orcidData: data.data }));
        } catch (err) {
          dispatch(setOrcid({ orcidData: {} }));
          console.error(err);
          // setOrcidData({});
        } finally {
          // setOrcidLoading(false);
          dispatch(setOrcid({ loading: false }));
        }
        return orcidData;
      })();
    } else {
      // setOrcidLoading(false);
      dispatch(setOrcid({ loading: false }));
      return {};
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orcidData]);

  useEffect(() => {
    // console.log("Check orcid", checking);
    if (checking) {
      checkOrcid();
    }
  }, [checkOrcid, checking]);

  return null;
}
