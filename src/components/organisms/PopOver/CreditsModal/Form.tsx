import { ModalProps } from "@src/components/molecules/Modal/Modal";
import { Controller, useFormContext } from "react-hook-form";
import InsetLabelSmallInput from "@src/components/molecules/FormInputs/InsetLabelSmallInput";
import DividerSimple from "@src/components/atoms/DividerSimple";
import { AuthorFormValues, CreditModalProps } from "./schema";
import useCreditsForm from "./useCreditsForm";
import SelectList from "@src/components/molecules/FormInputs/SelectList";
import { ResearchObjectV1AuthorRole } from "@desci-labs/desci-models";
import { PatternFormat } from "react-number-format";
import { ExternalLinkIcon } from "@heroicons/react/solid";

const authorRoles = Object.values(ResearchObjectV1AuthorRole).map(
  (role, idx) => ({
    id: idx,
    name: role,
  })
);

const ORCID_SITE = "https://orcid.org/";
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

  const selectedRole = watch("role");
  const orcid = watch("orcid");

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
        <Controller
          name="orcid"
          control={control}
          render={({ field }: any) => (
            <PatternFormat
              value={orcid}
              placeholder="0000-0000-0000-0000"
              format="####-####-####-####"
              className="bg-transparent relative block w-full my-2 font-medium text-gray-900 dark:text-white focus:ring-0 outline-none focus:outline-none border border-transparent border-b border-b-[#969696] focus:border-0 focus:border-b-tint-primary-hover focus:border-b focus-within:border-b-tint-primary-hover px-3 py-2 shadow-sm bg-white dark:bg-[#272727]"
              {...field}
            />
          )}
        />
        {(errors.orcid?.message) ? (<span className="text-red-400 text-xs h-8 block">{errors.orcid?.message}</span>) : (
          <a
            className="flex flex-row gap-1 items-center h-8 text-md font-extrabold text-tint-primary hover:text-tint-primary-hover tracking-tight disabled:text-neutrals-gray-4"
            href={`${errors?.orcid ? "" : `${ORCID_SITE}${orcid}`}`}
            target="_blank"
            rel="noreferrer"
            aria-disabled={!!errors?.orcid}
          >
            Open ORCiD Record <ExternalLinkIcon height={16} />
          </a>
        )}
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

