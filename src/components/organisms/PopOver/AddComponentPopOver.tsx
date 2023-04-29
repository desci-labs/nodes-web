import { addComponentToDraft } from "@api/index";
import PrimaryButton from "@components/atoms/PrimaryButton";
import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import {
  capitalize,
  cleanupManifestUrl,
  extractCodeRepoName,
} from "@components/utils";
import {
  IconCodeBracket,
  IconDataSquare,
  IconDocument,
  IconRightArrowThin,
  IconX,
} from "@icons";
import axios from "axios";
import { useEffect, useState } from "react";
import AddDocumentComponent from "@components/molecules/AddComponentFlow/AddDocumentComponent";
import AddCodeComponent from "@components/molecules/AddComponentFlow/AddCodeComponent";

import { useNavigate } from "react-router-dom";
import {
  RESEARCH_OBJECT_NODES_PREFIX,
  ResearchObjectComponentLinkSubtype,
  ResearchObjectComponentType,
  ResearchObjectV1,
} from "@desci-labs/desci-models";
import AddLinkComponent from "@components/molecules/AddComponentFlow/AddLinkComponent";
import AddDataComponent from "@components/molecules/AddComponentFlow/AddDataComponent";
import { SpinnerCircular } from "spinners-react";
import { useNodeReader } from "@src/state/nodes/hooks";
import { useSetter } from "@src/store/accessors";
import {
  setComponentStack,
  setCurrentObjectId,
  setManifest,
} from "@src/state/nodes/nodeReader";
import Modal, { ModalProps } from "@src/components/molecules/Modal";
import { useDispatch } from "react-redux";
import {
  addExternalLinkThunk,
  addFilesToDrive,
} from "@src/state/drive/driveSlice";
import { useFileUpload } from "react-use-file-upload/dist/lib/useFileUpload";
import { ExternalUrl } from "@src/state/drive/types";
import { useDrive } from "@src/state/drive/hooks";
import {
  DRIVE_FULL_EXTERNAL_LINKS_PATH,
  findUniqueName,
} from "@src/state/drive/utils";
import toast from "react-hot-toast";

export const componentData = {
  [ResearchObjectComponentType.PDF]: {
    name: "Document",
    avatar: <IconDocument className="mx-auto" />,
  },

  // {
  //   id: 3,
  //   name: "Figure",
  //   avatar: <IconFigureComponent className="mx-auto h-[15px] w-[15px]" />,
  // },
  [ResearchObjectComponentType.CODE]: {
    name: "Code",
    avatar: <IconCodeBracket className="mx-auto h-[15px] w-[15px]" />,
  },
  [ResearchObjectComponentType.DATA]: {
    name: "Data",
    avatar: <IconDataSquare className="mx-auto h-[8px] w-[8px]" />,
  },
  [ResearchObjectComponentType.LINK]: {
    name: "Link",
    avatar: <IconDataSquare className="mx-auto h-[8px] w-[8px]" />,
  },
  // {
  //   id: 2,
  //   name: "Video",
  //   avatar: (
  //     <IconPlay className="mx-auto relative h-[12px] w-[12px] -right-0.5 " />
  //   ),
  // },
  // {
  //   id: 6,
  //   name: "Code + Data",
  //   avatar: <IconCode className="mx-auto" />,
  // },
  // {
  //   id: 7,
  //   name: "Public API",
  //   avatar: <IconCodeDataEnv className="mx-auto" />,
  // },
};

