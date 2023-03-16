import DefaultSpinner from "@components/atoms/DefaultSpinner";
import PrimaryButton from "@components/atoms/PrimaryButton";
import { EMPTY_FUNC } from "@components/utils";
import { IconX } from "@icons";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import PopoverFooter from "@components/molecules/Footer";
import { DataComponent, ResearchObjectV1 } from "@desci-labs/desci-models";

import PopOver from "@components/organisms/PopOver";

import {
  DatasetMetadataInfo,
  MetaStaging,
} from "@components/organisms/PaneDrive";
import useSaveManifest from "@src/hooks/useSaveManifest";
import { ComponentMetadataForm } from "./DatasetMetadataForm";
import OverwriteMetadataDialog from "./OverwriteMetadataDialog";
import {
  findAndInheritSubMetadata,
  rootComponentPaths,
} from "@src/components/driveUtils";
import { FileType } from "@src/components/organisms/Drive";
import { useNodeReader } from "@src/state/nodes/hooks";

export const DATASET_METADATA_FORM_DEFAULTS = {
  title: "",
  ontologyPurl: "",
  controlledVocabTerms: [],
  keywords: [],
  description: "",
  licenseType: "",
};

interface DriveDatasetMetadataPopoverProps {
  metaStaging: MetaStaging[];
  currentObjectId: string;
  manifestData: ResearchObjectV1;
  isVisible: boolean;
  mode: string;
  onClose?: () => void;
  datasetMetadataInfoRef: React.MutableRefObject<DatasetMetadataInfo>;
}

const defaultProps = {
  onClose: EMPTY_FUNC,
};

