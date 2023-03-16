import { IconViewLink } from "@icons";
import React, { useImperativeHandle } from "react";

import CreateableSelect from "@components/molecules/FormInputs/CreateableSelect";
import {} from "@src/components/organisms/ManuscriptReader";
import { DataComponent, DataComponentMetadata } from "@desci-labs/desci-models";
import { Controller, useForm } from "react-hook-form";
import SelectMenu from "../FormInputs/SelectMenu";
import { PDF_LICENSE_TYPES } from "@components/organisms/PopOver/ComponentMetadataPopover";
import InsetLabelSmallInput from "../FormInputs/InsetLabelSmallInput";
import SpacerHorizontal from "@components/atoms/SpacerHorizontal";
import { MetaStaging } from "@components/organisms/PaneDrive";
import { DATASET_METADATA_FORM_DEFAULTS } from ".";

interface ComponentMetadataFormProps {
  onSubmit: (data: DataComponent["payload"]) => void;
  loading?: boolean;
  currentObjectId: string;
  prepopulatingFrom?: string;
  prepopulate: DataComponentMetadata | undefined;
  metaStaging: MetaStaging[];
  defaultLicense: string;
  // setNewMetadata: React.Dispatch<
  //   React.SetStateAction<(DataComponentPayload & DataComponentMetadata) | null>
  // >;
}

export const ComponentMetadataForm = React.forwardRef(
  (props: ComponentMetadataFormProps, ref: any) => {
    // const payload = props.component.payload as DataComponent["payload"];
    const licenseType = PDF_LICENSE_TYPES.find(
      (l) => l.name === props.prepopulate?.licenseType
    );
    const defaultLicense = PDF_LICENSE_TYPES.find(
      (l) => l.name === props.defaultLicense
    );

    const data = {
      title: props.prepopulate?.title || "",
      ontologyPurl: props.prepopulate?.ontologyPurl || "",
      controlledVocabTerms: props.prepopulate?.controlledVocabTerms || [],
      keywords: props.prepopulate?.keywords || [],
      description: props.prepopulate?.description,
      licenseType: licenseType,
    };

    const { control, handleSubmit, watch } = useForm({
      defaultValues: {
        title: data.title || DATASET_METADATA_FORM_DEFAULTS.title,
        ontologyPurl:
          data.ontologyPurl || DATASET_METADATA_FORM_DEFAULTS.ontologyPurl,
        controlledVocabTerms:
          data.controlledVocabTerms ||
          DATASET_METADATA_FORM_DEFAULTS.controlledVocabTerms,
        keywords: data.keywords || DATASET_METADATA_FORM_DEFAULTS.keywords,
        description:
          data.description || DATASET_METADATA_FORM_DEFAULTS.description,
        licenseType:
          data.licenseType || DATASET_METADATA_FORM_DEFAULTS.licenseType,
      },
    });

    watch("description");

    const onSubmitHandler = handleSubmit((data: any) => {
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

    // function getLicenseTypes() {
    //   if (props.component.type === "pdf") return PDF_LICENSE_TYPES;
    //   if (props.component.type === "code") return CODE_LICENSE_TYPES;
    //   else return PDF_LICENSE_TYPES;
    // }

    //autodetect from code repos on github
    // useEffect(() => {
    //   if (
    //     props.component.type === "code" &&
    //     !props.component.payload.licenseType
    //   ) {
    //     const fetchLicense = async () => {
    //       const spl = props.component.payload.externalUrl.split("github.com/");
    //       const owner = spl[1].split("/")[0];
    //       let repo = spl[1].split("/")[1];
    //       if (repo.includes(".")) repo = repo.split(".")[0];

    //       const url = `https://api.github.com/repos/${owner}/${repo}/license`;
    //       const licenseInfo = await axios.get(url);

    //       if (!("license" in licenseInfo.data)) return;
    //       const license = CODE_LICENSE_TYPES.find(
    //         ({ name }) => name === licenseInfo.data.license.name
    //       );
    //       if (license) setValue("licenseType", license);
    //     };
    //     if (props.component.payload.externalUrl?.includes("github.com/"))
    //       fetchLicense();
    //   }
    // }, [props.component.type]);
    // debugger

    return (
      <div>
        {props.metaStaging.length === 1 ? (
          <div className="py-3 my-3">
            <Controller
              name="title"
              control={control}
              render={({ field, value, fieldState }: any) => (
                <InsetLabelSmallInput
                  label="Open Access Data Title"
                  labelClassName="text-xs"
                  value={value}
                  field={field}
                  fieldState={fieldState}
                  mandatory={true}
                />
              )}
            />
          </div>
        ) : (
          <div className="py-3 my-3">
            <div className="text-lg font-bold text-white mb-2">
              Prepopulated from
            </div>
            <span className="bg-tint-primary text-black rounded-sm px-1 py-0.5 text-base inline-block">
              {props.prepopulatingFrom}
            </span>
            <div className="text-lg font-bold text-white my-2">
              Selected Files and Directories
            </div>
            <div className="flex gap-2 flex-wrap">
              {props.metaStaging.map((f, i) => (
                <span
                  className="bg-tint-primary text-black rounded-sm px-1 py-0.5"
                  key={i}
                >
                  {f.file.name}
                </span>
              ))}
            </div>
          </div>
        )}

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
                field={field}
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
          Enter Keywords & Controlled Vocabulary Terms
        </div>
        <div className="text-sm ">
          These fields are inherited from your node's global metadata.
        </div>

        <div className="py-3 my-3">
          <Controller
            name="keywords"
            control={control}
            render={({ field }: any) => (
              <CreateableSelect label="Keywords" field={field} />
            )}
          />
          <div className="text-xs mt-1">Keywords aid in discovery.</div>
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
                field={field}
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

        <div className="py-3 my-3">
          <Controller
            name="licenseType"
            control={control}
            defaultValue={defaultLicense}
            render={({ field }: any) => (
              <SelectMenu
                label="Choose license"
                data={PDF_LICENSE_TYPES}
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
              Learn more
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
