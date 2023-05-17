import PrimaryButton from "@src/components/atoms/PrimaryButton";
import { useCallback, useEffect, useMemo } from "react";
import {
  Controller,
  FormProvider,
  useForm,
  useFormContext,
} from "react-hook-form";
import PerfectScrollbar from "react-perfect-scrollbar";
import Modal, { ModalProps } from "@src/components/molecules/Modal";
import { ProfileRegistrationValues } from "./types";
import { useUser } from "@src/state/user/hooks";
// import { useAppPreferences } from "@src/state/preferences/hooks";
import { yupResolver } from "@hookform/resolvers/yup";
import { ROR_API_URL, ROR_URL, userProfileActionSchema } from "./schema";
import InsetLabelSmallInput from "@src/components/molecules/FormInputs/InsetLabelSmallInput";
import DividerSimple from "@src/components/atoms/DividerSimple";
import { FlexColumn, FlexRowAligned } from "@src/components/styled";
import { CheckBox, CheckBoxText } from "@src/components/atoms/Checkbox";
// import { useSetter } from "@src/store/accessors";
// import { setPreferences } from "@src/state/preferences/preferencesSlice";
import useProfileSubmit from "./useProfileSubmit";
import { termsConsent } from "@src/api";
import axios from "axios";

export interface ProfilePopOverProps {
  onDismiss?: () => void;
}

const useRoRResolver = () => {
  const {
    watch,
    setValue,
    formState: { isValid },
  } = useFormContext<ProfileRegistrationValues>();
  const rorId = watch("rorpid");
  const hasAffiliation = watch("hasAffiliation");

  const resolveOrgName = useCallback(async () => {
    try {
      // const urlParts = rorId?.split("/") ?? [];
      const pid = rorId || ""; // urlParts[urlParts.length - 1];
      const { data: org, status } = await axios.get(`${ROR_API_URL}${pid}`);
      if (status === 200 && org?.name) {
        setValue("organization", org.name);
      }
    } catch (e) {
      //
      setValue("organization", "");
    }
  }, [rorId, setValue]);

  useEffect(() => {
    if (rorId) {
      resolveOrgName();
    }
  }, [hasAffiliation, isValid, resolveOrgName, rorId]);
};

export function ProfileRegistrationForm(props: ProfilePopOverProps) {
  // const dispatch = useSetter();
  // const { showProfileRegistration } = useAppPreferences();
  const {
    watch,
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useFormContext<ProfileRegistrationValues>();

  // autofill organisation name
  useRoRResolver();

  const { onSubmit } = useProfileSubmit({
    onClose: async () => {
      await termsConsent({ hasAcceptedTerms: true }, "");
      // dispatch(setPreferences({ showProfileRegistration: false }));
    },
  });

  // if (!showProfileRegistration) return null;

  const hasAffiliation = watch("hasAffiliation");
  const rorpid = watch("rorpid");

  return (
    <PerfectScrollbar className="overflow-auto my-3">
      <div className="py-2 flex justify-center items-center max-h-[650px]">
        <form
          name="profileRegistrationForm"
          id="profileRegistrationForm"
          className="w-full"
          onSubmit={handleSubmit(onSubmit)}
        >
          <Controller
            name="name"
            control={control}
            render={({ field }: any) => (
              <InsetLabelSmallInput
                label="Full Name"
                optional={false}
                className="my-6 w-full"
                {...field}
              />
            )}
          />
          <div className="mb-6">
            <Controller
              name="googleScholarUrl"
              control={control}
              render={({ field }) => (
                <InsetLabelSmallInput
                  label="Google Scholar Profile"
                  {...field}
                  ref={register("googleScholarUrl").ref}
                  optional={true}
                  className="mb-3 w-full"
                />
              )}
            />
            <span className="text-red-400 text-xs">
              {errors.googleScholarUrl?.message}
            </span>
          </div>
          <DividerSimple />
          <Controller
            name="organization"
            control={control}
            render={({ field }: any) => (
              <InsetLabelSmallInput
                label="Organization Name"
                optional={false}
                className="my-6 w-full"
                {...field}
                disabled={hasAffiliation}
              />
            )}
          />
          <FlexRowAligned style={{ marginTop: 20, paddingLeft: 5 }}>
            <CheckBox {...register("hasAffiliation", { required: true })} />
            <CheckBoxText
              htmlFor="hasAffiliation"
              className="text-[14px] font-inter text-white"
            >
              I’m not affiliated with a research organization
            </CheckBoxText>
          </FlexRowAligned>
          <FlexColumn style={{ display: hasAffiliation ? "none" : "flex" }}>
            <Controller
              name="rorpid"
              control={control}
              render={({ field }) => (
                <InsetLabelSmallInput
                  label="ROR PID (Optional)"
                  {...field}
                  ref={register("rorpid").ref}
                  optional={false}
                  className="mt-6 mb-3 w-full"
                />
              )}
            />
            {errors.rorpid?.message ? (
              <span className="text-red-400 text-xs h-8 block">
                {errors.rorpid?.message}
              </span>
            ) : (
              <a
                className="flex flex-row gap-1 items-center text-md font-extrabold text-tint-primary hover:text-tint-primary-hover tracking-tight disabled:text-neutrals-gray-4"
                href={`${ROR_URL}${rorpid}`}
                target="_blank"
                rel="noreferrer"
                aria-disabled={!!errors?.rorpid}
              >
                Find Organization ROR PID
              </a>
            )}
          </FlexColumn>
        </form>
      </div>
    </PerfectScrollbar>
  );
}

export const ProfilePromptModal = (props: ModalProps) => {
  // const { showProfileRegistration } = useAppPreferences();
  const userProfile = useUser();
  const methods = useForm<ProfileRegistrationValues>({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      hasAffiliation: false,
      hasAcceptedTerms: false,
      name: userProfile.profile?.name ?? "",
      rorpid: userProfile.profile?.rorpid ?? "",
      organization: userProfile.profile?.organization ?? "",
      googleScholarUrl: userProfile.profile?.googleScholarUrl ?? "",
    },
    resolver: yupResolver(userProfileActionSchema),
  });
  const { register, formState } = methods;
  const formProps = useMemo(() => methods, [methods]);

  return (
    <Modal isOpen={false} $scrollOverlay={true} $maxWidth={700}>
      <div className="py-4 px-6 text-neutrals-gray-5 font-inter">
        <Modal.Header
          title="Complete Your Profile"
          subTitle="Type in your full name and choose the institution to which you are a member to be credited correctly in this Node."
          hideCloseIcon={true}
        />
        <FormProvider {...formProps}>
          <ProfileRegistrationForm />
        </FormProvider>
      </div>
      <Modal.Footer>
        <FlexRowAligned>
          <CheckBox {...register("hasAcceptedTerms", { required: true })} />
          <CheckBoxText
            htmlFor="hasAcceptedTerms"
            className="text-[14px] text-white font-inter"
          >
            By checking, you agree to our{" "}
            <a
              href="/terms"
              target="_blank"
              rel="noreferrer"
              className="text-tint-primary"
            >
              Terms of Service{" "}
            </a>
            and{" "}
            <a
              href="/privacy"
              target="_blank"
              rel="noreferrer"
              className="text-tint-primary"
            >
              Privacy Policy
            </a>
          </CheckBoxText>
        </FlexRowAligned>
        <PrimaryButton
          disabled={!formState.isValid || methods.formState.isSubmitting}
          form="profileRegistrationForm"
          className="flex gap-2"
        >
          Get Started
        </PrimaryButton>
      </Modal.Footer>
    </Modal>
  );
};
