import Identicon from "@components/atoms/Identicon";
import OpenLinkPillButton from "@components/atoms/PillButton/OpenLinkPillButton";
import TooltipIcon from "@components/atoms/TooltipIcon";
import CollapsibleSection from "@components/organisms/CollapsibleSection";
import { IconInfo, IconOrcid } from "icons";
import Section from "../../Section";
import SectionHeader from "../../Section/SectionHeader";
import { ResearchObjectV1Author } from "@desci-labs/desci-models";
import ClickableAddIcon from "@components/atoms/ClickableAddIcon";
import toast from "react-hot-toast";
import { useNodeReader } from "@src/state/nodes/hooks";

interface ContributorsSectionProps {}

const ContributorsSection = (props: ContributorsSectionProps) => {
  const { manifest: manifestData, mode } = useNodeReader();

  if (
    mode !== "editor" &&
    (!manifestData || !manifestData.authors || !manifestData.authors.length)
  ) {
    return null;
  }

  const isEditing = mode === "editor";

  return (
    <CollapsibleSection
      startExpanded={true}
      title={
        <div className="flex w-full justify-between">
          Contributors
          {!isEditing ? (
            <TooltipIcon
              icon={<IconInfo className="fill-black dark:fill-[white]" />}
              id="contributor-authors"
              tooltip="Linked Authors"
            />
          ) : null}
        </div>
      }
      collapseIconComponent={
        isEditing
          ? () => {
              return (
                <ClickableAddIcon
                  onClick={(e: React.MouseEvent<HTMLElement>) => {
                    e.stopPropagation();
                    toast.error("Coming Soon", {
                      duration: 2000,
                      position: "top-center",
                      style: {
                        marginTop: 60,
                        borderRadius: "10px",
                        background: "#111",
                        color: "#fff",
                      },
                    });
                    // setIsModalVisible(true);
                  }}
                />
              );
            }
          : undefined
      }
      className="mb-4"
    >
      <div className="flex flex-col gap-3 ">
        {manifestData &&
          manifestData.authors &&
          manifestData.authors.map(
            (contributor: ResearchObjectV1Author, index: number) => (
              <Section
                key={index}
                header={() => (
                  <SectionHeader
                    title={() => (
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">
                          {contributor.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          {contributor.role}
                        </span>
                      </div>
                    )}
                    action={() => <Identicon string={contributor.name} />}
                    className="bg-zinc-100 dark:bg-muted-900"
                  />
                )}
              >
                <div className="flex flex-row px-4 py-2 justify-end gap-2 w-full">
                  <OpenLinkPillButton
                    link={contributor.orcid || "https://orcid.com"}
                    leftIcon={() => <IconOrcid />}
                  />
                </div>
              </Section>
            )
          )}
      </div>
    </CollapsibleSection>
  );
};

export default ContributorsSection;
