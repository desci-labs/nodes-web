import { AttestationMeta } from "@components/organisms/UserAttestations/UserAttestations";
import AttestationTile from "./AttestationTile";

const UserAttestationsGrid = ({
  metaAttestations,
  onAttestationClick,
}: {
  metaAttestations: AttestationMeta[];
  onAttestationClick?: (attestation: AttestationMeta) => void;
}) => {
  const maxEmptyTiles = 15;
  const emptyTileLength = maxEmptyTiles - metaAttestations.length;

  return (
    <ul className="grid grid-cols-5 gap-3 list-none">
      {metaAttestations.map((metaAttestation) => (
        <li
          key={metaAttestation.metadataUri}
          onClick={() => {
            if (onAttestationClick) {
              onAttestationClick(metaAttestation);
            }
          }}
        >
          <AttestationTile metaAttestation={metaAttestation} />
        </li>
      ))}
      {Array.from(Array(emptyTileLength)).map((_, index) => (
        <li key={index}>
          <AttestationTile />
        </li>
      ))}
    </ul>
  );
};

export default UserAttestationsGrid;
