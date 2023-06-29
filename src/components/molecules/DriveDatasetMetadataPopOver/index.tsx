import DefaultSpinner from "@components/atoms/DefaultSpinner";
import PrimaryButton from "@components/atoms/PrimaryButton";
import { EMPTY_FUNC } from "@components/utils";
import { useCallback, useRef, useState } from "react";

import {
  DataComponent,
  ResearchObjectComponentType,
  ResearchObjectV1Component,
} from "@desci-labs/desci-models";

import { DatasetMetadataForm } from "../DatasetMetadataForm";
import { OverwriteMetadataForm } from "./OverwriteMetadataDialog";
import { useNodeReader } from "@src/state/nodes/hooks";
import {
  addComponent,
  removeComponentMetadata,
  saveManifestDraft,
  updateComponent,
} from "@src/state/nodes/nodeReader";
import { useSetter } from "@src/store/accessors";
import Modal from "../Modal";
import { FormProvider, useForm } from "react-hook-form";
import { DriveMetadata, FileType } from "@src/components/organisms/Drive/types";
import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import { useDrive } from "@src/state/drive/hooks";
import { v4 as uuidv4 } from "uuid";
import {
  clearCachedTree,
  fetchTreeThunk,
  navigateFetchThunk,
} from "@src/state/drive/driveSlice";
import ViewMetadataModal from "@src/components/organisms/PopOver/ComponentMetadataPopover/ViewMetadataModal";
import { AvailableUserActionLogTypes, postUserAction } from "@src/api";

export const DATASET_METADATA_FORM_DEFAULTS = {
  title: "",
  ontologyPurl: "",
  cedarLink: "",
  controlledVocabTerms: [],
  keywords: [],
  description: "",
  licenseType: "",
};

interface DriveDatasetMetadataPopoverProps {
  isVisible: boolean;
  onClose?: () => void;
}

const defaultProps = {
  onClose: EMPTY_FUNC,
};

