import DefaultSpinner from "@src/components/atoms/DefaultSpinner";
import PrimaryButton from "@src/components/atoms/PrimaryButton";
import PopoverFooter from "@src/components/molecules/Footer";
import InsetLabelInput from "@src/components/molecules/FormInputs/InsetLabelInput";
import PdfHeader from "@src/components/organisms/PdfHeader";
import PopOver from "@src/components/organisms/PopOver";
import { site } from "@src/constants/routes";
import { IconGreenCheck, IconWarning, IconX } from "@src/icons";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useLogin, { Steps } from "./useLogin";
import { useGetter } from "@src/store/accessors";
import VerificationInput from "react-verification-input";
import { MailIcon } from "@heroicons/react/solid";

const labels: Record<Steps, { title: string; caption: string }> = {
  [Steps.AutoLogin]: {
    title: "Verifying magic link",
    caption: "Please wait while we log you in",
  },
  [Steps.ConfirmEmail]: {
    title: "Let's Begin",
    caption: "Welcome, enter and confirm your email address",
  },
  [Steps.VerifyCode]: {
    title: "Just One More Step",
    caption: "Enter your verification code to enter the application",
  },
  [Steps.WaitList]: {
    title: "You're on the waitlist!",
    caption: "We'll send you an email when your invite is ready.",
  },
  [Steps.MagicLinkExpired]: {
    title: "Magic link expired!",
    caption: "Unfortunately this code is no longer valid, please try again.",
  },
};

const Footer = ({ step, goBack, nextStep, isLoading, code }: any) => {
  const { checkingCode } = useGetter((state) => state.preferences);
  return (
    <PopoverFooter>
      {[Steps.VerifyCode, Steps.WaitList, Steps.MagicLinkExpired].includes(
        step
      ) && (
        <PrimaryButton
          className="bg-transparent hover:bg-transparent text-white hover:text-neutrals-gray-5"
          onClick={goBack}
          type="button"
        >
          Back
        </PrimaryButton>
      )}
      {[Steps.ConfirmEmail, Steps.VerifyCode].includes(step) && (
        <PrimaryButton
          disabled={isLoading || (step === Steps.VerifyCode && code?.length < 6)}
          type="submit"
          onClick={nextStep}
          className="flex gap-2 items-center"
        >
          {step === Steps.ConfirmEmail ? "Login" : "Continue"}{" "}
          {isLoading && checkingCode && (
            <DefaultSpinner color="white" size={20} />
          )}
          {step === Steps.VerifyCode && isLoading && !checkingCode && (
            <IconGreenCheck width={20} />
          )}
        </PrimaryButton>
      )}
    </PopoverFooter>
  );
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const navigate = useNavigate();
  const {
    step,
    isLoading,
    error,
    onSubmitEmail,
    onVerifyCode,
    setStep,
    reset,
  } = useLogin();

  const inputRef = useRef<HTMLFormElement | null>(null);
  const codeRef = useRef<HTMLInputElement | null>(null);

  const handleRef = useCallback((node) => {
    if (node) {
      inputRef.current = node;
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputRef.current?.checkValidity()) {
      if (step === Steps.ConfirmEmail) {
        onSubmitEmail(email);
      }
    }
    if (codeRef.current) {
      codeRef.current.focus();
    }
  };

  /**auto-focus code field */
  useEffect(() => {
    if (step === Steps.VerifyCode) {
      codeRef.current?.focus();
    }
  }, [step]);

  /**
   * clear code if error
   */
  useEffect(() => {
    if (error) {
      setCode("");
    }
  }, [error]);

  const goBack = () => {
    if ([Steps.VerifyCode, Steps.WaitList].includes(step)) {
      reset();
      return setStep(Steps.ConfirmEmail);
    }

    if (step === Steps.MagicLinkExpired) return setStep(Steps.VerifyCode);
  };

  return (
    <>
      <PdfHeader />(
      <PopOver
        isVisible
        containerClassName="flex items-center justify-center min-h-screen bg-neutrals-gray-3"
        className="bg-zinc-100 dark:bg-zinc-900 rounded-lg !max-w-none !w-fit !mx-2 sm:m-[initial] sm:py-0 sm:w-[400px] sm:mx-12 !sm:my-3 overflow-visible"
        footer={useCallback(
          () => (
            <Footer
              code={code}
              step={step}
              goBack={goBack}
              isLoading={isLoading}
              nextStep={handleSubmit}
            />
          ),
          // eslint-disable-next-line react-hooks/exhaustive-deps
          [step, goBack, isLoading]
        )}
        onClick={() => {
          if (step === Steps.VerifyCode) {
            codeRef.current?.focus();
          }
          if (step === Steps.ConfirmEmail) {
            inputRef.current?.focus();
          }
        }}
      >
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5">
            <div className="flex flex-row justify-between items-start mb-4">
              <div className="text-left">
                <span className="block text-2xl font-bold text-white">
                  {labels[step].title}
                </span>
                <span className="text-xs block text-neutrals-gray-5">
                  {labels[step].caption}
                </span>
              </div>
              {step !== Steps.AutoLogin ? (
                <IconX
                  fill="white"
                  width={20}
                  height={20}
                  className="cursor-pointer"
                  onClick={() => {
                    navigate(`${site.web}`);
                  }}
                />
              ) : (
                ""
              )}
            </div>
            <div
              className={`text-xs ${
                error ? "bg-red-900" : ""
              } px-2 rounded-md text-center py-1 font-bold text-white mb-1`}
            >
              {error}&nbsp;
            </div>
            {step === Steps.ConfirmEmail && (
              <InsetLabelInput
                label="Enter email"
                field={{
                  type: "email",
                  autoFocus: true,
                  ref: handleRef,
                  required: true,
                  disabled: isLoading,
                }}
                className="mb-6 transition-transform animate-fadeIn"
                value={email}
                onChange={(e: any) => setEmail(e.target.value)}
                mandatory
              />
            )}
            {step === Steps.VerifyCode && (
              <div className="flex flex-col items-center">
                <VerificationInput
                  classNames={{
                    container: "my-4 transition-transform animate-fadeIn",
                  }}
                  value={code}
                  onComplete={(e: any) => onVerifyCode({ code: e, email })}
                  onChange={(e: any) => setCode(e)}
                  validChars="/0-9/"
                  placeholder="_"
                  inputProps={{
                    id: "box-search", // use search in id to disable 1password autofill prompt
                    ref: (r: any) => (codeRef.current = r),
                    autoComplete: "off",
                    disabled: isLoading,
                  }}
                />
                <div className="text-neutrals-gray-7 mb-4 text-xs border-tint-primary-300 gap-1 justify-center items-center p-4 rounded-md flex flex-row">
                  <MailIcon fill="rgba(216, 216, 216,1)" height={20} /> Sent to{" "}
                  <b>{email}</b>
                </div>
                <div className="text-neutrals-gray-7 text-xs sm:text-sm items-center border-yellow-300 gap-4 md:gap-3 bg-neutrals-gray-3 p-4 rounded-md flex flex-row">
                  <IconWarning height={20} /> Please check your spam folder for
                  the email
                </div>
              </div>
            )}
            {step === Steps.AutoLogin && (
              <div className="flex justify-center w-full items-center">
                <DefaultSpinner size="45" />
              </div>
            )}
          </div>
        </form>
      </PopOver>
      );
    </>
  );
}
