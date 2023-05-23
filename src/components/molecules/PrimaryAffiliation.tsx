import * as Yup from "yup";

import cx from "classnames";
import {
  IconAffiliation,
} from "@icons";
import { useUser } from "@src/state/user/hooks";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import {
  FlexColumnAligned,
  FlexRowAligned,
  FlexRowSpaceBetween,
} from "@components/styled";
import PrimaryButton from "../atoms/PrimaryButton";
import AffiliateSelector from "./AffiliateSelector";
import { Organization } from "@src/types/client";
import useProfileSubmit from "../organisms/Profile/useProfileSubmit";

const rorPidSchema = Yup.object().shape({
  organization: Yup.mixed<{ id: string; name: string }>().test({
    name: "Organization",
    message: "Invalid organization",
    test: (data) => {
      return true;
    },
  }),
});

export default function PrimaryAffiliation() {
  const userProfile = useUser();

  const {
    control,
    setValue,
    handleSubmit,
    formState: { isValid, isDirty, isSubmitting },
  } = useForm<{ organization: Organization[] }>({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      organization: userProfile.profile?.userOrganization ?? [],
    },
    resolver: yupResolver(rorPidSchema),
  });

  const { onSubmit } = useProfileSubmit({});

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FlexColumnAligned className="gap-3">
        <button
          type="button"
          disabled
          className={cx(
            "bg-gray-100 text-gray-900 disabled:bg-neutrals-gray-1 disabled:text-gray-500",
            "flex w-full align-middle bg-neutrals-gray-1 hover:bg-neutrals-gray-2 cursor py-2 px-[18px] border border-[#3C3C3C] rounded-lg text-base dark:text-neutrals-white "
          )}
        >
          <div className="text-sm font-medium text-gray-900 justify-start flex w-full">
            <FlexRowAligned className="text-neutrals-gray-4 flex items-center gap-4 self-baseline">
              <IconAffiliation
                width={20}
                className="-mb-1 inline-block self-baseline stroke-neutrals-gray-4"
              />{" "}
              Connect to your Institution (coming soon..)
            </FlexRowAligned>
          </div>
        </button>

        <Controller
          name="organization"
          control={control}
          render={({ field }: any) => (
            <AffiliateSelector
              defaultValues={field.value ?? []}
              onChange={(val: Organization[]) => {
                setValue("organization", val, {
                  shouldValidate: true,
                  shouldDirty: true,
                });
              }}
            />
          )}
        />
        <FlexRowSpaceBetween className="justify-between gap-5 w-full">
          <p className="text-sm text-neutrals-gray-5">
            Tap enter to add multiple affiliations.
          </p>
          <a
            className="flex flex-row gap-1 items-center text-sm font-extrabold text-tint-primary hover:text-tint-primary-hover tracking-tight disabled:text-neutrals-gray-4"
            href="https://ror.org/search"
            target="_blank"
            rel="noreferrer"
          >
            Find ROR PID
          </a>
        </FlexRowSpaceBetween>
        {isDirty ? (
          <FlexRowAligned className="items-center justify-end w-full">
            <PrimaryButton
              disabled={!isValid || isSubmitting}
              className="flex gap-2"
              type="submit"
            >
              Save Affiliations
            </PrimaryButton>
          </FlexRowAligned>
        ) : null}
      </FlexColumnAligned>
    </form>
  );
}
