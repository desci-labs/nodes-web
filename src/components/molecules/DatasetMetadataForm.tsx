import { IconViewLink } from "@icons";
import React, { useImperativeHandle } from "react";

import CreateableSelect from "@components/molecules/FormInputs/CreateableSelect";
import {} from "@src/components/organisms/ManuscriptReader";
import {
  DataComponent,
  DataComponentMetadata,
  ResearchObjectComponentType,
} from "@desci-labs/desci-models";
import { Controller, useFormContext } from "react-hook-form";
import InsetLabelSmallInput from "./FormInputs/InsetLabelSmallInput";
import SpacerHorizontal from "@components/atoms/SpacerHorizontal";
import SelectList from "@src/components/molecules/FormInputs/SelectList";
import { DriveMetadata } from "@src/components/organisms/Drive";
import { CODE_LICENSE_TYPES, PDF_LICENSE_TYPES } from "@src/helper/license";
import { useDrive } from "@src/state/drive/hooks";

export const licenseSelectLabelRenderer = (l: any) => {
  const codeLicenseMap = CODE_LICENSE_TYPES.map((l) => l.name).reduce(
    (map: Record<string, string>, licence) => {
      map[licence] = "bg-green-500";
      return map;
    },
    {}
  );

  let licenseMapColor: Record<string, string> = {
    "CC BY": "bg-green-500",
    "CC BY-SA": "bg-green-500",
    "CC BY-ND": "bg-red-500",
    "CC BY-NC": "bg-yellow-300",
    "CC BY-NC-SA": "bg-yellow-300",
    "CC BY-NC-ND": "bg-red-500",
    CC0: "bg-green-500",
    ...codeLicenseMap,
  };
  return (
    <div className="inline-flex justify-center gap-2 items-center h-4">
      <div
        className={`${
          licenseMapColor[l.name] || "bg-red-500"
        } rounded-full h-2 w-2`}
      ></div>
      <span>{l.name}</span>
    </div>
  );
};

interface DatasetMetadataFormProps {
  onSubmit: (data: DataComponent["payload"]) => void;
  loading?: boolean;
  currentObjectId: string;
  prepopulatingFrom?: string;
  prepopulate: DataComponentMetadata | undefined;
  defaultLicense: string;
  // setNewMetadata: React.Dispatch<
  //   React.SetStateAction<(DataComponentPayload & DataComponentMetadata) | null>
  // >;
}

