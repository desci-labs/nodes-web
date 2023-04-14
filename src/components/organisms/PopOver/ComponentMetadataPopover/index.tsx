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
import { updateComponent, saveManifestDraft } from "@src/state/nodes/viewer";
import SelectList from "@src/components/molecules/FormInputs/SelectList";
import Modal from "@src/components/molecules/Modal/Modal";
import { useManuscriptController } from "../../ManuscriptReader/ManuscriptController";

export const PDF_LICENSE_TYPES = [
  { id: 0, name: "CC0" },
  { id: 1, name: "CC BY" },
  { id: 2, name: "CC BY-SA" },
  { id: 3, name: "CC BY-NC" },
  { id: 4, name: "CC BY-NC-SA" },
  { id: 5, name: "CC BY-ND" },
  { id: 6, name: "CC BY-NC-ND" },
];

export const CODE_LICENSE_TYPES = [
  {
    id: 10,
    name: "MIT License",
    link: "https://choosealicense.com/licenses/mit/",
  },
  {
    id: 1,
    name: "Apache License 2.0",
    link: "https://choosealicense.com/licenses/apache-2.0/",
  },
  {
    id: 11,
    name: "Mozilla Public License 2.0",
    link: "https://choosealicense.com/licenses/mpl-2.0/",
  },
  {
    id: 7,
    name: "GNU General Public License v2.0",
    link: "https://choosealicense.com/licenses/gpl-2.0/",
  },
  {
    id: 8,
    name: "GNU General Public License v3.0",
    link: "https://choosealicense.com/licenses/gpl-3.0/",
  },
  {
    id: 9,
    name: "GNU Lesser General Public License v2.1",
    link: "https://choosealicense.com/licenses/lgpl-2.1/",
  },

  {
    id: 5,
    name: "Creative Commons Zero v1.0 Universal",
    link: "https://choosealicense.com/licenses/cc0-1.0/",
  },
  {
    id: 2,
    name: 'BSD 2-Clause "Simplified" License',
    link: "https://choosealicense.com/licenses/bsd-2-clause/",
  },

  {
    id: 3,
    name: 'BSD 3-Clause "New" or "Revised" License',
    link: "https://choosealicense.com/licenses/bsd-3-clause/",
  },
  {
    id: 0,
    name: "GNU Affero General Public License v3.0",
    link: "https://choosealicense.com/licenses/agpl-3.0/",
  },
  {
    id: 4,
    name: "Boost Software License 1.0",
    link: "https://choosealicense.com/licenses/bsl-1.0/",
  },

  {
    id: 6,
    name: "Eclipse Public License 2.0",
    link: "https://choosealicense.com/licenses/epl-2.0/",
  },

  {
    id: 12,
    name: "The Unlicense",
    link: "https://choosealicense.com/licenses/unlicense/",
  },
];

interface ComponentMetadataFormProps {
  component: ResearchObjectV1Component;
  onSubmit: (data: CommonComponentPayload) => void;
  loading?: boolean;
  currentObjectId: string;
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
      if (props.component.type === ResearchObjectComponentType.PDF)
        return PDF_LICENSE_TYPES;
      if (props.component.type === ResearchObjectComponentType.CODE)
        return CODE_LICENSE_TYPES;
      else return PDF_LICENSE_TYPES;
    }

    //autodetect from code repos on github
    useEffect(() => {
      if (
        props.component.type === "code" &&
        !props.component.payload.licenseType
      ) {
        const fetchLicense = async () => {
          const spl = props.component.payload.externalUrl.split("github.com/");
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
        if (props.component.payload.externalUrl?.includes("github.com/"))
          fetchLicense();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.component.type]);

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
        {props.component.type !== ResearchObjectComponentType.LINK && (<div className="py-3 my-3">
          <Controller
            name="licenseType"
            control={control}
            defaultValue={defaultLicense?.name}
            render={({ field }: any) => {
              const val = PDF_LICENSE_TYPES.find((l) => l.name === field.value);
              return (
                <SelectList
                  label="License Type"
                  className="mt-2"
                  mandatory={true}
                  data={PDF_LICENSE_TYPES}
                  defaultValue={defaultLicense}
                  field={{ ...field, value: val || field.value || defaultLicense }}
                />
              )
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
        )}
      </div>
    );
  }
);
interface ComponentMetadataPopoverProps {
  componentId: string;
  currentObjectId: string;
  manifestData: ResearchObjectV1;
  isVisible: boolean;
  onClose?: () => void;
}

const defaultProps = {
  onClose: EMPTY_FUNC,
};

const ComponentMetadataPopover = (
  props: ComponentMetadataPopoverProps & typeof defaultProps
) => {
  const dispatch = useSetter();
  const formRef = useRef<HTMLFormElement | null>(null);
  const { isLoading: isSaving } = useManifestStatus();
  const { dialogs, setDialogs } = useManuscriptController(["dialogs"]);

  const { publicView, mode } = useNodeReader();
  const manifestData = props.manifestData;
  const currentObjectId = props.currentObjectId;

  const componentIndex = manifestData.components.findIndex(
    (c) => c.id === props.componentId
  );

  const component = manifestData.components.find(
    (c) => c.id === props.componentId
  );

  const methods = useForm<CommonComponentPayload>({
    defaultValues: {
      keywords: component?.payload.keywords || FORM_DEFAULTS.keywords,
      description: component?.payload.description || FORM_DEFAULTS.description,
      licenseType: component?.payload.licenseType || FORM_DEFAULTS.licenseType,
    },
  });

  const close = useCallback(() => {
    methods.formState.isDirty ? onHandleDismiss() : props?.onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [methods.formState.isDirty, props]);

  const onSubmit = async (data: CommonComponentPayload) => {
    if (manifestData && componentIndex !== undefined) {
      const manifestDataClone = { ...manifestData };

      const componentPayload = {
        ...manifestData?.components[componentIndex].payload,
        ...data,
      };

      dispatch(
        updateComponent({
          index: componentIndex,
          update: {
            ...manifestDataClone.components[componentIndex],
            payload: componentPayload,
          },
        })
      );

      dispatch(saveManifestDraft({ onSucess: () => props.onClose() }));
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

  const isVirtualComponent = !component || componentIndex === undefined;
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
                component={component!}
                currentObjectId={currentObjectId!}
                onSubmit={onSubmit}
                loading={isSaving}
                defaultLicense={manifestData?.defaultLicense || ""}
              />
            ) : (
              <ReadOnlyComponent component={component} />
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

ComponentMetadataPopover.defaultProps = defaultProps;

export default ComponentMetadataPopover;
