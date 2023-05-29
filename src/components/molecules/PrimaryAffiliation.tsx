import * as Yup from "yup";
import { useUser } from "@src/state/user/hooks";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Controller,
  FormProvider,
  useForm,
  useFormContext,
} from "react-hook-form";
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

export const AffiliationForm = () => {
  const { control, setValue } = useFormContext<{
    organization: Organization[];
  }>();

  return (
    <div className="flex flex-col items-center w-full">
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
      <div className="flex justify-between gap-5 w-full mt-1">
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
      </div>
    </div>
  );
};

export default function PrimaryAffiliation(props: {
  hideInstitutionConnector?: boolean;
}) {
  const userProfile = useUser();

  const methods = useForm<{ organization: Organization[] }>({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      organization: userProfile.profile?.userOrganization ?? [],
    },
    resolver: yupResolver(rorPidSchema),
  });

  const {
    handleSubmit,
    formState: { isValid, isDirty, isSubmitting },
  } = methods;

  const { onSubmit } = useProfileSubmit({});

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col items-center gap-3">
          {/* <button
            type="button"
            disabled
            className={cx(
              "bg-gray-100 text-gray-900 disabled:bg-neutrals-gray-1 disabled:text-gray-500",
              "flex w-full align-middle bg-neutrals-gray-1 hover:bg-neutrals-gray-2 cursor py-2 px-[18px] border border-[#3C3C3C] rounded-lg text-base dark:text-neutrals-white "
            )}
          >
            <div className="text-sm font-medium text-gray-900 justify-start flex w-full">
              <div className="flex items-center text-neutrals-gray-4 flex items-center gap-4 self-baseline">
                <IconAffiliation
                  width={20}
                  className="-mb-1 inline-block self-baseline stroke-neutrals-gray-4"
                />{" "}
                Connect to your Institution (coming soon..)
              </div>
            </div>
          </button> */}

          {/* <Controller
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
        <div className="flex items-center justify-between justify-between gap-5 w-full">
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
        </div> */}
          <AffiliationForm />
          {isDirty ? (
            <div className="flex items-center justify-end w-full">
              <PrimaryButton
                disabled={!isValid || isSubmitting}
                className="flex gap-2"
                type="submit"
              >
                Save Affiliations
              </PrimaryButton>
            </div>
          ) : null}
        </div>
      </form>
    </FormProvider>
  );
}
