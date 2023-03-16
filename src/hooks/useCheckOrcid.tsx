import { useSetter } from "@src/store/accessors";
import { useOrcidData } from "@src/state/preferences/hooks";
import { setOrcid } from "@src/state/preferences/preferencesSlice";
import { useEffect, useRef, useState } from "react";

export default function useCheckOrcid() {
  const dispatch = useSetter();
  const { loading, orcidData } = useOrcidData();

  let componentMounted = useRef(true);
  const [initialized] = useState(false);

  useEffect(() => {
    if (componentMounted.current) {
      if (!initialized) {
        // checkOrcid();
        !loading && dispatch(setOrcid({ checking: true }));
      }
    }

    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      componentMounted.current = false;
    };
  }, [dispatch, initialized, loading]);

  return { orcidData, loading };
}
