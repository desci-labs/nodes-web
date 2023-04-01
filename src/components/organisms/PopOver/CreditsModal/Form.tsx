import { ModalProps } from "@src/components/molecules/Modal/Modal";
import { Controller, useFormContext } from "react-hook-form";
import InsetLabelSmallInput from "@src/components/molecules/FormInputs/InsetLabelSmallInput";
import DividerSimple from "@src/components/atoms/DividerSimple";
import { AuthorFormValues, CreditModalProps, OrcidPartsKeys } from "./schema";
import useCreditsForm from "./useCreditsForm";
import { FormEvent } from "react";
import SelectList from "@src/components/molecules/FormInputs/SelectList";
import { ResearchObjectV1AuthorRole } from "@desci-labs/desci-models";

const authorRoles = Object.values(ResearchObjectV1AuthorRole).map(
  (role, idx) => ({
    id: idx,
    name: role,
  })
);

export default function CreditsForm(props: ModalProps & CreditModalProps) {
  const {
    watch,
    control,
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useFormContext<AuthorFormValues>();

  const { onSubmit } = useCreditsForm({
    id: props.id,
    author: props.author,
    onDismiss: props.onDismiss,
  });

  const OrcidInput = ({ name }: { name: OrcidPartsKeys }) => (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <InsetLabelSmallInput
          label=""
          field={field}
          ref={register(name).ref}
          maxLength={4}
          onFocus={(e: FormEvent<HTMLInputElement>) => {
            if (e.currentTarget.value.length === 4) {
              e.currentTarget.select();
            }
          }}
        />
      )}
    />
  );

  const selectedRole = watch("role");

  return (
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

      <SelectList
        label="Role"
        mandatory={true}
        data={authorRoles}
        value={authorRoles.find((role) => role.name === selectedRole)}
        onSelect={(val) =>
          setValue("role", val.name, {
            shouldDirty: true,
            shouldValidate: true,
          })
        }
        {...register("role")}
      />
      <span className="text-red-400 text-xs">{errors.role?.message}</span>
      <DividerSimple />

      <span className="text-xl font-bold mt-6 inline-block capitalize">
        Scientific Identity
      </span>
      <div className="mt-5">
        <span className="text-lg mb-1 inline-block">
          ORCiD <span className="text-sm text-neutrals-gray-4">(optional)</span>
        </span>
        <div className="flex gap-2 items-center justify-evenly max-w-[300px]">
          <OrcidInput name="orcid1" />
          <span className="font-bold">-</span>
          <OrcidInput name="orcid2" />
          <span>-</span>
          <OrcidInput name="orcid3" />
          <span>-</span>
          <OrcidInput name="orcid4" />
        </div>
        <span className="text-red-400 text-xs">{errors.orcid?.message}</span>
      </div>
      <div className="mt-8">
        <Controller
          name="googleScholar"
          control={control}
          render={({ field }) => (
            <InsetLabelSmallInput
              label="Google Scholar Profile"
              field={field}
              ref={register("googleScholar").ref}
              optional={true}
            />
          )}
        />
        <span className="text-red-400 text-xs">
          {errors.googleScholar?.message}
        </span>
      </div>
    </form>
  );
}