const DriveDatasetMetadataPopOver = (
  props: DriveDatasetMetadataPopoverProps & typeof defaultProps
) => {
  const { publicView } = useNodeReader();
  const { saveManifest, isSaving } = useSaveManifest();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [componentIndexes, setComponentIndexes] = useState<
    number[] | undefined
  >(undefined);
  const [showOverwriteDialog, setShowOverwriteDialog] =
    useState<boolean>(false);
  const [overWrite, setOverWrite] = useState<boolean>(false);

  const manifestData = props.manifestData;
  const currentObjectId = props.currentObjectId;
  const mode = props.mode;

  const rootCid = props.datasetMetadataInfoRef.current.rootCid;

  const hasDirs = useMemo(() => {
    return props.metaStaging.some(
      (stagedObj) => stagedObj.file.contains && stagedObj.file.contains.length
    );
  }, [props.metaStaging]);

  //find dataset ID
  useEffect(() => {
    if (manifestData && currentObjectId) {
      //for component level objects
      // debugger;
      if (!rootCid) {
        const stagingCids = props.metaStaging.map((obj) => obj.file.cid);
        const cIndexes: number[] = [];

        manifestData.components.forEach((c, i) => {
          if (stagingCids.includes(c.payload.cid)) cIndexes.push(i);
        });

        setComponentIndexes(cIndexes);
        // setComponent(_component);
      }

      //find component index in the manifest to edit subMetadata for
      if (rootCid) {
        // debugger;
        const cIndex = manifestData.components.findIndex(
          (c) => c.payload.cid === rootCid
        );
        setComponentIndexes([cIndex]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentObjectId, manifestData, props.metaStaging]);

  const onSubmit = useCallback(
    async (data: DataComponent["payload"]) => {
      // console.log("[DRIVE METADATA] ON SUBMIT HIT");
      // debugger;
      if (manifestData && componentIndexes?.length) {
        if (props.metaStaging.length !== 1) delete data.title;
        const manifestDataClone = { ...manifestData };

        //handle overwriting, both normal metadata and submetadata
        if (overWrite) {
          componentIndexes.forEach((idx) => {
            props.metaStaging.forEach((file) => {
              const subMeta =
                manifestDataClone.components[idx].payload.subMetadata;

              const splitPath = file.file!.path!.split("/");
              if (rootComponentPaths.some((p: string) => p === splitPath[0]))
                splitPath.splice(0, 1);
              const neutralPath = splitPath.join("/");

              const removeMetaKeys = Object.keys(subMeta).filter((k) =>
                k.includes(neutralPath)
              );
              removeMetaKeys.forEach((k) => delete subMeta[k]);
            });
          });
        }

        //regular metadata
        if (!rootCid) {
          componentIndexes.forEach((cI) => {
            const newPayload = {
              ...manifestData?.components[cI].payload,
              ...data,
            };
            manifestDataClone.components[cI].payload = newPayload;
          });
        }

        //subMetadata
        if (rootCid) {
          const idx = componentIndexes[0];
          props.metaStaging.forEach((file) => {
            if (file.file.path) {
              const newSubMetadata = {
                ...manifestData?.components[idx].payload.subMetadata[
                  file.file.path
                ],
                ...data,
              };

              manifestDataClone.components[idx].payload.subMetadata[
                file.file.path
              ] = newSubMetadata;
            }
          });
        }

        try {
          await saveManifest(manifestDataClone);

          if (hasDirs) {
            props.metaStaging.forEach((f) => {
              if (f.file.type === FileType.Dir)
                findAndInheritSubMetadata(manifestData, f.file);
            });
          }

          props.metaStaging.forEach((f) => {
            f.file.metadata = data;
          });

          setOverWrite(false);
          setShowOverwriteDialog(false);
          props.onClose();
        } catch (e: any) {
          alert(e.message);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      overWrite,
      props.metaStaging,
      manifestData,
      rootCid,
      componentIndexes,
      hasDirs,
      props,
      currentObjectId,
    ]
  );

  const isVirtualComponent =
    componentIndexes === undefined || !componentIndexes.length;
  if (isVirtualComponent) {
    // console.log("[MD]virtual");
    return <div></div>;
    // return <div className="text-xs bg-red-500">component problem</div>;
  }
  // console.log("[MD]non virtual");

  return (
    <div>
      <PopOver
        {...props}
        style={{
          width: 700,
          marginLeft: 0,
          marginRight: 0,
        }}
        footer={() => (
          <PopoverFooter>
            <PrimaryButton
              onClick={() => {
                // debugger;
                if (publicView) {
                  props.onClose();
                } else {
                  if (hasDirs) {
                    setShowOverwriteDialog(true);
                  } else {
                    //overwriting not an option (file)
                    formRef.current!.submit!();
                  }
                }
              }}
              disabled={isSaving && !publicView}
            >
              {isSaving ? (
                <DefaultSpinner color="black" size={24} />
              ) : mode === "editor" ? (
                hasDirs ? (
                  "Next"
                ) : (
                  "Save"
                )
              ) : (
                "Done"
              )}
            </PrimaryButton>
          </PopoverFooter>
        )}
        containerStyle={{
          backgroundColor: "#3A3A3ABF",
        }}
        onClose={() => {
          // formRef?.current?.reset();
          props.onClose();
        }}
        className={`rounded-lg bg-zinc-100 dark:bg-zinc-900 ${
          showOverwriteDialog ? "hidden" : null
        }`}
      >
        <div className="py-4 px-6 text-neutrals-gray-5">
          <div className="flex flex-row justify-end items-center">
            <IconX
              fill="white"
              width={20}
              height={20}
              className="cursor-pointer"
              onClick={() => {
                props.onClose();
              }}
            />
          </div>

          <div className="px-1">
            <h1 className="text-xl font-bold text-white">Enter Metadata</h1>
            <div className="text-sm ">
              Please fill in the metadata for open access data.
            </div>

            {/**Have to force a re-render with props.isVisible */}
            {/* <PerfectScrollbar className="max-h-[calc(100vh-300px)] h-[calc(100vh-300px)] overflow-y-scroll"> */}
            {props.isVisible && mode === "editor" ? (
              <ComponentMetadataForm
                ref={formRef}
                prepopulate={
                  props.datasetMetadataInfoRef.current.prepopulateMetadata
                }
                prepopulatingFrom={
                  props.datasetMetadataInfoRef.current.prepopulateFromName
                }
                currentObjectId={currentObjectId!}
                onSubmit={onSubmit}
                // setNewMetadata={setNewMetadata}
                loading={isSaving}
                metaStaging={props.metaStaging}
                defaultLicense={props.manifestData.defaultLicense || ""}
              />
            ) : // <ReadOnlyComponent component={component} />
            null}
            {/* </PerfectScrollbar> */}
          </div>
        </div>
      </PopOver>
      {showOverwriteDialog && (
        <OverwriteMetadataDialog
          setShowOverwriteDialog={setShowOverwriteDialog}
          setOverWrite={setOverWrite}
          loading={isSaving}
          formRef={formRef}
          overWrite={overWrite}
        />
      )}
    </div>
  );
};

DriveDatasetMetadataPopOver.defaultProps = defaultProps;

export default DriveDatasetMetadataPopOver;
