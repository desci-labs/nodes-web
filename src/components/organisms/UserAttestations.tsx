import { useEffect, useState } from "react";
// import attestationLogo from "../../../images/attestation.png";
import { query } from "@api/index";
import PopOverBasic from "@components/atoms/PopOverBasic";
import UserAttestationsGrid from "@components/molecules/Attestations/AttestationsGrid";
import AttestationDetails from "@components/molecules/Attestations/AttestationDetails";
import { useUser } from "@src/state/user/hooks";

export interface AttestationMeta {
  id: string;
  metadataUri: string;
  society: {
    id: string;
    metadataUri: string;
  };
}
export interface ResolvedAttestation {
  name: string;
  description: string;
  properties: {
    description: string;
  };
  attestationType: string;
  image: string;
  external_link: string;
}

const fetchUserAttestations = async (walletAddress: string) => {
  interface Tokens {
    tokens: {
      attestation: {
        id: string;
        metadataUri: string;
        society: {
          id: string;
          metadataUri: string;
        };
      };
    }[];
  }

  const resp = (await query(`
query WalletTokens{
  tokens(where: { active: true, owner: "${walletAddress}"   }) {
    attestation {
      id
      metadataUri
      society {
        id
        metadataUri
      }
    }
  } 
}
 `)) as Tokens;
  return resp;
};

const UserAttestations = () => {
  const [metaAttestations, setMetaAttestations] = useState<AttestationMeta[]>(
    []
  );
  const { wallets } = useUser();
  const [selectedAttestation, setSelectedAttestation] =
    useState<AttestationMeta | null>(null);

  useEffect(() => {
    const handleAttestations = async (walletAddress: string) => {
      const rawUserAttestations = (
        await fetchUserAttestations(walletAddress)
      ).tokens.map((token) => token.attestation);
      setMetaAttestations(rawUserAttestations);
    };

    if (wallets?.length > 0) {
      handleAttestations(wallets[0]?.address);
      // handleAttestations("0x154b90ace0c1693b40ff17153226cf74f89b806d");
    }
  }, [wallets]);

  return (
    <>
      <div className="flex flex-col h-fit w-full gap-8 py-8 bg-neutrals-black-2 border-l px-3 border-[#333639] h-[100%] fixed z-1" />
      <div className="flex flex-col h-fit w-full gap-4 py-4 bg-neutrals-black-2 border-l px-3 border-[#333639] h-[100%] relative z-2">
        <div className="max-w-[270px] mx-auto pb-8">
          <PopOverBasic
            isVisible={Boolean(selectedAttestation)}
            title=""
            onClose={() => setSelectedAttestation(null)}
          >
            <div>
              {selectedAttestation && (
                <AttestationDetails metaAttestation={selectedAttestation} />
              )}
            </div>
          </PopOverBasic>

          <div className="flex flex-col mb-2">
            <h1 className="text-[18px] font-semibold text-white">
              Attestations
            </h1>
            <p className="text-neutrals-gray-5 text-[10px] font-semibold">
              Reputation tokens linked to your digital signature
            </p>
          </div>

          <div className="sm:mr-[16px] sm:mx-[inherit] sm:max-w-none">
            <UserAttestationsGrid
              metaAttestations={metaAttestations}
              onAttestationClick={(metaAttestation: AttestationMeta) => {
                setSelectedAttestation(metaAttestation);
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default UserAttestations;
