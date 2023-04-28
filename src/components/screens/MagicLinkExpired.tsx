import { useState } from "react";
import queryString from "query-string";
import { useEffectOnce } from "react-use";
import { __log } from "@components/utils";
import { useLocation, useNavigate } from "react-router-dom";
import { site } from "@src/constants/routes";

const MagicLinkExpired = () => {
  const [loading] = useState(false);
  const navigate = useNavigate();
  const { search } = useLocation();
  const values = queryString.parse(search);

  useEffectOnce(() => {
    if (values.c as string) {
      __log("SUBMIT");
      handleSubmit();
    }
    return () => {};
  });

  const handleSubmit = async () => {
    navigate(site.web);
  };

  const MlExpired = () => {
    return (
      <div className="lg:mt-20">
        <div className="mt-6 sm:max-w-xl">
          <h1 className="text-2xl font-extrabold text-white tracking-tight sm:text-4xl">
            Magic link expired
          </h1>
        </div>

        <div className="min-w-0 flex-1">
          <span className="text-tint-primary ml-1 mt-2 block">
            Unfortunately this code is no longer valid, please try again.
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
            <div className="mt-4 sm:mt-0 sm:ml-3">
              {loading ? (
                <div className="block w-full rounded-md border border-transparent px-5 py-3 bg-tint-primary hover:text-gray-700 text-base font-medium text-black shadow focus:outline-none  focus:ring-offset-2 sm:px-10">
                  Back to home
                </div>
              ) : (
                <button
                  type="submit"
                  className="block w-full rounded-md border border-transparent px-5 py-3 bg-tint-primary hover:text-gray-700 text-base font-medium text-black shadow focus:outline-none  focus:ring-offset-2 sm:px-10"
                >
                  Back to home
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    );
  };

  return <MlExpired />;
};

export default MagicLinkExpired;
