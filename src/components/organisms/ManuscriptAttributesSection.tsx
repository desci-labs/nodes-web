import { useState } from "react";
import { IconInfo } from "icons";
import AttributePopOver from "@components/organisms/PopOver/AttributePopOver";
import CollapsibleSection from "@components/organisms/CollapsibleSection";
import TooltipIcon from "@components/atoms/TooltipIcon";

import IconAcmAvailableSmall from "@images/icons/acm/acm-available-hex.png";
import IconAcmAvailableFull from "@images/icons/acm/acm-available-full.png";
import IconAcmReplicatedSmall from "@images/icons/acm/acm-replicated-hex.png";
import IconAcmReplicatedFull from "@images/icons/acm/acm-replicated-full.png";
import IconAcmReproducedSmall from "@images/icons/acm/acm-reproduced-hex.png";
import IconAcmReproduedFull from "@images/icons/acm/acm-reproduced-full.png";
import IconAcmFunctionalSmall from "@images/icons/acm/acm-functional-hex.png";
import IconAcmFunctionalFull from "@images/icons/acm/acm-functional-full.png";
import IconAcmReusableSmall from "@images/icons/acm/acm-reusable-hex.png";
import IconAcmReusableFull from "@images/icons/acm/acm-reusable-full.png";
import ClickableAddIcon from "@components/atoms/ClickableIcon/ClickableAddIcon";
import { ResearchObjectAttributeKey } from "@desci-labs/desci-models";
import { __log } from "@components/utils";
import { useNodeReader } from "@src/state/nodes/hooks";

interface BadgeInfo {
  small: string;
  full: string;
  title: string;
  description: string;
}

export const BADGE_INFO: { [key in ResearchObjectAttributeKey]: BadgeInfo } = {
  available: {
    small: IconAcmAvailableSmall,
    full: IconAcmAvailableFull,
    title: "Artifacts Available",
    description:
      "Author-created artifacts relevant to this paper have been placed on a publically accessible archival repository. A DOI or link to this repository along with a unique identifier for the object is provided.",
  },
  replicated: {
    small: IconAcmReplicatedSmall,
    full: IconAcmReplicatedFull,
    title: "Results Replicated",
    description:
      "The main results of the paper have been independently obtained in a subsequent study by a person or team other than the authors, without the use of author-supplied artifacts.",
  },
  reproduced: {
    small: IconAcmReproducedSmall,
    full: IconAcmReproduedFull,
    title: "Results Reproduced",
    description:
      "The main results of the paper have been obtained in a subsequent study by a person or team other than the authors, using, in part, artifacts provided by the author.",
  },
  functional: {
    small: IconAcmFunctionalSmall,
    full: IconAcmFunctionalFull,
    title: "Artifacts Functional",
    description:
      "The artifacts associated with the research are found to be documented, consistent, complete, exercisable, and include appropriate evidence of verification and validation.",
  },
  reusable: {
    small: IconAcmReusableSmall,
    full: IconAcmReusableFull,
    title: "Artifacts Reusable",
    description:
      "The artifacts associated with the paper are of a quality that significantly exceeds minimal functionality.",
  },
};

const ManuscriptAttributesSection = () => {
  const { mode, manifest: manifestData } = useNodeReader();
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState("");
  const [isEditable, setIsEditable] = useState<boolean>(false);

  // useEffect(() => {
  //   // PRELOAD ATTRIBUTE BADGES
  //   setTimeout(() => {
  //     let toLoad = Object.keys(BADGE_INFO).map((key: any) => {
  //       return (BADGE_INFO as any)[key].full;
  //     });
  //     toLoad = toLoad.concat(
  //       Object.keys(BADGE_INFO).map((key: any) => {
  //         return (BADGE_INFO as any)[key].small;
  //       })
  //     );
  //     toLoad.forEach((url: any) => {
  //       var res = document.createElement("link");
  //       res.rel = "preload";
  //       res.as = "image";
  //       res.href = url;
  //       document.head.appendChild(res);
  //     });
  //   }, 500);
  // }, []);

  if (
    // mode !== "editor" &&
    !manifestData ||
    !manifestData.attributes ||
    !manifestData.attributes.length
  ) {
    return null;
  }

  return (
    <CollapsibleSection
      forceExpand={mode === "editor"}
      title={
        <div className="flex w-full justify-between">
          <div className="flex items-end">
            <span>Attributes</span>
            {mode === "editor" ? (
              <span
                className="text-sm text-[#65C3CA] cursor-pointer ml-1 mb-0.5 font-bold"
                onClick={(e: React.MouseEvent<HTMLSpanElement>) => {
                  e.stopPropagation();
                  setIsEditable(!isEditable);
                }}
              >
                {isEditable ? "Done" : "Edit"}
              </span>
            ) : null}
          </div>
          {mode === "reader" ? (
            <TooltipIcon
              icon={<IconInfo className="fill-black dark:fill-[white]" />}
              id="manuscript-attributes"
              tooltip="Verified Badges"
            />
          ) : null}
        </div>
      }
      collapseIconComponent={
        mode === "editor"
          ? () => {
              return (
                <ClickableAddIcon
                  onClick={(e: React.MouseEvent<HTMLElement>) => {
                    e.stopPropagation();
                    __log("add attribute");
                  }}
                />
              );
            }
          : undefined
      }
      className="mb-4 select-none"
      startExpanded={false}
    >
      <div className="flex items-center gap-2 min-h-[51px]">
        {manifestData &&
          manifestData.attributes &&
          manifestData.attributes.map((attr: any, index: number) => (
            <img
              className={`cursor-pointer ${attr.value ? "" : "opacity-20"}`}
              src={((BADGE_INFO as any)[attr.key] as any).small}
              key={attr.key}
              style={{ width: 45 }}
              alt=""
              onClick={() => {
                setIsOpen(true);
                setSelectedBadge(attr.key);
                setValue(attr.value);
              }}
            />
          ))}
      </div>
      <AttributePopOver
        isVisible={isOpen}
        key={selectedBadge}
        value={value}
        data={(BADGE_INFO as any)[selectedBadge]}
        onClose={() => setIsOpen(false)}
        style={{
          backgroundColor: "#EFEFEF",
          color: "black",
          width: 600,
          margin: "3rem 0.75rem",
        }}
        className="py-3 px-6 rounded-lg"
      />
    </CollapsibleSection>
  );
};

export default ManuscriptAttributesSection;
