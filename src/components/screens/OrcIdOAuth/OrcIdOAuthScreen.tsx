import { useEffect, useState } from "react";
import queryString from "query-string";
import { updateProfile } from "@api/index";
import { OrcData, storeOrcDataLocally } from "@src/lib/orcIdLib";
import { api } from "@src/state/api";
import { tags } from "@src/state/api/tags";
import { useSetter } from "@src/store/accessors";

export const OrcIdConnectUpdateProfile = () => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storeOrcIdInUserProfile = async (orcId: string) => {
      setIsLoading(true);
      await updateProfile({ orcid: orcId });
      setIsLoading(false);
      window.close();
    };

    const queryStringParams = queryString.parse(window.location.search);
    const orcData = JSON.parse(
      atob(queryStringParams.orcData as string)
    ) as OrcData;

    if (orcData) {
      storeOrcDataLocally(orcData);
      storeOrcIdInUserProfile(orcData.orcid);
    }
  }, []);

  return (
    <div className="h-[50vw] bg-black text-white flex justify-center place-items-center">
      <p className="text-white font-bold">
        {isLoading ? "Loading..." : "Success"}
      </p>
    </div>
  );
};

export const OrcIdAuthParseJwt = () => {
  const dispatch = useSetter();

  const [isLoading] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      dispatch(api.util.invalidateTags([{ type: tags.user }]));
      console.log("[OrcIdAuthParseJwt]::Refresh User data");
      window.close();
    };

    const queryStringParams = queryString.parse(window.location.search);
    const orcData = JSON.parse(
      atob(queryStringParams.orcData as string)
    ) as OrcData;

    if (orcData) {
      storeOrcDataLocally(orcData);
      if (orcData.jwtToken) {
        localStorage.setItem("auth", orcData.jwtToken);
      }
      fetchUserProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="h-[50vw] bg-black text-white flex justify-center place-items-center">
      <p className="text-white font-bold">
        {isLoading ? "Loading..." : "Success"}
      </p>
    </div>
  );
};
