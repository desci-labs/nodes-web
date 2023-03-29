import Identicon from "@components/atoms/Identicon";
import TooltipIcon from "@components/atoms/TooltipIcon";
import CollapsibleSection from "@components/organisms/CollapsibleSection";
import { IconInfo } from "icons";
import Section from "../../Section";
import SectionHeader from "../../Section/SectionHeader";
import { ResearchObjectV1Author } from "@desci-labs/desci-models";
import ClickableAddIcon from "@components/atoms/ClickableIcon/ClickableAddIcon";
import toast from "react-hot-toast";
import { useNodeReader } from "@src/state/nodes/hooks";
import { useState } from "react";

interface CreditsProps {}

const mockAuthors: ResearchObjectV1Author[] = [
  {
    name: "John Daily",
    orcid: "John Daily",
  },
  {
    name: "Mary Maller",
    orcid: "Mary Maller",
  },
  {
    name: "Nicolas Gailly",
    orcid: "Nicolas Gailly",
  },
  {
    name: "Anca Nitulescu",
    orcid: "Anca Nitulescu",
  },
];

const Credits = (props: CreditsProps) => {
  const { manifest: manifestData, mode } = useNodeReader();
  const [isEditable, setIsEditable] = useState<boolean>(false);

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
          <div>
            <span>Credits</span>
            {isEditing ? (
              <span
                className="text-xs text-tint-primary hover:text-tint-primary-hover cursor-pointer ml-1 mb-0.5 font-bold"
                onClick={(e: React.MouseEvent<HTMLSpanElement>) => {
                  e.stopPropagation();
                  setIsEditable(!isEditable);
                }}
              >
                {isEditable ? "Done" : "Edit"}
              </span>
            ) : (
              <TooltipIcon
                icon={<IconInfo className="fill-black dark:fill-[white]" />}
                id="contributor-authors"
                tooltip="Linked Authors"
              />
            )}
          </div>
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
                  }}
                />
              );
            }
          : undefined
      }
      className="mb-4"
    >
      <div className="flex flex-col gap-3 py-2 ">
        {manifestData &&
          mockAuthors.map((author: ResearchObjectV1Author, index: number) => (
            <Section
              key={index}
              header={() => (
                <SectionHeader
                  title={() => (
                    <div className="flex flex-col">
                      <span className="text-sm font-bold">{author.name}</span>
                      <span className="text-xs text-gray-400">Author</span>
                    </div>
                  )}
                  action={() => <Identicon string={author.name} size={20} />}
                  className="bg-zinc-100 dark:bg-muted-900"
                  containerStyle={{ alignItems: "start" }}
                />
              )}
            >
              {/* <div className="flex flex-row px-4 py-2 justify-end gap-2 w-full">
                <OpenLinkPillButton
                  link={author.orcid || "https://orcid.com"}
                  leftIcon={() => <IconOrcid />}
                />
              </div> */}
            </Section>
          ))}
      </div>
    </CollapsibleSection>
  );
};

export default Credits;
