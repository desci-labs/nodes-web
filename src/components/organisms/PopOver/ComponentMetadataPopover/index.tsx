import DefaultSpinner from "@components/atoms/DefaultSpinner";
import PrimaryButton from "@components/atoms/PrimaryButton";
import { EMPTY_FUNC } from "@components/utils";
import { IconViewLink, IconX } from "@icons";
import React, { useEffect, useImperativeHandle, useRef, useState } from "react";

import PopoverFooter from "@components/molecules/Footer";
import CreateableSelect from "@components/molecules/FormInputs/CreateableSelect";
import {
  CommonComponentPayload,
  ResearchObjectComponentType,
  ResearchObjectV1,
  ResearchObjectV1Component,
} from "@desci-labs/desci-models";
import { Controller, useForm } from "react-hook-form";
import PopOver from "..";
import InsetLabelInput from "../../../molecules/FormInputs/InsetLabelInput";
import SelectMenu from "../../../molecules/FormInputs/SelectMenu";
import ReadOnlyComponent from "./ReadOnlyComponent";
import axios from "axios";
import { useManifestStatus, useNodeReader } from "@src/state/nodes/hooks";
import { useSetter } from "@src/store/accessors";
import { updateComponent, saveManifestDraft } from "@src/state/nodes/viewer";

export const PDF_LICENSE_TYPES = [
  { id: 1, name: "CC BY" },
  { id: 0, name: "CC0" },
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
    const payload = props.component.payload as CommonComponentPayload;
    const data = {
      keywords: payload.keywords || [],
      description: payload.description,
      licenseType: getLicenseTypes().find(
        ({ name }) => name === payload.licenseType
      ),
    };
    const defaultLicense = getLicenseTypes().find(
      (l) => l.name === props.defaultLicense
    );

    const { control, handleSubmit, watch, setValue } = useForm({
      defaultValues: {
        keywords: data.keywords || FORM_DEFAULTS.keywords,
        description: data.description || FORM_DEFAULTS.description,
        licenseType: data.licenseType || FORM_DEFAULTS.licenseType,
      },
    });

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
          if (license) setValue("licenseType", license);
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

        <div className="py-3 my-3">
          <Controller
            name="licenseType"
            control={control}
            defaultValue={defaultLicense}
            render={({ field }: any) => (
              <SelectMenu
                label="Choose license"
                data={getLicenseTypes()}
                field={{ ...field, value: field.value || defaultLicense }}
                mandatory={true}
              />
            )}
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
        {/* <input type="submit" /> */}
      </div>
    );
  }
);
interface ComponentMetadataPopoverProps {
  componentId: string;
  currentObjectId: string;
  manifestData: ResearchObjectV1;
  isVisible: boolean;
  mode: string;
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
  const [component, setComponent] = useState<
    ResearchObjectV1Component | undefined
  >();
  const [componentIndex, setComponentIndex] = useState<number | undefined>(
    undefined
  );

  const { publicView } = useNodeReader();
  const manifestData = props.manifestData;
  const currentObjectId = props.currentObjectId;
  const mode = props.mode;

  useEffect(() => {
    if (manifestData && currentObjectId) {
      const index = manifestData.components.findIndex(
        (c) => c.id === props.componentId
      );

      const _component = manifestData.components.find(
        (c) => c.id === props.componentId
      );

      setComponentIndex(index);
      setComponent(_component);
    }
  }, [currentObjectId, manifestData, props.componentId]);

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

  const isVirtualComponent = !component || componentIndex === undefined;
  if (isVirtualComponent) {
    return <div>{/* className="text-xs bg-red-500">component problem */}</div>;
  }

  return (
    <PopOver
      {...props}
      style={{
        width: 720,
        marginLeft: 0,
        marginRight: 0,
      }}
      containerStyle={{
        backgroundColor: "#3A3A3ABF",
      }}
      onClose={() => {
        // formRef?.current?.reset();
        props.onClose();
      }}
      className="rounded-lg bg-zinc-100 dark:bg-zinc-900"
      footer={() => (
        <PopoverFooter>
          <PrimaryButton
            onClick={() => {
              if (publicView) {
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
        </PopoverFooter>
      )}
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
        <div className="px-20 h-full">
          <div className="text-2xl font-bold text-center mb-3 text-white">
            Component <span className="text-tint-primary-hover">FAIR</span>ness
          </div>
          <div className="text-sm text-center">
            <span className="text-tint-primary-hover">FAIR</span> stands for{" "}
            <span className="text-tint-primary-hover">F</span>indable,{" "}
            <span className="text-tint-primary-hover">A</span>ccessible,{" "}
            <span className="text-tint-primary-hover">I</span>nteroperable and{" "}
            <span className="text-tint-primary-hover">R</span>eusable
          </div>
          <div className="text-xs text-center mt-4">
            These principles apply to all research outputs. The overarching goal
            of the FAIR principles is to improve machine readability and the
            reusability of scientific results.
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
          {props.isVisible && mode === "editor" ? (
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
    </PopOver>
  );
};

ComponentMetadataPopover.defaultProps = defaultProps;

export default ComponentMetadataPopover;
