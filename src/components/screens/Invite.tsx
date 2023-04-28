/* This example requires Tailwind CSS v2.0+ */
import OrcidButton from "@src/components/molecules/OrcIdAuthButton";
import { useNavigate } from "react-router-dom";
import { useOrcidData } from "@src/state/preferences/hooks";

export default function Invite() {
  const { orcidData } = useOrcidData();
  const navigate = useNavigate();

  if (orcidData && orcidData.person) {
    navigate("/wallet");
    return <></>;
  }

  return (
    <div className="cursor-pointer col-span-1 flex flex-col text-center bg-white shadow divide-y divide-gray-200">
      <div className="flex-1 flex flex-col p-8">
        <h3 className="mt-6 text-gray-900 text-2xl font-bold">
          ArcSci Sign Up
        </h3>
        <p className="mt-6 text-gray-900 text-lg font-normal">
          Dr. Philipp Koellinger is requesting your participation in ArcSci.
          <br />
          Help us craft the future of science.
        </p>

        <div className="w-59 text-center m-auto mt-10 mb-10">
          <OrcidButton
            active={false}
            text={
              orcidData && orcidData.person
                ? `Continue with ${orcidData.person.name["given-names"].value}`
                : "Sign in with Orcid"
            }
            onClick={() => {
              if (orcidData && orcidData.person) {
                navigate("/wallet");
                return true;
              } else {
                // alert("sign in")
                return false;
              }
            }}
            callback={(ev: any) => {
              console.log("handle orcid", orcidData, ev);
            }}
          />
        </div>
      </div>
    </div>
  );
}