const DriveDatasetMetadataEditor = (
  props: DriveDatasetMetadataPopoverProps & typeof defaultProps
) => {
  const dispatch = useSetter();
  const {
    publicView,
    currentObjectId,
    manifest: manifestData,
  } = useNodeReader();
  const [isSaving, setIsSaving] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);
  const [showOverwriteDialog, setShowOverwriteDialog] =
    useState<boolean>(false);
  const [overWrite, setOverWrite] = useState<boolean>(false);
  const { dialogs, setDialogs } = useManuscriptController(["dialogs"]);
  const { fileMetadataBeingEdited } = useDrive();

  const data = fileMetadataBeingEdited?.metadata;

  const methods = useForm<DriveMetadata>({
    defaultValues: {
      title: data?.title || DATASET_METADATA_FORM_DEFAULTS.title,
      ontologyPurl:
        data?.ontologyPurl || DATASET_METADATA_FORM_DEFAULTS.ontologyPurl,
      cedarLink: data?.cedarLink || DATASET_METADATA_FORM_DEFAULTS.cedarLink,
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

  const hasFilesWithMoreSpecificMetadata =
    fileMetadataBeingEdited?.contains &&
    fileMetadataBeingEdited?.contains.length &&
    manifestData?.components.some((c) => {
      return (
        c.payload.path?.includes(fileMetadataBeingEdited?.path) &&
        c.payload.path !== fileMetadataBeingEdited?.path
      );
    });

  const onSubmit = useCallback(
    async (data: DataComponent["payload"]) => {
      console.log("[DRIVE METADATA] ON SUBMIT HIT", data);

      try {
        if (overWrite) {
          const componentIndexes: number[] = [];
          manifestData!.components.forEach((c, idx) => {
            if (
              c.payload.path?.includes(fileMetadataBeingEdited?.path!) &&
              c.payload.path !== fileMetadataBeingEdited?.path!
            ) {
              componentIndexes.push(idx);
            }
          });
          dispatch(removeComponentMetadata({ componentIndexes }));
        }

        const componentIndex = manifestData!.components!.findIndex(
          (c) => c.payload.path === fileMetadataBeingEdited?.path!
        );
        setIsSaving(true);

        const newPayload = {
          ...data,
        };
        if (componentIndex !== -1) {
          dispatch(
            updateComponent({
              index: componentIndex,
              update: {
                payload: newPayload,
              },
            })
          );
        } else {
          const newComponent: ResearchObjectV1Component = {
            id: uuidv4(),
            name: fileMetadataBeingEdited!.name,
            type: fileMetadataBeingEdited!
              .componentType as ResearchObjectComponentType,
            payload: {
              ...newPayload,
              path: fileMetadataBeingEdited!.path,
              cid: fileMetadataBeingEdited!.cid,
            },
          };
          dispatch(addComponent({ component: newComponent }));
        }
        const containingDirPath =
          fileMetadataBeingEdited!.type === FileType.DIR
            ? fileMetadataBeingEdited!.path!
            : fileMetadataBeingEdited!.path!.substring(
                0,
                fileMetadataBeingEdited!.path!.lastIndexOf("/")
              );
        dispatch(
          saveManifestDraft({
            onError: () => {
              setIsSaving(false);
            },
            onSucess: () => {
              dispatch(clearCachedTree({ path: containingDirPath }));
              dispatch(
                navigateFetchThunk({ path: containingDirPath, driveKey: "" })
              );
              setIsSaving(false);
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
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [overWrite, manifestData, props, currentObjectId]
  );

  const onHandleDismiss = () => {
    setDialogs([
      ...dialogs,
      {
        title: "Are you sure?",
        message: "You have some unsaved changes",
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
                title="Edit Metadata"
                subTitle="Please fill in the metadata for this component or file."
              />
              <div className="px-1">
                {/**Have to force a re-render with props.isVisible */}
                {/* <PerfectScrollbar className="max-h-[calc(100vh-300px)] h-[calc(100vh-300px)] overflow-y-scroll"> */}
                {props.isVisible && (
                  <DatasetMetadataForm
                    ref={formRef}
                    prepopulate={fileMetadataBeingEdited!.metadata}
                    prepopulatingFrom={fileMetadataBeingEdited!.name}
                    currentObjectId={currentObjectId!}
                    onSubmit={onSubmit}
                    // setNewMetadata={setNewMetadata}
                    loading={isSaving}
                    defaultLicense={manifestData!.defaultLicense || ""}
                  />
                )}
                {/* </PerfectScrollbar> */}
              </div>
            </div>
            <div className="flex flex-row justify-end gap-4 items-center h-16 w-full dark:bg-[#272727] border-t border-t-tint-primary rounded-b-lg p-4">
              <PrimaryButton
                onClick={() => {
                  if (publicView) {
                    props.onClose();
                  } else {
                    if (hasFilesWithMoreSpecificMetadata) {
                      setShowOverwriteDialog(true);
                    } else {
                      //Overwriting not an option (file)
                      formRef.current!.submit!();
                    }
                  }
                  postUserAction(AvailableUserActionLogTypes.saveMetadata);
                }}
                disabled={isSaving && !publicView}
              >
                {isSaving ? (
                  <DefaultSpinner color="black" size={24} />
                ) : hasFilesWithMoreSpecificMetadata ? (
                  "Next"
                ) : (
                  "Save"
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

DriveDatasetMetadataEditor.defaultProps = defaultProps;

const DriveDatasetMetadataPopOver = (
  props: DriveDatasetMetadataPopoverProps & typeof defaultProps
) => {
  const { mode } = useNodeReader();
  const { fileMetadataBeingEdited } = useDrive();

  if (mode === "editor") {
    return <DriveDatasetMetadataEditor {...props} />;
  }

  return (
    <ViewMetadataModal
      file={fileMetadataBeingEdited}
      isOpen={props.isVisible}
      onDismiss={props.onClose}
    />
  );
};

DriveDatasetMetadataPopOver.defaultProps = defaultProps;

export default DriveDatasetMetadataPopOver;