//To add a new type to the popover, add the new component to the renderComponentFlow() fn,
//and add its disabled conditions in the disabledConditions() fn
const AddComponentPopOver = (
  props: ModalProps & { onClose: (force: boolean) => void }
) => {
  const {
    addComponentType,
    addComponentSubtype,
    setIsAddingComponent,
    setIsAddingSubcomponent,
    setAddComponentType,
    setAddComponentSubtype,
    addFilesWithoutContext,
  } = useManuscriptController([
    "addComponentType",
    "addComponentSubtype",
    "addFilesWithoutContext",
  ]);

  const dispatch = useSetter();
  const { manifest: manifestData, currentObjectId } = useNodeReader();
  const [loading, setLoading] = useState(false);
  const [urlOrDoi, setUrlOrDoi] = useState<string>();
  const [error, setError] = useState<string>();
  const [customSubtype, setCustomSubtype] = useState<string>("");
  const { nodeTree, currentDrive } = useDrive();
  // const [fileLink, setFileLink] = useState<string>();
  const { files, clearAllFiles, setFiles } = useFileUpload();

  const navigate = useNavigate();

  const close = (force: boolean) => {
    setError(undefined);
    setUrlOrDoi("");
    setIsAddingComponent(false);
    setIsAddingSubcomponent(false);
    setAddComponentType(null);
    setAddComponentSubtype(null);
    setLoading(false);
    // setFileLink(undefined);
    props.onClose(force);
  };

  useEffect(() => {
    if (addComponentType === ResearchObjectComponentType.DATA) {
      setTimeout(() => {
        dispatch(setComponentStack([]));
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addComponentType]);

  const extractComponentTitle = (): string => {
    if (addComponentType === ResearchObjectComponentType.CODE && urlOrDoi) {
      const repo = extractCodeRepoName(urlOrDoi);
      if (repo) return repo;
      setError("Invalid Repo Link");
    }

    if (!addComponentSubtype) return customSubtype;

    return addComponentSubtype;
  };

  const renderComponentFlow = () => {
    switch (addComponentType) {
      case ResearchObjectComponentType.PDF:
        return (
          <AddDocumentComponent
            subtype={addComponentSubtype}
            setSubtype={setAddComponentSubtype}
            customSubtype={customSubtype}
            setCustomSubtype={setCustomSubtype}
            files={files}
            clearAllFiles={clearAllFiles}
            setFiles={setFiles}
            // setFileLink={setFileLink}
            urlOrDoi={urlOrDoi}
            setUrlOrDoi={setUrlOrDoi}
          />
        );
      case ResearchObjectComponentType.CODE:
        return (
          <AddCodeComponent urlOrDoi={urlOrDoi} setUrlOrDoi={setUrlOrDoi} />
        );
      case ResearchObjectComponentType.DATA:
        return (
          <AddDataComponent
            close={() => {
              close(false);
            }}
          />
        );
      case ResearchObjectComponentType.LINK:
        return (
          <AddLinkComponent
            url={urlOrDoi}
            setUrl={setUrlOrDoi}
            subtype={addComponentSubtype}
            setSubtype={setAddComponentSubtype}
          />
        );
      default:
        return;
    }
  };

  const disabledConditions = () => {
    if (!addComponentType) return true;
    switch (addComponentType) {
      case ResearchObjectComponentType.PDF:
        return !(files.length || (urlOrDoi && urlOrDoi.length));
      case ResearchObjectComponentType.CODE:
        return !(
          addComponentType === ResearchObjectComponentType.CODE &&
          urlOrDoi?.length
        );
      default:
        return false;
    }
  };

  const handleSaveNewComponent = async () => {
    setError(undefined);
    setLoading(true);

    try {
      const componentTitle =
        addComponentType === ResearchObjectComponentType.CODE
          ? extractComponentTitle()
          : null;
      console.log("ADD DATA", manifestData, currentObjectId, {
        manifest: manifestData!,
        uuid: currentObjectId!,
        componentUrl: urlOrDoi! || files!,
        title: componentTitle,
        componentType: addComponentType!,
        componentSubtype: addComponentSubtype || undefined,
      });

      if (addComponentType === ResearchObjectComponentType.LINK) {
        dispatch(
          addExternalLinkThunk({
            name: componentTitle!,
            url: urlOrDoi!,
            subtype: addComponentSubtype as ResearchObjectComponentLinkSubtype,
          })
        );
        const components = manifestData?.components!;
        dispatch(setComponentStack([components[components.length - 1]]));
        close(true);
        return;
      }

      let externalUrl;
      if (urlOrDoi?.length) {
        if (addComponentType === ResearchObjectComponentType.CODE) {
          const extractedName = extractCodeRepoName(urlOrDoi);
          if (extractedName)
            externalUrl = { path: extractedName, url: urlOrDoi };
        }
        if (addComponentType === ResearchObjectComponentType.PDF) {
          const nameCollisions = addFilesWithoutContext
            ? nodeTree?.contains?.map((c) => c.name)
            : currentDrive?.contains?.map((c) => c.name);
          const name = findUniqueName("Research Report", nameCollisions || []);
          externalUrl = { path: name, url: urlOrDoi };
        }
      }

      dispatch(
        addFilesToDrive({
          ...(externalUrl ? { externalUrl } : { files }),
          componentType: addComponentType!,
          componentSubtype: addComponentSubtype || undefined,
          ...(addFilesWithoutContext ? { overwriteContext: "root" } : {}),
          onSuccess: (manifestData: ResearchObjectV1) => {
            /**
             * Force newly added component to appear
             */
            const components = manifestData.components!;
            dispatch(setComponentStack([components[components.length - 1]]));
            close(true);
          },
        })
      );

      const components = manifestData?.components!;
      dispatch(setComponentStack([components[components.length - 1]]));
      close(true);
    } catch (err) {
      let resp = (err as any).response;
      console.error(err);
      const errorMessage = resp.data.error;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal $maxWidth={550} onDismiss={() => close(false)} isOpen={props.isOpen}>
      <div className="px-6 py-5 min-h-[280px] w-[550px]">
        <div className="flex flex-row justify-between items-center">
          <div className="text-2xl font-bold text-white">
            New{" "}
            {addComponentType
              ? capitalize(addComponentType.replace("pdf", "document"))
              : ""}
          </div>
          <IconX
            fill="white"
            width={20}
            height={20}
            className="cursor-pointer"
            onClick={() => {
              close(false);
            }}
          />
        </div>
        <div className="py-2">
          {/* <span className="text-white">{addComponentType}</span> */}
          {renderComponentFlow()}
        </div>
      </div>
      {error ? (
        <div className="text-states-error px-6 pb-3 -mt-7 text-xs">
          Error: {error}
        </div>
      ) : null}
      {addComponentType !== ResearchObjectComponentType.DATA ? (
        <Modal.Footer>
          <PrimaryButton
            disabled={disabledConditions() || loading}
            className={`${
              loading
                ? "-mr-1 !justify-end flex animate-pulse duration-[0] !cursor-default text-neutrals-gray-6 !bg-transparent"
                : ""
            } transition-none w-[161px] flex items-center justify-end gap-2`}
            onClick={handleSaveNewComponent}
          >
            {loading ? (
              <div className="flex flex-row gap-2 items-center">
                Adding <SpinnerCircular color="black" size={20} />
              </div>
            ) : (
              <>
                {loading ? "Adding" : "Add Component"}
                <IconRightArrowThin
                  fill={
                    !disabledConditions()
                      ? "bg-black"
                      : "rgba(195, 195, 195, 1)"
                  }
                />
              </>
            )}
          </PrimaryButton>
        </Modal.Footer>
      ) : null}
    </Modal>
  );
};

export default AddComponentPopOver;
