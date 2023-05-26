import { memo, useEffect, useRef } from "react";
import { Controller, useFormContext } from "react-hook-form";
import validUrl from "valid-url";
import InsetLabelSmallInput from "@components/molecules/FormInputs/InsetLabelSmallInput";
import { ProfileValues } from "@src/components/organisms/Profiler";
import useProfileSubmit from "./Profile/useProfileSubmit";
import PrimaryButton from "@components/atoms/PrimaryButton";
import { useManuscriptController } from "./ManuscriptReader/ManuscriptController";
import { useUser } from "@src/state/user/hooks";

export interface Profile {
  email?: string;
  name?: string;
  orcid?: string;
  googleScholarUrl?: string;
}

interface ProfileFormProps {
  viewOnly: boolean;
}
const validateGoogleScholarUrl = (value: any) => {
  if (!value) {
    return undefined;
  }

  /**
   * TODO: Do we want to enforce user typing https?
   * This will allow https or empty
   */
  const uriToCheck = value.includes("http://") ? value : `https://${value}`;

  /**
   * 'isWebUri' requires http or https to be there
   * https://github.com/ogt/valid-url/blob/master/test/is_web_uri.js
   * This is why we add it above if it's not there
   */
  const isValidUri = Boolean(validUrl.isWebUri(uriToCheck));

  const containsGoogleScholar = value?.includes("scholar.google.com");
  const isValidGoogleScholarUrl = isValidUri && containsGoogleScholar;

  if (isValidGoogleScholarUrl) {
    return undefined;
  } else {
    /**
     * TODO: Get proper error message from design
     */
    return "URL is not a valid google scholar profile";
  }
};

const UserProfileForm = (props: ProfileFormProps) => {
  const userProfile = useUser();
  const { control, register, handleSubmit, formState } =
    useFormContext<ProfileValues>();
  const { setShowProfileUpdater } = useManuscriptController();
  const { onSubmit, isSubmitting } = useProfileSubmit({
    onClose: () => setShowProfileUpdater(false),
  });
  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;
    register("googleScholarUrl", {
      validate: validateGoogleScholarUrl,
    });
  }, [register, formState]);

  return (
    <div className="">
      <section className="flex flex-col w-full items-center  md:min-w-[400px]">
        <form
          name="userProfileForm"
          id="userProfileForm"
          className="w-full"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="leading-3">
            <span
              className={`font-medium text-white pointer-events-none text-xs`}
            >
              Email address
            </span>
            <p className="text-sm h-5">{userProfile?.email}</p>
          </div>
          <span className="text-neutrals-gray-5 text-[14px]">
            Your email address will{" "}
            <span className="border-b border-neutrals-gray-5">not</span> be
            shared.
          </span>
          <Controller
            name="name"
            control={control}
            render={({ field }: any) => (
              <InsetLabelSmallInput
                label="Full Name"
                {...field}
                optional={false}
                className="my-6"
              />
            )}
          />
          <div className="my-6">
            <Controller
              name="googleScholarUrl"
              control={control}
              render={({ field }) => (
                <InsetLabelSmallInput
                  label="Google Scholar Profile"
                  {...field}
                  optional={true}
                />
              )}
            />
            <span className="text-red-400 text-xs">
              {formState.errors.googleScholarUrl?.message}
            </span>
          </div>
          {props.viewOnly && (
            <div className="flex justify-end items-center">
              <PrimaryButton
                disabled={isSubmitting}
                isLoading={isSubmitting}
                className="flex gap-2"
              >
                {isSubmitting ? "saving" : "Save changes"}
              </PrimaryButton>
            </div>
          )}
        </form>
      </section>
    </div>
  );
};

export default memo(UserProfileForm);
