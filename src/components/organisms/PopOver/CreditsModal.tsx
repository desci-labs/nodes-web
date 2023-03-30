import { useState } from "react";
import { useSetter } from "@src/store/accessors";
import { ResearchObjectV1Author } from "@desci-labs/desci-models";
import PrimaryButton from "@src/components/atoms/PrimaryButton";
import DefaultSpinner from "@src/components/atoms/DefaultSpinner";
import Modal, { ModalProps } from "@src/components/molecules/Modal/Modal";
import { Controller, useForm } from "react-hook-form";
import InsetLabelSmallInput from "@src/components/molecules/FormInputs/InsetLabelSmallInput";
import DividerSimple from "@src/components/atoms/DividerSimple";

interface CreditModalProps {
  author?: ResearchObjectV1Author;
}

type OrcidPartsKeys = "orcid1" | "orcid2" | "orcid3" | "orcid4";

type OrcidParts = Record<OrcidPartsKeys, string>;

export default function CreditsModal(props: ModalProps & CreditModalProps) {
  const dispatch = useSetter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<ResearchObjectV1Author & OrcidParts>({
    defaultValues: {
      name: props?.author?.name,
      googleScholar: props?.author?.googleScholar ?? "",
      orcid: props?.author?.orcid ?? "",
      orcid1: props?.author?.orcid?.split("-")[0] ?? "",
      orcid2: props?.author?.orcid?.split("-")[1] ?? "",
      orcid3: props?.author?.orcid?.split("-")[2] ?? "",
      orcid4: props?.author?.orcid?.split("-")[3] ?? "",
    },
    reValidateMode: "onBlur",
  });

  const name = watch("name");
  console.log(props.author, name, watch("orcid1"), watch("googleScholar"));

  const onSubmit = (data: ResearchObjectV1Author) => {
    props?.onDismiss?.();
  };

  const orcid = watch("orcid");

  const OrcidInput = ({ name }: { name: OrcidPartsKeys }) => (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <InsetLabelSmallInput
          label=""
          field={field}
          value={watch(name)}
          onChange={(value) => {
            console.log("update orcid", value);
            if (!Number.isNaN(value) && typeof Number(value) === "number") {
              // set part vallue
              console.log("Set part", name, value);
            }
          }}
        />
      )}
    />
  );
  return (
    <Modal {...props} $maxWidth={650}>
      <div className="px-6 py-5 w-full lg:w-[650px] text-white">
        <Modal.Header
          title="Collaborator Details"
          onDismiss={props.onDismiss}
        />
        <form
          name="creditsModalForm"
          id="creditsModalForm"
          className="w-full"
          onSubmit={handleSubmit(onSubmit)}
        >
          <Controller
            name="name"
            control={control}
            render={({ field }: any) => (
              <InsetLabelSmallInput
                label="Full Name"
                field={field}
                optional={false}
                className="my-6 w-full"
              />
            )}
          />
          <DividerSimple />

          <span className="text-xl font-bold mt-6 inline-block capitalize">
            Scientific Identity
          </span>
          <div className="mt-5">
            <span className="text-lg capitalize mb-1 inline-block">
              ORCID{" "}
              <span className="text-sm text-neutrals-gray-4">(optional)</span>
            </span>
            <div className="flex gap-2 items-center justify-evenly max-w-[300px]">
              <OrcidInput name="orcid1" />
              <OrcidInput name="orcid2" />
              <OrcidInput name="orcid3" />
              <OrcidInput name="orcid4" />
            </div>
            <span className="text-red-400 text-xs">
              {errors.googleScholar?.message}
            </span>
          </div>
          <div className="mt-8">
            <Controller
              name="googleScholar"
              control={control}
              render={({ field }) => (
                <InsetLabelSmallInput
                  label="Google Scholar Profile"
                  field={field}
                  optional={true}
                />
              )}
            />
            <span className="text-red-400 text-xs">
              {errors.googleScholar?.message}
            </span>
          </div>
        </form>
      </div>
      <Modal.Footer>
        <PrimaryButton type="submit" form="creditsModalForm">
          {isLoading ? (
            <div className="flex flex-row gap-2 items-center w-full justify-center">
              saving <DefaultSpinner color="black" size={20} />
            </div>
          ) : (
            <span>Save</span>
          )}
        </PrimaryButton>
      </Modal.Footer>
    </Modal>
  );
}
