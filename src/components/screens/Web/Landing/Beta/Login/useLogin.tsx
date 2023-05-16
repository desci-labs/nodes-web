import {
  checkConsent,
  getUserData,
  magicLinkSend,
  patchAcceptFriendReferral,
  waitlistAdd,
} from "@src/api";
import { useEffect, useRef, useState } from "react";
import queryString from "query-string";
import { useLocation, useNavigate } from "react-router-dom";
import { app, site } from "@src/constants/routes";
import { api } from "@src/state/api";
import { tags } from "@src/state/api/tags";
import { useSetter } from "@src/store/accessors";
import { useRedeemMagicLinkMutation } from "@src/state/api/auth";
import { setUser } from "@src/state/user/userSlice";
import { setCheckingCode, setPreferences } from "@src/state/preferences/preferencesSlice";

export enum Steps {
  AutoLogin,
  ConfirmEmail,
  WaitList,
  VerifyCode,
  MagicLinkExpired,
}

export default function useLogin() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(Steps.ConfirmEmail);
  const autoLoginRef = useRef(false);
  const dispatch = useSetter();
  const [redeemMagicLink] = useRedeemMagicLinkMutation();

  const magicQuery = queryString.parse(search) as { e: string; c: string };

  useEffect(() => {
    if (autoLoginRef.current) return;
    autoLoginRef.current = true;
    if (magicQuery.c && magicQuery.e) {
      setStep(Steps.AutoLogin);
      onVerifyCode({ email: magicQuery.e, code: magicQuery.c });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [magicQuery]);

  const onSubmitEmail = async (email: string) => {
    if (isLoading) return;
    setError("");
    setIsLoading(true);

    try {
      setIsLoading(true);
      await waitlistAdd(email);
      setStep(Steps.WaitList);
      setIsLoading(false);
    } catch (err) {
      let e = err as unknown as { [key: string]: any };
      console.log("ERRRRR", e?.response, e);
      setIsLoading(false);

      let resp = (err as any).response;
      if (!resp) {
        setError("Notice: Network error");
        return;
      }
      const errorMessage = resp.data.error;
      if (errorMessage === "Already on waitlist") {
        setError(errorMessage);
        // display waitlist UI
        setStep(Steps.WaitList);
        return;
      }

      if (
        errorMessage === "User already exists" ||
        errorMessage === "User already invited"
      ) {
        // don't wait
        magicLinkSend(email);
        setStep(Steps.VerifyCode);
        return;
      }

      if (resp.status === 400) {
        setError("An unknown error occurred!!");
        return;
      }

      setError("Notice: " + errorMessage);
    }
  };

  const onVerifyCode = async ({
    code,
    email,
  }: {
    code: string;
    email: string;
  }) => {
    if (isLoading) return;
    setError("");
    setIsLoading(true);
    // setCheckingCode(true);
    dispatch(setCheckingCode(true));

    try {
      const data = await redeemMagicLink({ email, code }).unwrap();
      const referralUuid = queryString.parse(search).referralUuid as string;

      if (!data.user.token) {
        throw Error("Login failed");
      }
      const userData = await getUserData();
      dispatch(setUser(userData));
      dispatch(api.util.invalidateTags([{ type: tags.user }]));

      if (referralUuid) {
        /**
         * TODO: We likely want to show a success or something similar
         * Can be future feature
         * Along with some sort of retry logic incase it failed
         */
        await patchAcceptFriendReferral(referralUuid);
      }

      // setIsLoading(false);
      // setCheckingCode(false);
      dispatch(setCheckingCode(false));

      const { consent } = await checkConsent();
      setTimeout(() => {
        navigate(`${site.app}${app.nodes}/start`);

        // check if profile is valid
        if (!consent) {
          dispatch(setPreferences({ showProfileRegistration: true }));
        }

      }, 500);
    } catch (err) {
      if (step === Steps.AutoLogin || step === Steps.VerifyCode) {
        setIsLoading(false);
        let resp = err as any;
        let errorMessage = resp.data.error;
        if (errorMessage === "Not found") {
          errorMessage = "Code invalid or expired";
          setStep((prevStep) =>
            prevStep !== Steps.VerifyCode || Steps.AutoLogin
              ? prevStep
              : Steps.VerifyCode
          );
        }
        setError(errorMessage);
      }
      dispatch(setCheckingCode(false));
    }
  };

  const reset = () => {
    setError("");
    setIsLoading(false);
    setStep(Steps.ConfirmEmail);
  };

  return {
    step,
    reset,
    setError,
    isLoading,
    error,
    onSubmitEmail,
    onVerifyCode,
    setStep,
  };
}
