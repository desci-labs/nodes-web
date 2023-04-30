import { useEffect, useState } from "react";
import cx from "classnames";
import axios from "axios";
import ReactTooltip from "react-tooltip";

import {
  AttestationMeta,
  ResolvedAttestation,
} from "@components/organisms/UserAttestations/UserAttestations";

const AttestationTile = ({
  metaAttestation,
}: {
  metaAttestation?: AttestationMeta;
}) => {
  const [resolvedAttestation, setResolvedAttestation] =
    useState<ResolvedAttestation | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAttestation = async (url: string) => {
      setIsLoading(true);
      const response = await axios.get<ResolvedAttestation>(url);
      setResolvedAttestation(response.data);
      setIsLoading(false);
    };

    if (metaAttestation) {
      fetchAttestation(metaAttestation.metadataUri);
    }
  }, [metaAttestation]);

  const baseTile = cx(
    { "animate-pulse": isLoading },
    "w-[40px] h-[40px] bg-neutrals-gray-1 border-solid rounded-lg border border-neutrals-gray-2"
  );

  if (!resolvedAttestation) return <div className={baseTile}></div>;

  const id = resolvedAttestation?.name;
  return (
    <>
      <ReactTooltip id={id} type="dark" effect="solid" place="bottom">
        <span>{resolvedAttestation?.name}</span>
      </ReactTooltip>
      <div
        data-tip
        data-for={id}
        className={cx(
          baseTile,
          "p-[10px] flex hover:border hover:border-white hover:cursor-pointer"
        )}
      >
        <div className="border-solid border-[#00E3FF] border flex">
          <img
            className=" place-self-center"
            src={resolvedAttestation?.image}
            width={"100%"}
            height="auto"
            alt="Attestation"
          />
        </div>
      </div>
    </>
  );
};
export default AttestationTile;
