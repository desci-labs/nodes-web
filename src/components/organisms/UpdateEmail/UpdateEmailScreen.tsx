import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { memo, useEffect } from "react";

import IconSubTextHeader from "@src/components/molecules/IconSubTextHeader/IconSubTextHeader";
import { IconInfo } from "@src/icons";
import useProfileSubmit from "../Profile/useProfileSubmit";
import PrimaryButton from "@src/components/atoms/PrimaryButton";
import { isMaybeValidEmail } from "@src/lib/validation";
import { site } from "@src/constants/routes";
import InsetLabelSmallInput from "@src/components/molecules/FormInputs/InsetLabelSmallInput";
import { useUser } from "@src/state/user/hooks";

export const UpdateEmailScreen = memo(() => {
  const navigate = useNavigate();
  const userProfile = useUser();
  const { onSubmit: updateProfileSubmit, isSubmitting } = useProfileSubmit();

  const emailIsOrcIdUrn = userProfile.email?.includes("orcid:");
  const { control, watch, register, handleSubmit, formState } = useForm<{
    email: string;
  }>({
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      email: emailIsOrcIdUrn ? "" : userProfile.email,
    },
  });

  const email = watch("email");

  useEffect(() => {
    const userHasValidEmail = isMaybeValidEmail(userProfile.email);

    if (userHasValidEmail) {
      setTimeout(() => {
        navigate(site.app);
      }, 1000);
    }
  }, [userProfile, navigate]);

  useEffect(() => {
    register("email", {
      validate: (value) => {
        if (!value) {
          return undefined;
        }

        const isValidEmail = isMaybeValidEmail(value);
        if (!isValidEmail) {
          return `Sorry, inputted email is not valid`;
        } else {
          return undefined;
        }
      },
    });
  }, [register, formState]);

  const onSubmit = async () => {
    if (email) {
      try {
        await updateProfileSubmit({ email });
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div
      className={`h-screen w-screen fixed left-0 pl-16 pt-14 top-0 z-[102] will-change-transform transition-opacity duration-150 bg-neutrals-black opacity-100`}
    >
      <div className="pt-14 bg-neutrals-black flex flex-col sm:flex-row h-full overflow-y-scroll w-full text-white">
        <div className="flex flex-col mx-auto">
          <IconSubTextHeader
            headerText="Please complete your profile"
            subText="A valid email is required to complete your profile."
            withCircleBorder={false}
            Icon={() => <IconInfo fill="white" width="100%" height="100%" />}
          />

          <div>
            <form
              name="updateEmailForm"
              id="updateEmailForm"
              className="w-full flex flex-col"
              onSubmit={handleSubmit(onSubmit)}
            >
              <Controller
                name="email"
                control={control}
                defaultValue={email}
                render={({ field }) => {
                  return (
                    <div className="my-6">
                      <InsetLabelSmallInput
                        label="Email"
                        field={field}
                        mandatory={true}
                      />
                      <p className="mt-1 text-red-400 text-xs">
                        {formState.errors.email?.message}
                      </p>
                    </div>
                  );
                }}
              />

              <div className="justify-end place-items-end flex">
                <PrimaryButton
                  type="submit"
                  disabled={
                    isSubmitting || !email || Boolean(formState.errors.email)
                  }
                >
                  Submit
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
});

export default function UpdateEmail() {
  return <UpdateEmailScreen />;
}
