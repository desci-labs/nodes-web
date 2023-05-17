import DefaultSpinner from "@components/atoms/DefaultSpinner";
import PrimaryButton from "@components/atoms/PrimaryButton";
import { EMPTY_FUNC } from "@components/utils";
import { IconViewLink, IconX } from "@icons";
import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import CreateableSelect from "@components/molecules/FormInputs/CreateableSelect";
import {
  CommonComponentPayload,
  ResearchObjectComponentType,
  ResearchObjectV1,
  ResearchObjectV1Component,
} from "@desci-labs/desci-models";
import {
  Controller,
  FormProvider,
  useForm,
  useFormContext,
} from "react-hook-form";
import InsetLabelInput from "../../../molecules/FormInputs/InsetLabelInput";
import ReadOnlyComponent from "./ReadOnlyComponent";
import axios from "axios";
import { useManifestStatus, useNodeReader } from "@src/state/nodes/hooks";
import { useSetter } from "@src/store/accessors";
import {
  updateComponent,
  saveManifestDraft,
  addComponent,
} from "@src/state/nodes/nodeReader";
import SelectList from "@src/components/molecules/FormInputs/SelectList";
import Modal from "@src/components/molecules/Modal";
import { useManuscriptController } from "../../ManuscriptReader/ManuscriptController";
import { useDrive } from "@src/state/drive/hooks";
import { v4 as uuidv4 } from "uuid";
import { fetchTreeThunk } from "@src/state/drive/driveSlice";
import { DriveObject } from "../../Drive";
import ViewMetadataModal from "./ViewMetadataModal";

export const PDF_LICENSE_TYPES = [
  { id: 0, name: "CC0", shortName: "CC0" },
  { id: 1, name: "CC BY", shortName: "CC BY" },
  { id: 2, name: "CC BY-SA", shortName: "CC BY-SA" },
  { id: 3, name: "CC BY-NC", shortName: "CC BY-NC" },
  { id: 4, name: "CC BY-NC-SA", shortName: "CC BY-NC-SA" },
  { id: 5, name: "CC BY-ND", shortName: "CC BY-ND" },
  { id: 6, name: "CC BY-NC-ND", shortName: "CC BY-NC-ND" },
];

const getLicenseTypes = () => {
  return PDF_LICENSE_TYPES.concat(CODE_LICENSE_TYPES);
};

export const getLicenseShortName = (license: string) => {
  const licenseType = getLicenseTypes().find((l) => l.name === license);
  return licenseType ? licenseType.shortName : "";
};

export const CODE_LICENSE_TYPES = [
  {
    id: 10,
    name: "MIT License",
    shortName: "MIT",
    link: "https://choosealicense.com/licenses/mit/",
  },
  {
    id: 1,
    name: "Apache License 2.0",
    shortName: "Apache 2.0",
    link: "https://choosealicense.com/licenses/apache-2.0/",
  },
  {
    id: 11,
    name: "Mozilla Public License 2.0",
    shortName: "MPL 2.0",
    link: "https://choosealicense.com/licenses/mpl-2.0/",
  },
  {
    id: 7,
    name: "GNU General Public License v2.0",
    shortName: "GPL 2.0",
    link: "https://choosealicense.com/licenses/gpl-2.0/",
  },
  {
    id: 8,
    name: "GNU General Public License v3.0",
    shortName: "GPL 3.0",
    link: "https://choosealicense.com/licenses/gpl-3.0/",
  },
  {
    id: 9,
    name: "GNU Lesser General Public License v2.1",
    shortName: "LGPL 2.1",
    link: "https://choosealicense.com/licenses/lgpl-2.1/",
  },

  {
    id: 5,
    name: "Creative Commons Zero v1.0 Universal",
    shortName: "CC0",
    link: "https://choosealicense.com/licenses/cc0-1.0/",
  },
  {
    id: 2,
    name: 'BSD 2-Clause "Simplified" License',
    shortName: "BSD 2-Clause",
    link: "https://choosealicense.com/licenses/bsd-2-clause/",
  },

  {
    id: 3,
    name: 'BSD 3-Clause "New" or "Revised" License',
    shortName: "BSD 3-Clause",
    link: "https://choosealicense.com/licenses/bsd-3-clause/",
  },
  {
    id: 0,
    name: "GNU Affero General Public License v3.0",
    shortName: "AGPL 3.0",
    link: "https://choosealicense.com/licenses/agpl-3.0/",
  },
  {
    id: 4,
    name: "Boost Software License 1.0",
    shortName: "BSL 1.0",
    link: "https://choosealicense.com/licenses/bsl-1.0/",
  },

  {
    id: 6,
    name: "Eclipse Public License 2.0",
    shortName: "EPL 2.0",
    link: "https://choosealicense.com/licenses/epl-2.0/",
  },

  {
    id: 12,
    name: "The Unlicense",
    shortName: "Unlicense",
    link: "https://choosealicense.com/licenses/unlicense/",
  },
];

