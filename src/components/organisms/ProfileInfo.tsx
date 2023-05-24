import { IconAuthor } from "@icons";
import IconSubTextHeader from "@components/molecules/IconSubTextHeader";
import DigitalSignature from "@components/molecules/DigitalSignature";
import DividerSimple from "@components/atoms/DividerSimple";
import UserProfileForm from "@components/organisms/UserProfileForm";
import { memo, useEffect } from "react";
import { api } from "@src/state/api";
import { tags } from "@src/state/api/tags";
import { useSetter } from "@src/store/accessors";
import PrimaryAffiliation, { AffiliationForm } from "@src/components/molecules/PrimaryAffiliation";
// import {
//   LS_VSCODE_ENABLED,
//   useManuscriptController,
// } from "./ManuscriptReader/ManuscriptController";
// import classNames from "classnames";

function ProfileInfo(props: {
  inModal?: boolean;
  isSubmitting?: boolean;
  isSubmitSuccessful?: boolean;
}) {
  const dispatch = useSetter();

  useEffect(() => {
    dispatch(api.util.invalidateTags([{ type: tags.user }]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={`sm:grow ${
        !props.inModal ? "mt-10 pb-10" : ""
      } w-[500px] max-w-[500px]`}
    >
      <div className="flex flex-col gap-8">
        <IconSubTextHeader
          headerText={"Profile Information"}
          subText={"Tell us a little more about you"}
          Icon={() => <IconAuthor fill="white" width="100%" height="100%" />}
          withCircleBorder={true}
        />

        <UserProfileForm viewOnly={!props.inModal} />
        <DividerSimple />
        {!props.inModal ? (
          <>
            <DividerSimple />
            <div className="flex flex-col gap-8">
              <div>
                <IconSubTextHeader
                  headerText="Primary Affiliation"
                  subText="Add your primary academic affiliation."
                  withCircleBorder={true}
                />
              </div>
              <PrimaryAffiliation />
            </div>

            <DividerSimple />

            <div className="flex flex-col gap-8">
              <div>
                <IconSubTextHeader
                  headerText={"Digital Signature"}
                  subText={
                    "Link a digital signature to your account to sign transactions, documents, and receive digital attestations."
                  }
                  withCircleBorder={true}
                />
                <p className="text-neutrals-gray-5 text-[12px] break-normal mt-1 w-96">
                  By connecting your digital signature you agree to the DeSci
                  Labs{" "}
                  <a
                    href="/terms"
                    className="text-tint-primary hover:text-tint-primary-hover"
                    target="_blank"
                    rel="noreferrer noopener"
                    onClick={(e: any) => window.open(e.target.href)}
                  >
                    Terms of Service
                  </a>
                </p>
              </div>
              <DigitalSignature />
            </div>
          </>
        ) : (
          <div>
            <AffiliationForm />
          </div>
        )}

        {/* {process.env.REACT_APP_ENABLE_ORCID ? (
          <>
            <DividerSimple />
            <div className="flex flex-col gap-8">
              <div>
                <IconSubTextHeader
                  withCircleBorder={false}
                  headerText={"External Accounts"}
                />
                <p className="mt-1 text-neutrals-gray-5 text-[12px] w-96">
                  ORCID is a researcher identity disembiguation service used by
                  10 million researchers worldwide.{" "}
                  <a
                    href="https://info.orcid.org/what-is-orcid/"
                    className="text-tint-primary hover:text-tint-primary-hover"
                    target="_blank"
                    rel="noreferrer noopener"
                    onClick={(e: any) => window.open(e.target.href)}
                  >
                    Learn more.
                  </a>
                </p>
              </div>
              <OrcidButton
                callback={async () => {
                  dispatch(api.util.invalidateTags([{ type: tags.user }]));
                  console.log("[ProfileInfo]::Refresh User data");
                }}
              />
            </div>
          </>
        ) : null} */}
      </div>
    </div>
  );
}

export default memo(ProfileInfo);
