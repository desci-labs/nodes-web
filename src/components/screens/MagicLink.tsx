import React, { useState } from "react";
import queryString from "query-string";
import { useEffectOnce } from "react-use";
import { useLocation, useNavigate } from "react-router-dom";

import { magicLinkRedeem, patchAcceptFriendReferral } from "@api/index";
import { app, site, web } from "@src/constants/routes";
import { api } from "@src/state/api";
import { tags } from "@src/state/api/tags";
import { useSetter } from "@src/store/accessors";
import { setCheckingCode } from "@src/state/preferences/preferencesSlice";

const MagicLink = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [, setMagicLinkExpired] = useState(false);
  const { search } = useLocation();
  const values = queryString.parse(search);
  const navigate = useNavigate();
  const [, setMounted] = useState(false);
  const dispatch = useSetter();

  useEffectOnce(() => {
    setMounted(true);
    if (values.c as string) {
      handleSubmit();
    }
    return () => {};
  });

  const handleSubmit = async () => {
    let codeEl = document.getElementById("code") as HTMLInputElement;
    let code = codeEl.value;
    const referralUuid = queryString.parse(search).referralUuid as string;

    try {
      setLoading(true);
      dispatch(setCheckingCode(true));
      setErrorMessage("");
      codeEl.value = "";

      const email = values.e as string;

      const data = await magicLinkRedeem(
        email,
        code && code.length ? code : (values.c as string)
      );

      if (!data.user.token) {
        throw Error("Login failed");
      }

      localStorage.setItem("auth", data.user.token);

      dispatch(api.util.invalidateTags([{ type: tags.user }]));

      if (referralUuid) {
        /**
         * TODO: We likely want to show a success or something similar
         * Can be future feature
         * Along with some sort of retry logic incase it failed
         */
        await patchAcceptFriendReferral(referralUuid);
      }

      setTimeout(() => {
        dispatch(setCheckingCode(false));
        setLoading(false);
        navigate(`${site.app}${app.nodes}/start`);
      }, 500);
    } catch (err) {
      let resp = (err as any).response;
      let errorMessage = resp.data.error;
      if (errorMessage === "Not found") {
        setMagicLinkExpired(true);
        errorMessage = "Magic link expired";
        navigate(`${site.web}${web.magicExpired}`);
      }
      setErrorMessage("Notice: " + errorMessage);
      dispatch(setCheckingCode(false));
      setLoading(false);
    } finally {
    }
  };

  const MagicLinkSent = ({ loading }: any) => {
    return (
      <div className="lg:mt-20">
        <div className="mt-6 sm:max-w-xl">
          <h1 className="text-2xl font-extrabold text-white tracking-tight sm:text-4xl">
            Check Email
          </h1>
        </div>

        <div className="min-w-0 flex-1">
          <span className="text-tint-primary ml-1">
            We sent you a{" "}
            <b>
              <i>magic link</i>
            </b>{" "}
            to login and continue.
          </span>
        </div>

        <div>
          <form
            onSubmit={async (e) => {
              e.preventDefault();

              handleSubmit();
            }}
            className="mt-12 sm:max-w-lg sm:w-full sm:flex"
          >
            <div className="min-w-0 flex-0">
              <label htmlFor="hero-email" className="sr-only">
                Security Token
              </label>
              {errorMessage && (errorMessage as string).length ? (
                <span className="absolute text-white font-bold tracking-widest bg-blue-900 -mt-9 p-2 ml-1 opacity-80 py-1">
                  {errorMessage}
                </span>
              ) : null}
              {loading ? (
                <div className="w-[200px] bg-white rounded-md animate-pulse h-[50px] mt-[1px] border-2 border-white"></div>
              ) : (
                <input
                  id="code"
                  type="text"
                  minLength={6}
                  maxLength={6}
                  tabIndex={0}
                  autoFocus
                  required
                  className="block w-[200px]  mt-[1px] border border-gray-300 rounded-md px-5 py-3 text-base text-gray-900 placeholder-gray-500 shadow-sm focus:border-tint-primary focus:ring-tint-primary"
                  placeholder="Enter code"
                />
              )}
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-3">
              {loading ? (
                <div className="block w-full rounded-md border border-transparent px-5 py-3 bg-tint-primary hover:text-gray-700 text-base font-medium text-black shadow focus:outline-none  focus:ring-offset-2 sm:px-10">
                  Checking...
                </div>
              ) : (
                <button
                  type="submit"
                  className="block w-full rounded-md border border-transparent px-5 py-3 bg-tint-primary hover:text-gray-700 text-base font-medium text-black shadow focus:outline-none  focus:ring-offset-2 sm:px-10"
                >
                  Continue
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    );
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return React.useMemo(() => <MagicLinkSent loading={loading} />, [loading]);
};

export default MagicLink;
