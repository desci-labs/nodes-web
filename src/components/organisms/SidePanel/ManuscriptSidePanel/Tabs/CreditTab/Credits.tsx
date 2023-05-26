import Identicon from "@components/atoms/Identicon";
import TooltipIcon from "@components/atoms/TooltipIcon";
import CollapsibleSection from "@components/organisms/CollapsibleSection";
import { IconCirclePlus, IconDeleteForever, IconInfo, IconPen } from "icons";
import Section from "@src/components/organisms/SidePanel/ManuscriptSidePanel/Section";
import SectionHeader from "@src/components/organisms/SidePanel/ManuscriptSidePanel/Section/SectionHeader";
import { ResearchObjectV1Author } from "@desci-labs/desci-models";
import { useNodeReader } from "@src/state/nodes/hooks";
import { PropsWithChildren, useState } from "react";
import CreditsModal from "@src/components/organisms/PopOver/CreditsModal/CreditsModal";
import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import { useSetter } from "@src/store/accessors";
import { removeAuthor, saveManifestDraft } from "@src/state/nodes/nodeReader";
import ButtonSecondary from "@src/components/atoms/ButtonSecondary";
import PreviewModal from "@src/components/organisms/PopOver/CreditsModal/PreviewModal";

interface CreditsProps {}

const Credits = (props: CreditsProps) => {
  const dispatch = useSetter();
  const { manifest: manifestData, mode, publicView } = useNodeReader();
  const [isEditable, setIsEditable] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>();

  if (
    mode !== "editor" &&
    (!manifestData || !manifestData.authors || !manifestData.authors.length)
  ) {
    return null;
  }

  const isEditing = mode === "editor";

  const handleDelete = (authorIndex: number) => {
    dispatch(removeAuthor({ authorIndex }));
    dispatch(saveManifestDraft({}));
  };

  return (
    <CollapsibleSection
      startExpanded={true}
      title={
        <div className="flex w-full justify-between">
          <div>
            <span>Credit</span>
            {!publicView && isEditing && manifestData?.authors?.length ? (
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
                icon={
                  <IconInfo
                    className="fill-black dark:fill-[white] top-0.5 relative"
                    height={16}
                  />
                }
                id="contributor-authors"
                tooltip="Linked Authors"
              />
            )}
          </div>
        </div>
      }
      className="mb-4"
    >
      <div className="flex flex-col gap-3 py-2 ">
        {isEditing ? (
          <ButtonSecondary
            onClick={() => setIsOpen(true)}
            className="group mx-[1px]"
          >
            <IconCirclePlus className="group-hover:fill-black fill-white transition-colors" />
            Credit Contributor
          </ButtonSecondary>
        ) : null}
        {manifestData?.authors &&
          manifestData?.authors.map(
            (author: ResearchObjectV1Author, index: number) => (
              <CreditsEditorWrapper
                id={index}
                key={index}
                expand={isEditable}
                onHandleEdit={() => {
                  setIsOpen(true);
                  setSelectedIndex(index);
                }}
                onHandleDelete={() => {
                  handleDelete(index);
                }}
              >
                <Section
                  key={index}
                  onClick={() => {
                    setIsPreviewOpen(true);
                    setSelectedIndex(index);
                  }}
                  header={() => (
                    <SectionHeader
                      title={() => (
                        <div className="flex flex-col">
                          <span className="text-sm font-bold">
                            {author.name}
                          </span>
                          <span className="text-xs text-gray-400">
                            {author.role}
                          </span>
                          {author.organizations ? (
                            <span className="text-xs text-gray-400">
                              {author.organizations[0]?.name}
                            </span>
                          ) : null}
                        </div>
                      )}
                      action={() => (
                        <Identicon
                          className="rounded-full"
                          string={author.name}
                          size={20}
                        />
                      )}
                      className="w-full bg-zinc-100 dark:bg-muted-900 gap-1"
                      containerStyle={{ alignItems: "start" }}
                    />
                  )}
                ></Section>
              </CreditsEditorWrapper>
            )
          )}
      </div>
      {isOpen && (
        <CreditsModal
          author={manifestData?.authors?.[selectedIndex ?? -1]}
          id={selectedIndex}
          isOpen={isOpen}
          onDismiss={() => {
            setIsOpen(false);
            setSelectedIndex(undefined);
          }}
        />
      )}
      {isPreviewOpen && (
        <PreviewModal
          author={manifestData?.authors?.[selectedIndex ?? -1]}
          id={selectedIndex}
          isOpen={isPreviewOpen}
          onDismiss={() => {
            setIsPreviewOpen(false);
            setSelectedIndex(undefined);
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
  onHandleDelete: () => void;
}

function CreditsEditorWrapper({
  children,
  id,
  expand = false,
  onHandleEdit,
  onHandleDelete,
}: PropsWithChildren<CreditsEditorProps>) {
  const { dialogs, setDialogs } = useManuscriptController(["dialogs"]);

  const doDelete = () => {
    setDialogs([
      ...dialogs,
      {
        title: "Are you sure?",
        message: "",
        actions: ({ close }) => {
          return (
            <div className="flex gap-2 pt-4">
              <button
                className="text-md cursor-pointer rounded-md shadow-sm text-white bg-black px-3 py-1 hover:bg-neutrals-gray-2"
                onClick={() => {
                  close();
                }}
              >
                Cancel
              </button>

              <button
                className="text-md cursor-pointer rounded-md shadow-sm text-white bg-red-700 px-3 py-1 hover:bg-neutrals-gray-3"
                onClick={() => {
                  onHandleDelete();
                }}
              >
                Delete
              </button>
            </div>
          );
        },
      },
    ]);
  };

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
            onClick={doDelete}
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
