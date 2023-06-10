import PrimaryButton from "@src/components/atoms/PrimaryButton";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { HTMLProps, PropsWithChildren } from "react";
import { FlexColumnAligned, FlexRowSpaceBetween } from "@src/components/styled";
import SelectList from "@components/molecules/FormInputs/SelectList";
import {
  ResearchObjectContributorRole,
  ResearchObjectCredits,
} from "@desci-labs/desci-models";
import {
  useGetAccessRolesQuery,
  useGetContributorsQuery,
  useGetInvitesQuery,
  useSendNodeInviteMutation,
} from "@src/state/api/nodes";
import { useNodeReader } from "@src/state/nodes/hooks";
import toast from "react-hot-toast";
import { CustomError } from "@src/state/api";
import { useUser } from "@src/state/user/hooks";
import { Contributor, InviteResponse } from "@src/state/api/types";

interface ContributorParam {
  id: number;
  credit: ResearchObjectCredits;
  role: ResearchObjectContributorRole;
  name: string;
}

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
      return true;
    },
  }),
});

function NodeAccessRow(props: { collaborator: Contributor }) {
  const { collaborator: accessUser } = props;

  return (
    <span>
      {accessUser.user?.name || accessUser.user.email} - {accessUser.role.credit}
    </span>
  );
}

function PendingInvite(props: { invite: InviteResponse }) {
  const { invite } = props;

  return (
    <span>
      {invite?.receiver?.name ?? invite.email} - {invite.role.credit}
    </span>
  );
}

export default function NodeInvite() {
  const { currentObjectId: uuid } = useNodeReader();
  const { data: invites } = useGetInvitesQuery(uuid!, {
    skip: !uuid,
  });
  const { data: items } = useGetContributorsQuery(uuid!, {
    skip: !uuid,
  });

  return (
    <div className="min-h-56 font-inter my-5">
      <NodeInviteForm />
      <FlexColumnAligned className="mt-5">
        {items && items.map((item) => <NodeAccessRow collaborator={item} />)}
        {invites && invites.map((item) => <PendingInvite invite={item} />)}
      </FlexColumnAligned>
    </div>
  );
}

function NodeInviteForm() {
  const { currentObjectId } = useNodeReader();
  const userProfile = useUser();
  const { data: creditRoles, isLoading, isError } = useGetAccessRolesQuery();
  const [sendInvite, { isLoading: isSendingInvite }] =
    useSendNodeInviteMutation();

  const methods = useForm<InviteFormProps>({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      email: "",
      creditRole: (creditRoles ?? [])[0],
    },
    resolver: yupResolver(nodeInviteSchema),
  });

  const onSubmit = async (data: InviteFormProps) => {
    if (data.email.toLowerCase() === userProfile.email.toLowerCase()) {
      return;
    }

    const res = await sendInvite({
      roleId: data.creditRole.id,
      email: data.email,
      uuid: currentObjectId!,
    });

    if ("data" in res && res.data?.ok === true) {
      toast.success(res.data.message || "Invitation sent", {
        style: {
          marginTop: 50,
          borderRadius: "10px",
          background: "#333333",
          color: "#fff",
        },
      });
    } else {
      const error = "error" in res && (res.error as CustomError);

      if (typeof error !== "boolean" && "data" in error) {
        toast.error(error.data.message, {
          style: {
            marginTop: 50,
            borderRadius: "10px",
            background: "#333333",
            color: "#fff",
          },
        });
      } else {
        toast.error(
          "Error sending invite, check your network connection and try again!",
          {
            style: {
              marginTop: 50,
              borderRadius: "10px",
              background: "#333333",
              color: "#fff",
            },
          }
        );
      }
    }
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
          label="Email"
          isValid={!!watch("email")}
        >
          <Controller
            name="email"
            control={control}
            render={({ field: { ref, ...fields } }: any) => (
              <input
                type="text"
                className="relative block w-full border-0 mt-2 p-0 text-sm leading-3 bg-transparent font-medium text-gray-900 dark:text-white dark:disabled:text-neutrals-gray-4 focus:outline-none focus:group:bg-black focus:ring-0 outline-none shadow-none"
                {...fields}
              />
            )}
          />
          <Controller
            name="creditRole"
            control={control}
            defaultValue={{
              id: 0,
              name: "Assign role",
              credit: ResearchObjectCredits.NONE,
              role: ResearchObjectContributorRole.VIEWER,
            }}
            render={({ field }: any) => {
              return (
                <SelectList
                  disabled={isLoading || isError}
                  label="Assign role"
                  mandatory={true}
                  data={creditRoles ?? []}
                  field={field}
                  className="border-none border-0 border-transparent"
                  optionsWrapperClassName="min-w-[300px] left-0"
                />
              );
            }}
          />
        </InputFormGroup>
        <PrimaryButton
          disabled={isSendingInvite || !formState.isValid}
          isLoading={isSendingInvite}
          className="min-w-[120px] shrink-0 py-4 font-bold px-1 flex justify-center gap-2"
          type="submit"
        >
          {isSendingInvite ? "pending" : "Send Invite"}
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
          isValid ? "top-0 text-[10px]" : "top-6 capitalize"
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
