import Identicon from "@components/atoms/Identicon";
import TooltipIcon from "@components/atoms/TooltipIcon";
import CollapsibleSection from "@components/organisms/CollapsibleSection";
import { IconDeleteForever, IconInfo, IconPen } from "icons";
import Section from "../../Section";
import SectionHeader from "../../Section/SectionHeader";
import { ResearchObjectV1Author } from "@desci-labs/desci-models";
import ClickableAddIcon from "@components/atoms/ClickableIcon/ClickableAddIcon";
import { useNodeReader } from "@src/state/nodes/hooks";
import { PropsWithChildren, useState } from "react";
import CreditsModal from "@src/components/organisms/PopOver/CreditsModal/CreditsModal";

interface CreditsProps {}

const mockAuthors: ResearchObjectV1Author[] = [
  {
    name: "John Daily",
    orcid: "1234-1234-1234-1234",
  },
  {
    name: "Mary Maller",
    orcid: "1234-1234-1234-1234",
  },
  {
    name: "Nicolas Gailly",
    orcid: "1234-1234-1234-1234",
  },
  {
    name: "Anca Nitulescu",
    orcid: "1234-1234-1234-1234",
  },
];

const Credits = (props: CreditsProps) => {
  const { manifest: manifestData, mode } = useNodeReader();
  const [isEditable, setIsEditable] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState<
    ResearchObjectV1Author | undefined
  >();

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
      forceExpand={mode === "editor"}
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
              return <ClickableAddIcon onClick={() => setIsOpen(true)} />;
            }
          : undefined
      }
      className="mb-4"
    >
      <div className="flex flex-col gap-3 py-2 ">
        {manifestData &&
          mockAuthors.map((author: ResearchObjectV1Author, index: number) => (
            <CreditsEditorWrapper
              id={index}
              key={index}
              expand={isEditable}
              onHandleEdit={() => {
                setIsOpen(true);
                setSelectedAuthor(author);
              }}
            >
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
                    className="w-full bg-zinc-100 dark:bg-muted-900"
                    containerStyle={{ alignItems: "start" }}
                  />
                )}
              ></Section>
            </CreditsEditorWrapper>
          ))}
      </div>
      {isOpen && (
        <CreditsModal
          author={selectedAuthor}
          isOpen={isOpen}
          onDismiss={() => {
            setIsOpen(false);
            setSelectedAuthor(undefined);
          }}
        />
      )}
    </CollapsibleSection>
  );
};

interface CreditsEditorProps {
  id: number;
  expand: boolean;
  onHandleEdit: () => void;
}

function CreditsEditorWrapper({
  children,
  id,
  expand = false,
  onHandleEdit,
}: PropsWithChildren<CreditsEditorProps>) {
  return (
    <div className="flex transition-all">
      {children}
      <div
        className={`relative flex justify-end items-center transition-all ease-out duration-200 overflow-hidden ${
          expand ? "w-[31px]" : "w-0"
        }`}
        style={{ minWidth: expand ? 31 : 0 }}
      >
        <div className=" flex flex-col gap-2">
          <button
            onClick={onHandleEdit}
            className="flex items-center justify-center cursor-pointer w-6 h-6 rounded-full bg-gray-300 text-black dark:text-white dark:bg-neutrals-black"
          >
            <IconPen stroke="white" width={10} />
          </button>
          <button
            onClick={() => {}}
            className="flex items-center justify-center cursor-pointer w-6 h-6 rounded-full bg-gray-300 text-black dark:text-white dark:bg-neutrals-black"
          >
            <IconDeleteForever
              stroke="rgb(188,107,103)"
              strokeWidth={4}
              width={12}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Credits;
