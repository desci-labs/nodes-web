import { useEffect, useState } from "react";
import { IconArcGrant, IconConferenceKey, IconEthereum, IconInfo } from "icons";
// import SlideDown from "react-slidedown";
// import styled from "styled-components";
import SectionCard from "@components/molecules/SectionCard";
import TooltipIcon from "@components/atoms/TooltipIcon";
import Identicon from "@components/atoms/Identicon";
import OrcidPillButton from "@components/atoms/PillButton/OrcidPillButton";
import DoiPillButton from "@components/atoms/PillButton/DoiPillButton";
import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import PrimaryButton from "@components/atoms/PrimaryButton";
import ValidatePopOver from "./PopOver/ValidatePopOver";
import OpenLinkPillButton from "@components/atoms/PillButton/OpenLinkPillButton";
import { SpinnerCircularFixed } from "spinners-react";
import toast from "react-hot-toast";
import {
  ResearchObjectV1Validation,
  ResearchObjectValidationType,
} from "@desci-labs/desci-models";
import CollapsibleSection from "./CollapsibleSection";
import { useNodeReader } from "@src/state/nodes/hooks";

// const ContentWrapper = styled(SlideDown)`
//   transition-duration: 0.25s;
//   transition-timing-function: ease-in-out;
// `;

let minted: any = {};

const ManuscriptValidationSection = () => {
  const { manifest: manifestData, mode } = useNodeReader();
  const { validations } = useManuscriptController(["validations"]);

  const [allValidations, setAllValidations] = useState<
    ResearchObjectV1Validation[]
  >([]);

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  useEffect(() => {
    if (
      manifestData &&
      validations &&
      validations.length &&
      validations[0].type === ResearchObjectValidationType.GRANT &&
      !validations[0].transactionId
    ) {
      setTimeout(() => {
        const v: ResearchObjectV1Validation = validations[0];
        v.transactionId = "124";

        setAllValidations([
          v,
          ...((manifestData || { validations: [] }).validations || []),
        ]);
        if (!minted[v.transactionId]) {
          toast.success("Replication Grant NFT added to wallet", {
            duration: 5000,
            position: "top-center",
            style: {
              marginTop: 50,
              borderRadius: "10px",
              background: "#333",
              color: "#fff",
            },
          });
          minted[v.transactionId] = true;
        }
      }, 7000);
    }
    setAllValidations([
      ...validations,
      ...((manifestData || { validations: [] }).validations || []),
    ]);
  }, [validations, manifestData]);

  const iconFor = (validation: ResearchObjectV1Validation) => {
    switch (validation.type) {
      case ResearchObjectValidationType.CONFERENCE:
        return (
          <div className="stroke-black dark:stroke-white border-[1px] border-black dark:border-white p-1 rounded-full">
            <IconConferenceKey />
          </div>
        );
      case ResearchObjectValidationType.GRANT:
        return (
          <div className="rounded-full">
            {validation.transactionId ? (
              <IconArcGrant />
            ) : (
              <SpinnerCircularFixed
                size={32}
                thickness={100}
                speed={100}
                color="rgba(110, 171, 177, 1)"
                secondaryColor="rgba(48, 51, 52, 1)"
              />
            )}
          </div>
        );
      default:
        return <Identicon string={validation.title} />;
    }
  };

  const actionIconFor = (validation: ResearchObjectV1Validation) => {
    switch (validation.type) {
      case ResearchObjectValidationType.CONFERENCE:
        return <DoiPillButton link="https://doi.org" />;
      case ResearchObjectValidationType.GRANT:
        return (
          <div className="flex flex-row justify-between items-center bg-[#272727] w-full">
            <div className="text-sm font-bold flex items-center justify-center">
              Grant: <IconEthereum /> {validation!.deposits![0].amount || 0}
            </div>
            {validation.transactionId ? (
              <OpenLinkPillButton
                link="https://etherscan.io/tx/0x67f67e49e2514da6f28af6c012db495b09ead9f9d6b325eece03752c953bcfd1"
                leftIcon={() => <div className="text-xs font-bold">Txn</div>}
              />
            ) : (
              <></>
            )}
          </div>
        );
      default:
        return <OrcidPillButton link="https://google.com" />;
    }
  };

  return (
    <>
      <CollapsibleSection
        forceExpand={mode === "editor"}
        title={
          <div className="flex w-full justify-between">
            <div className="flex items-end">
              <span>Validation</span>
            </div>
            {mode === "reader" ? (
              <TooltipIcon
                icon={<IconInfo className="fill-black dark:fill-[white]" />}
                id="manuscript-validation"
                tooltip="Monetary Validation Grants"
              />
            ) : null}
          </div>
        }
        collapseIconComponent={
          mode === "editor"
            ? () => {
                return (
                  // <ClickableAddIcon
                  //   onClick={(e: React.MouseEvent<HTMLElement>) => {
                  //     e.stopPropagation();
                  //     setIsModalVisible(true);
                  //   }}
                  // />
                  null
                );
              }
            : undefined
        }
        className="mb-4"
      >
        <div className="flex flex-col gap-3 py-0 px-0">
          {mode !== "editor" ? (
            <PrimaryButton
              // disabled={!changesToCommit.length}
              onClick={() => {
                setIsModalVisible(true);
              }}
            >
              Verify
            </PrimaryButton>
          ) : null}
          {allValidations.map(
            (validation: ResearchObjectV1Validation, index: number) => (
              <SectionCard
                key={validation.title}
                headerLeft={() => (
                  <div className="flex flex-col">
                    <span className="text-sm font-bold">
                      {validation.title}
                    </span>
                    <span
                      className="text-[10.5px]"
                      style={{ color: "#969696" }}
                    >
                      {validation.subtitle}
                    </span>
                  </div>
                )}
                headerRight={() => iconFor(validation)}
                controllerRight={() => actionIconFor(validation)}
              />
            )
          )}
        </div>
      </CollapsibleSection>
      <ValidatePopOver
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      />
    </>
  );
};

export default ManuscriptValidationSection;
