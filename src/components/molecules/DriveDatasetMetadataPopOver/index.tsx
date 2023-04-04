import DefaultSpinner from "@components/atoms/DefaultSpinner";
import PrimaryButton from "@components/atoms/PrimaryButton";
import { EMPTY_FUNC } from "@components/utils";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { DataComponent, ResearchObjectV1 } from "@desci-labs/desci-models";

import {
  DatasetMetadataInfo,
  MetaStaging,
} from "@components/organisms/PaneDrive";
import { DatasetMetadataForm } from "./DatasetMetadataForm";
import { OverwriteMetadataForm } from "./OverwriteMetadataDialog";
import {
  findAndInheritSubMetadata,
  rootComponentPaths,
} from "@src/components/driveUtils";
import { FileType } from "@src/components/organisms/Drive";
import { useNodeReader } from "@src/state/nodes/hooks";
import { saveManifestDraft, updateComponent } from "@src/state/nodes/viewer";
import { useSetter } from "@src/store/accessors";
import Modal from "../Modal/Modal";
import { FormProvider, useForm } from "react-hook-form";
import { DriveMetadata } from "@src/components/organisms/Drive/types";
import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";

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
  const dispatch = useSetter();
  const { publicView } = useNodeReader();
  // const { saveManifest, isSaving } = useSaveManifest();
  const [isSaving, setIsSaving] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);
  const [componentIndexes, setComponentIndexes] = useState<
    number[] | undefined
  >(undefined);
  const [showOverwriteDialog, setShowOverwriteDialog] =
    useState<boolean>(false);
  const [overWrite, setOverWrite] = useState<boolean>(false);
  const { dialogs, setDialogs } = useManuscriptController(["dialogs"]);

  const manifestData = props.manifestData;
  const currentObjectId = props.currentObjectId;
  const mode = props.mode;

  const rootCid = props.datasetMetadataInfoRef.current.rootCid;

  const data = props.datasetMetadataInfoRef.current.prepopulateMetadata;

  const methods = useForm<DriveMetadata>({
    defaultValues: {
      title: data?.title || DATASET_METADATA_FORM_DEFAULTS.title,
      ontologyPurl:
        data?.ontologyPurl || DATASET_METADATA_FORM_DEFAULTS.ontologyPurl,
      controlledVocabTerms:
        data?.controlledVocabTerms ||
        DATASET_METADATA_FORM_DEFAULTS.controlledVocabTerms,
      keywords: data?.keywords || DATASET_METADATA_FORM_DEFAULTS.keywords,
      description:
        data?.description || DATASET_METADATA_FORM_DEFAULTS.description,
      licenseType:
        data?.licenseType || DATASET_METADATA_FORM_DEFAULTS.licenseType,
    },
  });

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
      console.log("[DRIVE METADATA] ON SUBMIT HIT");
      // debugger;
      if (manifestData && componentIndexes?.length) {
        if (props.metaStaging.length !== 1) delete data.title;
        const manifestDataClone = { ...manifestData };

        //handle overwriting, both normal metadata and submetadata
        if (overWrite) {
          componentIndexes.forEach((idx) => {
            const payload = { ...manifestDataClone.components[idx].payload };
            const meta: any = {};
            props.metaStaging.forEach((file) => {
              const subMeta =
                manifestDataClone.components[idx].payload.subMetadata;

              const splitPath = file.file!.path!.split("/");
              if (rootComponentPaths.some((p: string) => p === splitPath[0]))
                splitPath.splice(0, 1);
              const neutralPath = splitPath.join("/");

              // const removeMetaKeys = Object.keys(subMeta).filter((k) =>
              //   k.includes(neutralPath)
              // );

              Object.keys(subMeta).forEach((k) => {
                if (!k.includes(neutralPath)) {
                  meta[k] = subMeta[k];
                }
              });
              // removeMetaKeys.forEach((k) => delete subMeta[k]);
            });
            dispatch(
              updateComponent({
                index: idx,
                update: {
                  ...manifestDataClone.components[idx],
                  payload: { ...payload, subMetadata: meta },
                },
              })
            );
          });
        }

        //regular metadata
        if (!rootCid) {
          componentIndexes.forEach((cI) => {
            const newPayload = {
              ...manifestData?.components[cI].payload,
              ...data,
            };
            // console.log("components", manifestDataClone.components[cI]);
            // manifestDataClone.components[cI].payload = newPayload;
            dispatch(
              updateComponent({
                index: cI,
                update: {
                  ...manifestDataClone.components[cI],
                  payload: newPayload,
                },
              })
            );
          });
        }

        //subMetadata
        if (rootCid) {
          const idx = componentIndexes[0];
          let payload = { ...manifestDataClone.components[idx].payload };
          props.metaStaging.forEach((file) => {
            if (file.file.path) {
              const newSubMetadata = {
                ...payload.subMetadata[file.file.path],
                ...data,
              };

              payload = {
                ...payload,
                subMetadata: {
                  ...payload.subMetadata,
                  [file.file.path]: newSubMetadata,
                },
              };
            }
          });
          dispatch(
            updateComponent({
              index: idx,
              update: { ...manifestData.components[idx], payload },
            })
          );
        }

        try {
          // await saveManifest(manifestDataClone);
          setIsSaving(true);
          dispatch(
            saveManifestDraft({
              onError: () => {
                setIsSaving(false);
              },
              onSucess: () => {
                setIsSaving(false);
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
              },
            })
          );
        } catch (e: any) {
          alert(e.message);
          setIsSaving(false);
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

  const onHandleDismiss = () => {
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
                No
              </button>

              <button
                className="text-md cursor-pointer rounded-md shadow-sm text-white bg-red-700 px-3 py-1 hover:bg-neutrals-gray-3"
                onClick={props?.onClose}
              >
                Yes
              </button>
            </div>
          );
        },
      },
    ]);
  };

  return (
    <div>
      <Modal
        {...props}
        isOpen={props.isVisible}
        onDismiss={() =>
          methods.formState.isDirty ? onHandleDismiss() : props?.onClose()
        }
        $scrollOverlay={true}
        $maxWidth={700}
      >
        <FormProvider {...methods}>
          <div
            className={`rounded-lg bg-zinc-100 dark:bg-zinc-900 ${
              showOverwriteDialog ? "hidden" : "animate-fadeIn"
            }`}
          >
            <div className="py-4 px-6 text-neutrals-gray-5">
              <Modal.Header
                onDismiss={
                  methods.formState.isDirty ? onHandleDismiss : props?.onClose
                }
                title="Enter Metadatas"
                subTitle=" Please fill in the metadata for open access data."
              />
              <div className="px-1">
                {/**Have to force a re-render with props.isVisible */}
                {/* <PerfectScrollbar className="max-h-[calc(100vh-300px)] h-[calc(100vh-300px)] overflow-y-scroll"> */}
                {props.isVisible && mode === "editor" ? (
                  <DatasetMetadataForm
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
            <div className="flex flex-row justify-end gap-4 items-center h-16 w-full dark:bg-[#272727] border-t border-t-[#81C3C8] rounded-b-lg p-4">
              <PrimaryButton
                onClick={() => {
                  console.log("submit");
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
            </div>
          </div>
          {showOverwriteDialog && (
            <OverwriteMetadataForm
              setShowOverwriteDialog={setShowOverwriteDialog}
              setOverWrite={setOverWrite}
              loading={isSaving}
              formRef={formRef}
              overWrite={overWrite}
            />
          )}
        </FormProvider>
      </Modal>
    </div>
  );
};

DriveDatasetMetadataPopOver.defaultProps = defaultProps;

export default DriveDatasetMetadataPopOver;
