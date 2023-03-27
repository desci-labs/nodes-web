import { addComponentToDraft } from "@api/index";
import PrimaryButton from "@components/atoms/PrimaryButton";
import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import { capitalize, cleanupManifestUrl } from "@components/utils";
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
  ResearchObjectComponentType,
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
} from "@src/state/nodes/viewer";
import Modal, { ModalProps } from "@src/components/molecules/Modal/Modal";

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
    privCidMap,
    setPrivCidMap,
    addComponentType,
    addComponentSubType,
    setIsAddingComponent,
    setIsAddingSubcomponent,
    setAddComponentType,
    setAddComponentSubType,
  } = useManuscriptController([
    "privCidMap",
    "addComponentType",
    "addComponentSubType",
  ]);

  const dispatch = useSetter();
  const { manifest: manifestData, currentObjectId } = useNodeReader();
  const [loading, setLoading] = useState(false);
  const [urlOrDoi, setUrlOrDoi] = useState<string>();
  const [error, setError] = useState<string>();
  const [customSubtype, setCustomSubtype] = useState<string>("");

  const [fileLink, setFileLink] = useState<string>();

  const navigate = useNavigate();

  const close = (force: boolean) => {
    setError(undefined);
    setUrlOrDoi("");
    setIsAddingComponent(false);
    setIsAddingSubcomponent(false);
    setAddComponentType(null);
    setAddComponentSubType(null);
    setLoading(false);
    setFileLink(undefined);
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
    if (
      addComponentType === ResearchObjectComponentType.CODE &&
      urlOrDoi &&
      urlOrDoi.indexOf("github.com")
    ) {
      if (urlOrDoi.split("github.com/")[1].split("/").length > 1) {
        const [, , repo] = urlOrDoi.match(
          // eslint-disable-next-line no-useless-escape
          /github.com[\/:]([^\/]+)\/([^\/^.]+)/
        )!;
        if (repo) return repo;
      }
      setError("Invalid Repo Link");
    }

    if (!addComponentSubType) return customSubtype;

    return addComponentSubType;
  };

  const renderComponentFlow = () => {
    switch (addComponentType) {
      case ResearchObjectComponentType.PDF:
        return (
          <AddDocumentComponent
            subType={addComponentSubType}
            setSubType={setAddComponentSubType}
            customSubtype={customSubtype}
            setCustomSubtype={setCustomSubtype}
            setFileLink={setFileLink}
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
            subType={addComponentSubType}
            setSubType={setAddComponentSubType}
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
        return !(fileLink?.length || (urlOrDoi && urlOrDoi.length));
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
      const componentTitle = extractComponentTitle();
      console.log("ADD DATA", manifestData, currentObjectId, {
        manifest: manifestData!,
        uuid: currentObjectId!,
        componentUrl: urlOrDoi! || fileLink!,
        title: componentTitle,
        componentType: addComponentType!,
        componentSubtype: addComponentSubType || undefined,
      });
      const res = await addComponentToDraft({
        manifest: manifestData!,
        uuid: currentObjectId!,
        componentUrl: urlOrDoi! || fileLink!,
        title: componentTitle,
        componentType: addComponentType!,
        componentSubtype: addComponentSubType || undefined,
      });

      const manifestUrl = cleanupManifestUrl(res.uri || res.manifestUrl);
      let localManifestData = null;
      if (res.manifestData) {
        dispatch(setManifest(res.manifestData));
        localManifestData = res.manifestData;

        //update priv cids
        const latestComponent =
          res.manifestData.components[res.manifestData.components.length - 1];
        const latestCompCid = latestComponent.payload?.url
          ? latestComponent.payload.url
          : latestComponent.payload?.cid
          ? latestComponent.payload.cid
          : null;
        if (latestCompCid) {
          setPrivCidMap({ ...privCidMap, [latestCompCid]: true });
        }
      } else {
        const { data } = await axios.get(manifestUrl);
        dispatch(setManifest(data));
        localManifestData = data;
        // update priv cids
        const latestComponent = data.components[data.components.length - 1];
        const latestCompCid = latestComponent.payload?.url
          ? latestComponent.payload.url
          : latestComponent.payload?.cid
          ? latestComponent.payload.cid
          : null;
        if (latestCompCid) {
          setPrivCidMap({ ...privCidMap, [latestCompCid]: true });
        }
      }
      localStorage.setItem("manifest-url", manifestUrl);
      if (!currentObjectId) {
        /**
         * If adding this component triggers a new node creation, redirect to the new node
         */

        dispatch(setCurrentObjectId(res.node.uuid));
        navigate(`/nodes/${RESEARCH_OBJECT_NODES_PREFIX}${res.node.uuid}`);
      }

      /**
       * Force newly added component to appear
       */

      const components = localManifestData.components!;
      dispatch(setComponentStack([components[components.length - 1]]));

      close(true);
    } catch (err) {
      let resp = (err as any).response;
      const errorMessage = resp.data.error;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      $maxWidth={550}
      onDismiss={() => close(false)}
      isOpen={props.isOpen}
      // style={{
      //   width: 500,
      //   maxWidth: "100%",
      //   margin: "3rem 0.75rem",
      //   overflow: "visible",
      // }}
      // containerStyle={{
      //   backgroundColor: "#3A3A3ABF",
      // }}
      // zIndex={105}
      // displayCloseIcon={false}
      // className="rounded-lg bg-zinc-100 dark:bg-zinc-900"
    >
      <div className="px-6 py-5 min-h-[280px]">
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
