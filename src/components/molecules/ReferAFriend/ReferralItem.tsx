import cx from "classnames";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  FriendReferral,
  FriendReferralStatus,
  postSendFriendReferrals,
} from "@src/api";
import ButtonSecondary from "@src/components/atoms/ButtonSecondary";

export const ReferralItem = ({ referral }: { referral: FriendReferral }) => {
  const [isResendInProgress, setIsResendInProgress] = useState(false);
  const [isResendSent, setIsResendSent] = useState(false);
  const [isSendError, setIsSendError] = useState(false);

  const resendInvite = async (email: string) => {
    setIsResendInProgress(true);
    try {
      await postSendFriendReferrals([email]);
      setIsResendSent(true);
      setIsSendError(false);
    } catch (error) {
      setIsSendError(true);
    }
    setIsResendInProgress(false);
  };

  useEffect(() => {
    if (isSendError) {
      toast.error(
        "There was an error sending your invites. Please try again.",
        { duration: 5000 }
      );
    }
  }, [isSendError]);

  return (
    <div className="flex flex-row justify-around items-center w-full">
      <div className="flex flex-col grow">
        <span className="text-sm">{referral.receiverEmail}</span>
        {referral.status === FriendReferralStatus.ACCEPTED ? (
          <span className="text-xs break-normal  text-neutrals-gray-5 ">
            {`Invite was accepted and ${referral.amountAwardedStorageGb}GB was added to your private storage.`}
          </span>
        ) : (
          <span className="text-sm text-neutrals-gray-5 ">Invite Sent</span>
        )}
      </div>

      {referral.status === FriendReferralStatus.ACCEPTED ? (
        <span className="text-sm text-white font-semibold bg-success px-4 py-2 rounded-lg">
          Accepted!
        </span>
      ) : (
        <ButtonSecondary
          className={cx({ "bg-success text-white": isResendSent })}
          onClick={() => {
            resendInvite(referral.receiverEmail);
          }}
          disabled={isResendInProgress || isResendSent}
        >
          {isResendSent ? "Sent!" : "Resend Invite"}
        </ButtonSecondary>
      )}
    </div>
  );
};