export const DatasetMetadataForm = React.forwardRef(
  (props: DatasetMetadataFormProps, ref: any) => {
    const { fileMetadataBeingEdited } = useDrive();

    const { control, handleSubmit, watch } = useFormContext<DriveMetadata>();
    watch("description");

    const onSubmitHandler = handleSubmit((data: any) => {
      console.log("submit", data.licenseType);
      data.licenseType = data.licenseType?.name;
      // props.setNewMetadata(data);
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
    const defaultLicense = PDF_LICENSE_TYPES.find(
      (l) => l.name === props.defaultLicense
    );

    const getLicenseTypes = () => {
      if (
        fileMetadataBeingEdited?.componentType ===
        ResearchObjectComponentType.PDF
      )
        return PDF_LICENSE_TYPES;
      if (
        fileMetadataBeingEdited?.componentType ===
        ResearchObjectComponentType.CODE
      )
        return CODE_LICENSE_TYPES;
      else return PDF_LICENSE_TYPES;
    };

    return (
      <div>
        <div className="py-3 my-3">
          <Controller
            name="title"
            control={control}
            render={({ field, value, fieldState }: any) => (
              <InsetLabelSmallInput
                label="Component Title"
                labelClassName="text-xs"
                value={value}
                {...field}
                fieldState={fieldState}
                mandatory={true}
              />
            )}
          />
        </div>

        <SpacerHorizontal />
        <div className="py-3 my-3">
          <Controller
            name="description"
            control={control}
            render={({ field, value, fieldState }: any) => (
              <InsetLabelSmallInput
                label="Description or PID"
                multiline
                labelClassName="text-xs"
                value={value}
                {...field}
                fieldState={fieldState}
                mandatory={true}
              />
            )}
          />
          <div className="text-xs mt-1">
            Enter the description of the data, or paste the persistent
            identifier (PID) of the data description file.
          </div>
        </div>
        <SpacerHorizontal />
        <div className="text-lg font-bold mt-3 text-white">
          Keywords &amp; Controlled Vocabulary Terms
        </div>
        <div className="text-sm ">
          These fields are inherited from your node's global metadata.
        </div>

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
            Keywords aid in discovery. Press enter or comma{" "}
            <pre className="inline-block px-1 bg-neutrals-gray-1 text-neutrals-gray-8">
              ,
            </pre>{" "}
            to add a keyword
          </div>
        </div>

        <div className="py-3 my-3">
          <Controller
            name="cedarLink"
            control={control}
            render={({ field, value, fieldState }: any) => (
              <div className="flex flex-col gap-1">
                <InsetLabelSmallInput
                  label="CEDAR Metadata Schema"
                  labelClassName="text-xs"
                  value={value}
                  {...field}
                  fieldState={fieldState}
                  mandatory={false}
                  optional
                />
                {field.value && field.value.length > 0 && (
                  <a
                    href={`https://open.metadatacenter.org/templates/${encodeURIComponent(
                      field.value
                    )}`}
                    className="inline-flex gap-1 text-xs text-tint-primary hover:text-tint-primary-hover"
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    Preview CEDAR Resource{" "}
                    <IconViewLink
                      stroke={"inherit"}
                      width={12}
                      strokeWidth={0.5}
                      className="-mt-0.5 stroke-current"
                    />
                  </a>
                )}
              </div>
            )}
          />
          <div className="text-xs mt-1">
            Enter the CEDAR metadata link for this data.
          </div>
        </div>

        <div className="py-3 my-3">
          <Controller
            name="ontologyPurl"
            control={control}
            render={({ field, value, fieldState }: any) => (
              <InsetLabelSmallInput
                label="Ontology PURL"
                labelClassName="text-xs"
                value={value}
                {...field}
                fieldState={fieldState}
                mandatory={false}
                optional
              />
            )}
          />
          <div className="text-xs mt-1">
            If your field has community defined ontologies, please add the PURL
            link to the relevant ontology. For instance,
            <a
              href="https://www.bioontology.org/"
              rel="noreferrer"
              target="_blank"
              className="flex gap-1 text-xs mb-1 group hover:text-tint-primary-hover text-tint-primary"
            >
              biomedical ontologies can be found here.
              <IconViewLink
                stroke={"inherit"}
                width={12}
                strokeWidth={0.5}
                className="-mt-0.5 stroke-current"
              />
            </a>
          </div>
        </div>

        <div className="py-3 my-3">
          <Controller
            name="controlledVocabTerms"
            control={control}
            render={({ field }: any) => (
              <CreateableSelect
                label="Controlled Vocabulary Terms"
                optional={true}
                field={field}
              />
            )}
          />
          <div className="text-xs mt-1">
            Please enter the terms relevant to your research from the ontology
            selected above.
          </div>
        </div>

        <SpacerHorizontal />
        <div className="text-lg font-bold mt-3 text-white">Licensing</div>

        <div className="my-3">
          <Controller
            name="licenseType"
            control={control}
            defaultValue={defaultLicense?.name}
            render={({ field }: any) => {
              const licenses = getLicenseTypes();
              const val = licenses.find((l) => l.name === field.value);
              return (
                <SelectList
                  label="Choose license"
                  mandatory={true}
                  data={licenses}
                  labelRenderer={licenseSelectLabelRenderer}
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
            Choose the applicable license for this specific component.
            <a
              href="https://creativecommons.org/licenses/"
              rel="noreferrer"
              target="_blank"
              className="gap-1 text-xs mb-1 group hover:text-tint-primary-hover text-tint-primary inline-flex ml-1"
            >
              Learn more
              <IconViewLink
                width={12}
                strokeWidth={0.5}
                className="-mt-0.5 stroke-tint-primary group-hover:stroke-tint-primary-hover"
              />
            </a>
          </div>
        </div>
        {/* <input type="submit" /> */}
      </div>
    );
  }
);
