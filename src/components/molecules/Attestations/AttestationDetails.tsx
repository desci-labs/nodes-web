import { useEffect, useState } from "react";
import axios from "axios";
import { IconViewLink } from "@icons";

import {
  AttestationMeta,
  ResolvedAttestation,
} from "@components/organisms/UserAttestations/UserAttestations";

interface ResolvedSociety {
  name: string;
  symbol: string;
  description: string;
  properties: {
    description: string;
  };
  banner: string;
  image: string;
  external_link: string;
}

const AttestationDetails = ({
  metaAttestation,
}: {
  metaAttestation: AttestationMeta;
}) => {
  const baseSbtAttestationsUrl =
    "https://soulbound-git-dev-desci-labs.vercel.app/attestations/";

  const [resolvedAttestation, setResolvedAttestation] =
    useState<ResolvedAttestation | null>(null);
  const [resolvedSociety, setResolvedSociety] =
    useState<ResolvedSociety | null>(null);

  useEffect(() => {
    const fetchAttestation = async (url: string) => {
      const response = await axios.get<ResolvedAttestation>(url);
      setResolvedAttestation(response.data);
    };

    if (metaAttestation) {
      fetchAttestation(metaAttestation.metadataUri);
    }
  }, [metaAttestation]);

  useEffect(() => {
    const fetchSociety = async (url: string) => {
      const response = await axios.get<ResolvedSociety>(url);
      setResolvedSociety(response.data);
    };

    if (metaAttestation) {
      fetchSociety(metaAttestation.society.metadataUri);
    }
  }, [metaAttestation]);

  if (!metaAttestation) return null;

  return (
    <>
      <div className="flex flex-col justify-center items-center">
        <div className="w-[140px] h-[140px] mt-10 flex">
          <div className="border-solid border-[#00E3FF] border-4 flex">
            <img
              className=" place-self-center"
              src={resolvedAttestation?.image}
              width={"100%"}
              height="auto"
              alt="Attestation"
            />
          </div>
        </div>

        <div className="pt-6 text-center">
          <h2 className="text-[24px] font-bold">{resolvedAttestation?.name}</h2>
          <p className="text-[16px] text-neutrals-gray-6 mt-3">
            The owner of this badge is a member of the {resolvedSociety?.name}.
          </p>
        </div>

        <a
          target="_blank"
          rel="noreferrer"
          href={`${baseSbtAttestationsUrl}/${metaAttestation.id}?address=${metaAttestation.society.id}`}
        >
          <div className="mt-8 min-w-[180px] px-3 py-3 bg-neutrals-gray-1 rounded-md flex flex-row justify-between">
            <span className="text-[16px] text-neutrals-white">
              View SBT Specs
            </span>
            <IconViewLink
              className="text-neutrals-white"
              width={20}
              height={20}
              color="#fff"
              fill="#fff"
            />
          </div>
        </a>
      </div>
    </>
  );
};

export default AttestationDetails;
