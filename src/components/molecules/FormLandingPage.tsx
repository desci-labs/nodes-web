import queryString from "query-string";
import { useLocation, useNavigate } from "react-router-dom";

import { magicLinkSend, waitlistAdd } from "@api/index";
import { useEffect, useRef } from "react";
import { site } from "@src/constants/routes";
import { __log } from "../utils";

let tempEmail = "";

interface FormLandingPageProps {
    loading: boolean;
    setLoading: (l: boolean)=>void;
    errorMessage: string | undefined;
    setErrorMessage: (e:string)=>void;
    setDone: (b:boolean) => void;
}

const FormLandingPage = ({loading, setLoading, setDone, setErrorMessage, errorMessage}:FormLandingPageProps) => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const referralUuid = queryString.parse(search).referralUuid;

  const emailInput = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    emailInput.current!.value = tempEmail;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, errorMessage]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    tempEmail = emailInput.current?.value || "";
    if (!tempEmail) {
      return;
    }
    try {
      setLoading(true);
      setErrorMessage("");
      const ret = await waitlistAdd(tempEmail);
      __log("ret", ret);
      emailInput.current!.value = "";
      setDone(true);
    } catch (err) {
      // alert(JSON.stringify(err));
      let resp = (err as any).response;
      if (!resp) {
        setErrorMessage("Notice: Network error");
        setTimeout(() => {
          emailInput.current!.value = tempEmail;
        });
        return;
      }
      const errorMessage = resp.data.error;
      if (errorMessage === "Already on waitlist") {
        setDone(true);
        emailInput.current!.value = "";
        return;
      }
      if (
        errorMessage === "User already exists" ||
        errorMessage === "User already invited"
      ) {
        // don't wait
        magicLinkSend(tempEmail);
        emailInput.current!.value = "";
        const queryStringParams = queryString.stringify(
          {
            e: tempEmail,
            referralUuid: referralUuid,
          },
          {
            skipNull: true,
            /**
             * We probably should encode them (make @ -> %40), but it's not necessary
             * I'm just unsure how the rest of the app will handle it
             */
            encode: false,
          }
        );
        navigate(`${site.web}/login?${queryStringParams}`);
        return;
      }
      setErrorMessage("Notice: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lg:mt-20">
      <div className="mt-6 sm:max-w-xl">
        <h1 className="text-2xl font-extrabold text-white tracking-tight sm:text-4xl">
          Create your Research Object
        </h1>
      </div>
      <form
        onSubmit={handleSubmit}
        className="mt-12 sm:max-w-lg sm:w-full sm:flex"
      >
        <div className="min-w-0 flex-1">
          <label htmlFor="hero-email" className="sr-only">
            Email address
          </label>
          {errorMessage && (errorMessage as string).length ? (
            <span className="absolute text-white font-bold tracking-widest bg-blue-900 -mt-9 p-2 ml-1 opacity-80 py-1">
              {errorMessage}
            </span>
          ) : null}
          <input
            id="hero-email"
            type="email"
            ref={emailInput}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const val = e.currentTarget.value;
            //   setTimeout(() => setEmail(val));
              console.log("change");
            }}
            onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
            //   e.currentTarget.value = email;
              console.log("blur");
            }}
            minLength={4}
            tabIndex={0}
            autoFocus={window.innerWidth <= 600 ? false : true}
            required
            className="block w-full border border-gray-300 rounded-md px-5 py-3 text-base text-gray-900 placeholder-gray-500 shadow-sm focus:border-primary focus:ring-primary"
            placeholder="Enter your email"
            disabled={loading}
          />
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-3">
          {loading ? (
            <div className="flex justify-center items-center h-full w-full whitespace-nowrap animate-pulse text-center rounded-md border border-transparent py-3 bg-teal-700 hover:text-gray-700 text-base font-medium text-black shadow focus:outline-none  focus:ring-offset-2 sm:px-10">
              Get started
            </div>
          ) : (
            <button
              type="submit"
              className="block w-full rounded-md border border-transparent px-5 py-3 bg-tint-primary hover:bg-tint-primary-dark text-base font-medium text-black shadow focus:outline-none  focus:ring-offset-2 sm:px-10"
            >
              Get started
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default FormLandingPage;
