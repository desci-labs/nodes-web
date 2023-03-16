import DefaultSpinner from "@src/components/atoms/DefaultSpinner";
import PrimaryButton from "@src/components/atoms/PrimaryButton";
import PopoverFooter from "@src/components/molecules/Footer";
import InsetLabelInput from "@src/components/molecules/FormInputs/InsetLabelInput";
import PdfHeader from "@src/components/organisms/PdfHeader";
import PopOver from "@src/components/organisms/PopOver";
import { site } from "@src/constants/routes";
import { IconInfo, IconWarning, IconX } from "@src/icons";
import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useLogin, { Steps } from "./useLogin";

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

const Footer = ({step, goBack, nextStep, isLoading}: any) => <PopoverFooter>
{[
  Steps.VerifyCode,
  Steps.WaitList,
  Steps.MagicLinkExpired,
].includes(step) && (
  <PrimaryButton
    className="bg-transparent hover:bg-transparent text-white hover:text-neutrals-gray-5"
    onClick={goBack}
    type="button"
  >
    Back
  </PrimaryButton>
)}
{[Steps.ConfirmEmail, Steps.VerifyCode].includes(step) && (
  <PrimaryButton disabled={isLoading} type="submit" onClick={nextStep}>
    {step === Steps.ConfirmEmail ? "Login" : "Continue"}
  </PrimaryButton>
)}
</PopoverFooter>

export default function Login() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const navigate = useNavigate();
  const { step, isLoading, error, onSubmitEmail, onVerifyCode, setStep } =
    useLogin();

  const inputRef = useRef<HTMLFormElement | null>(null);

  const handleRef = useCallback((node) => {
    console.log("Node", node);
    if (node) {
      inputRef.current = node;
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("valid", inputRef.current?.checkValidity());
    if (inputRef.current?.checkValidity()) {
      if (step === Steps.ConfirmEmail) {
        onSubmitEmail(email);
      } else if (step === Steps.VerifyCode) {
        onVerifyCode({ code, email });
      }
    }
  };

  const goBack = () => {
    if ([Steps.VerifyCode, Steps.WaitList].includes(step))
      return setStep(Steps.ConfirmEmail);

    if (step === Steps.MagicLinkExpired) return setStep(Steps.VerifyCode);
  };

  return (
    <>
      <PdfHeader />
      return (
      <PopOver
        isVisible
        style={{
          width: 400,
          maxWidth: "100%",
          margin: "3rem 0.75rem",
          overflow: "visible",
        }}
        containerClassName="flex items-center justify-center min-h-screen bg-neutrals-gray-3"
        className="rounded-lg bg-zinc-100 dark:bg-zinc-900"
        footer={useCallback(() => <Footer step={step} goBack={goBack} isLoading={isLoading} nextStep={handleSubmit} />, [step, goBack, isLoading])}
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
            <div className="text-xs text-state-error mb-1">{error}</div>
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
              <>
                <InsetLabelInput
                  label="Enter verification code"
                  className="mb-6 transition-transform animate-fadeIn"
                  value={code}
                  onChange={(e: any) => setCode(e.target.value)}
                  mandatory
                  field={{
                    type: "text",
                    minLength: 6,
                    maxLength: 6,
                    tabIndex: 0,
                    autoFocus: true,
                    required: true,
                    ref: handleRef,
                    disabled: isLoading,
                  }}
                />
                <div className="text-neutrals-gray-7 mb-4 text-xs border-tint-primary-300 gap-1 justify-center items-center p-4 rounded-md flex flex-row">
                  <IconInfo fill="rgba(216, 216, 216,1)" height={20} /> Sent to{" "}
                  <b>{email}</b>
                </div>
                <div className="text-neutrals-gray-7 text-sm border-yellow-300 gap-2 bg-neutrals-gray-3 p-4 rounded-md flex flex-row">
                  <IconWarning height={20} /> Please check your spam folder for
                  the email
                </div>
              </>
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