interface ComponentMetadataFormProps {
  file: DriveObject;
  onSubmit: (data: CommonComponentPayload) => void;
  manifest: ResearchObjectV1;
  loading?: boolean;
  defaultLicense: string;
}

const FORM_DEFAULTS = {
  keywords: [],
  description: "",
  licenseType: "",
};

const ComponentMetadataForm = React.forwardRef(
  (props: ComponentMetadataFormProps, ref: any) => {
    const defaultLicense = getLicenseTypes().find(
      (l) => l.name === props.defaultLicense
    );

    const { control, handleSubmit, watch, setValue } =
      useFormContext<CommonComponentPayload>();

    watch("description");

    const onSubmitHandler = handleSubmit((data: any) => {
      data.licenseType = data.licenseType?.name;
      props.onSubmit(data);
    });

    useImperativeHandle(
      ref,
      () => ({
        submit: () => {
          onSubmitHandler();
        },
      }),
      [onSubmitHandler]
    );

    function getLicenseTypes() {
      if (props.file.componentType === ResearchObjectComponentType.PDF)
        return PDF_LICENSE_TYPES;
      if (props.file.componentType === ResearchObjectComponentType.CODE)
        return CODE_LICENSE_TYPES;
      else return PDF_LICENSE_TYPES;
    }

    //autodetect from code repos on github
    useEffect(() => {
      if (
        props.file.componentType === "code" &&
        !props.file.metadata?.licenseType
      ) {
        const fetchLicense = async (component: ResearchObjectV1Component) => {
          const spl = component.payload.externalUrl.split("github.com/");
          const owner = spl[1].split("/")[0];
          let repo = spl[1].split("/")[1];
          if (repo.includes(".")) repo = repo.split(".")[0];

          const url = `https://api.github.com/repos/${owner}/${repo}/license`;
          const licenseInfo = await axios.get(url);

          if (!("license" in licenseInfo.data)) return;
          const license = CODE_LICENSE_TYPES.find(
            ({ name }) => name === licenseInfo.data.license.name
          );
          if (license) setValue("licenseType", license.name);
        };
        const component = props.manifest.components.find(
          (c) => c.payload?.path === props.file.path
        );
        if (component && component.payload.externalUrl?.includes("github.com/"))
          fetchLicense(component);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.file.componentType]);

    return (
      <div>
        <div className="py-3 my-3">
          <Controller
            name="keywords"
            control={control}
            render={({ field }: any) => (
              <CreateableSelect
                label="Keywords"
                field={field}
                optional={true}
              />
            )}
          />
          <div className="text-xs mt-1">
            Add keywords for discoverability. Hit enter after each keyword.
          </div>
        </div>
        <div className="py-3 my-3">
          <Controller
            name="description"
            control={control}
            render={({ field, value, fieldState }: any) => (
              <InsetLabelInput
                label="Description"
                multiline
                labelClassName="text-xs"
                value={value}
                field={field}
                fieldState={fieldState}
                mandatory={false}
              />
            )}
          />
          <div className="text-xs mt-1">
            Describe your data as thoroughly as possible. When pasting from
            other sources, formatting is preserved and counts toward character
            limits.
          </div>
        </div>

        <div className="py-3 my-3">
          <Controller
            name="licenseType"
            control={control}
            defaultValue={defaultLicense?.name}
            render={({ field }: any) => {
              const licenses = getLicenseTypes();
              const val = licenses.find((l) => l.name === field.value);
              return (
                <SelectList
                  label="License Type"
                  className="mt-2"
                  mandatory={true}
                  data={licenses}
                  defaultValue={defaultLicense}
                  field={{
                    ...field,
                    value: val || field.value || defaultLicense,
                  }}
                />
              );
            }}
          />
          <div className="text-xs mt-2">
            Your Node's default license type is{" "}
            <span className="text-gray-500">
              {props.defaultLicense || "not set"}
            </span>
            <br />
            You can change the license for this specific component, if
            appropriate.
            <a
              href="https://creativecommons.org/licenses/"
              rel="noreferrer"
              target="_blank"
              className="flex gap-1 text-xs mb-1 group hover:text-tint-primary-hover text-tint-primary"
            >
              Learn more about Creative Commons Licenses
              <IconViewLink
                stroke={"inherit"}
                width={12}
                strokeWidth={0.5}
                className="-mt-0.5 stroke-current"
              />
            </a>
          </div>
        </div>
      </div>
    );
  }
);
interface ComponentMetadataPopoverProps {
  isVisible: boolean;
  onClose?: () => void;
}

const defaultProps = {
  onClose: EMPTY_FUNC,
};

const EditMetadataModal = (
  props: ComponentMetadataPopoverProps & typeof defaultProps
) => {
  const dispatch = useSetter();
  const formRef = useRef<HTMLFormElement | null>(null);
  const { isLoading: isSaving } = useManifestStatus();
  const { dialogs, setDialogs } = useManuscriptController(["dialogs"]);
  const { fileMetadataBeingEdited } = useDrive();

  const { publicView, mode, manifest: manifestData } = useNodeReader();

  const methods = useForm<CommonComponentPayload>({
    defaultValues: {
      keywords:
        fileMetadataBeingEdited?.metadata?.keywords || FORM_DEFAULTS.keywords,
      description:
        fileMetadataBeingEdited?.metadata?.description ||
        FORM_DEFAULTS.description,
      licenseType:
        fileMetadataBeingEdited?.metadata?.licenseType ||
        FORM_DEFAULTS.licenseType,
    },
  });

  const close = useCallback(() => {
    methods.formState.isDirty ? onHandleDismiss() : props?.onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [methods.formState.isDirty, props]);

  const onSubmit = async (data: CommonComponentPayload) => {
    if (manifestData !== undefined) {
      const componentIndex = manifestData!.components!.findIndex(
        (c) => c.payload.path === fileMetadataBeingEdited?.path!
      );

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

      dispatch(
        saveManifestDraft({
          onSucess: () => {
            dispatch(fetchTreeThunk());
            props.onClose();
          },
        })
      );
    }
  };

  const onHandleDismiss = useCallback(() => {
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
  }, [dialogs, props?.onClose, setDialogs]);

  const isVirtualComponent = !fileMetadataBeingEdited === undefined;
  if (isVirtualComponent) {
    return <div>{/* className="text-xs bg-red-500">component problem */}</div>;
  }

  return (
    <Modal
      isOpen={props.isVisible}
      onDismiss={close}
      $scrollOverlay={true}
      $maxWidth={720}
    >
      <FormProvider {...methods}>
        <div className="py-4 px-6 text-neutrals-gray-5">
          <div className="flex flex-row justify-end items-center">
            <IconX
              fill="white"
              width={20}
              height={20}
              className="cursor-pointer"
              onClick={close}
            />
          </div>
          <div className="px-20 h-full">
            <div className="text-2xl font-bold text-center mb-3 text-white">
              Component <span className="text-tint-primary-hover">FAIR</span>
              ness
            </div>
            <div className="text-sm text-center">
              <span className="text-tint-primary-hover">FAIR</span> stands for{" "}
              <span className="text-tint-primary-hover">F</span>indable,{" "}
              <span className="text-tint-primary-hover">A</span>ccessible,{" "}
              <span className="text-tint-primary-hover">I</span>nteroperable and{" "}
              <span className="text-tint-primary-hover">R</span>eusable
            </div>
            <div className="text-xs text-center mt-4">
              These principles apply to all research outputs. The overarching
              goal of the FAIR principles is to improve machine readability and
              the reusability of scientific results.
            </div>
            <div className="text-xs text-center mt-4 flex justify-center gap-1">
              <a
                target="_blank"
                rel="noreferrer"
                href="https://www.go-fair.org/fair-principles"
                className="text-tint-primary hover:text-tint-primary-hover flex gap-1"
              >
                Learn more{" "}
                <IconViewLink width={12} className="stroke-current -mt-0.5" />
              </a>{" "}
              about how DeSci facilitates FAIR
            </div>
            {/**Have to force a re-render with props.isVisible */}
            {mode === "editor" ? (
              <ComponentMetadataForm
                ref={formRef}
                file={fileMetadataBeingEdited!}
                manifest={manifestData!}
                onSubmit={onSubmit}
                loading={isSaving}
                defaultLicense={manifestData?.defaultLicense || ""}
              />
            ) : (
              <ReadOnlyComponent file={fileMetadataBeingEdited} />
            )}
          </div>
        </div>
        <div className="flex flex-row justify-end gap-4 items-center h-16 w-full dark:bg-[#272727] border-t border-t-[#81C3C8] rounded-b-lg p-4">
          <PrimaryButton
            onClick={() => {
              if (publicView || mode === "reader") {
                props.onClose();
              } else {
                formRef.current!.submit();
              }
            }}
            disabled={isSaving && !publicView}
          >
            {isSaving ? (
              <DefaultSpinner color="black" size={24} />
            ) : mode === "editor" ? (
              "Save Changes"
            ) : (
              "Done"
            )}
          </PrimaryButton>
        </div>
      </FormProvider>
    </Modal>
  );
};

EditMetadataModal.defaultProps = defaultProps;

const ComponentMetadataPopover = (
  props: ComponentMetadataPopoverProps & typeof defaultProps
) => {
  const { mode } = useNodeReader();
  const { fileMetadataBeingEdited } = useDrive();

  if (mode === "editor") {
    return <EditMetadataModal {...props} />;
  }

  return (
    <ViewMetadataModal
      file={fileMetadataBeingEdited}
      isOpen={props.isVisible}
      onDismiss={props.onClose}
    />
  );
};
ComponentMetadataPopover.defaultProps = defaultProps;

export default ComponentMetadataPopover;
