import PrimaryButton from "@src/components/atoms/PrimaryButton";
// import InsetLabelSmallInput from "@components/molecules/FormInputs/InsetLabelSmallInput";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { HTMLProps, PropsWithChildren } from "react";
import { FlexRowSpaceBetween } from "@src/components/styled";
import SelectList from "@components/molecules/FormInputs/SelectList";
import {
  ResearchObjectContributorRole,
  ResearchObjectCredits,
} from "@desci-labs/desci-models";

interface ContributorParam {
  id: number;
  credit: ResearchObjectCredits;
  role: ResearchObjectContributorRole;
  name: string;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const creditRoles: Array<ContributorParam> = [
  {
    id: 0,
    credit: ResearchObjectCredits.AUTHOR,
    role: ResearchObjectContributorRole.ADMIN,
    name: "Author - Admin",
  },
  {
    id: 1,
    credit: ResearchObjectCredits.AUTHOR,
    role: ResearchObjectContributorRole.VIEWER,
    name: "Author - Viewer",
  },
  {
    id: 2,
    credit: ResearchObjectCredits.NODE_STEWARD,
    role: ResearchObjectContributorRole.ADMIN,
    name: "Node Steward - Admin",
  },
  {
    id: 3,
    credit: ResearchObjectCredits.NODE_STEWARD,
    role: ResearchObjectContributorRole.VIEWER,
    name: "Node Steward - Viewer",
  },
  {
    id: 4,
    credit: ResearchObjectCredits.NONE,
    role: ResearchObjectContributorRole.VIEWER,
    name: "Viewer",
  },
];

type InviteFormProps = {
  email: string;
  creditRole: ContributorParam;
};

const nodeInviteSchema = Yup.object().shape({
  email: Yup.string().email().required("Invalid email"),
  creditRole: Yup.mixed<ContributorParam>().test({
    name: "creditRole",
    message: "Select a node access control",
    test: (data) => {
      console.log("validate credit role", data);
      return true;
    },
  }),
});

export default function NodeInvite() {
  return (
    <div className="min-h-56 font-inter">
      <NodeInviteForm />
    </div>
  );
}

function NodeInviteForm() {
  const methods = useForm<InviteFormProps>({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      email: "",
      creditRole: creditRoles[2],
    },
    resolver: yupResolver(nodeInviteSchema),
  });

  const onSubmit = (data: InviteFormProps) => {
    console.log("submit", data);
  };

  const { control, handleSubmit, formState, watch } = methods;

  return (
    <FormProvider {...methods}>
      <form
        className="flex gap-4 items-center"
        onSubmit={handleSubmit(onSubmit)}
      >
        <InputFormGroup
          required
          isTouched={true}
          label="email"
          isValid={!!watch("email")}
        >
          <Controller
            name="email"
            control={control}
            render={({ field }: any) => (
              <input
                type="text"
                className="relative block w-full border-0 mt-2 p-0 text-sm leading-3 bg-transparent font-medium text-gray-900 dark:text-white dark:disabled:text-neutrals-gray-4 focus:outline-none focus:group:bg-black focus:ring-0 outline-none shadow-none"
                {...field}
              />
            )}
          />
          <Controller
            name="creditRole"
            control={control}
            render={({ field }: any) => {
              return (
                <SelectList
                  label="Assign role"
                  mandatory={true}
                  data={creditRoles}
                  field={field}
                  className="border-none border-0 border-transparent"
                />
              );
            }}
          />
        </InputFormGroup>
        <PrimaryButton
          disabled={!formState.isValid}
          isLoading={false}
          className="w-[120px] py-4 font-bold px-1"
          type="submit"
        >
          Send Invite
        </PrimaryButton>
      </form>
      <span className="text-red-400 text-xs">
        {formState.errors.email?.message}
      </span>
    </FormProvider>
  );
}

interface FormGroupProps {
  isTouched: boolean;
  required: boolean;
  isValid: boolean;
  multiline?: boolean;
  labelClassName?: string;
  textClassName?: string;
}

const InputFormGroup = (
  props: PropsWithChildren<FormGroupProps & HTMLProps<HTMLInputElement>>
) => {
  const {
    required,
    isTouched,
    className,
    labelClassName,
    disabled,
    label,
    isValid,
  } = props;

  return (
    <div
      className={`${
        isTouched && required && !isValid
          ? "border border-transparent border-b-rose-400"
          : "border border-transparent border-b-[#969696] focus-within:border-b-tint-primary-hover"
      } group rounded-sm px-3 py-2 shadow-sm bg-white dark:bg-[#272727] w-full relative ${className}`}
    >
      <label
        className={`absolute font-medium text-sm text-gray-900 dark:text-white pointer-events-none ${labelClassName} ${
          isValid ? "top-0 text-[10px]" : "top-2"
        } ${disabled ? "dark:text-neutrals-gray-4 text-neutrals-gray-4" : ""}`}
      >
        {label}
        {!required && (
          <span className="text-neutrals-gray-5 align-top text-[10px]">
            {" "}
            (optional)
          </span>
        )}
      </label>
      <FlexRowSpaceBetween>{props.children}</FlexRowSpaceBetween>
    </div>
  );
};
