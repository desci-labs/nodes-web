import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";

import {
  FriendReferral,
  getFriendReferrals,
  postSendFriendReferrals,
} from "@src/api";

import CreateableSelect from "@components/molecules/FormInputs/CreateableSelect";
import PrimaryButton from "@components/atoms/PrimaryButton";
import { ReferralItem } from "@components/molecules/ReferAFriend/ReferralItem";
import { ReferralSuccess } from "@components/molecules/ReferAFriend/ReferralSuccess";
import { isMaybeValidEmail } from "@src/lib/validation";
import Modal from "@src/components/molecules/Modal/Modal";
import { IconX } from "@src/icons";
import { useAppPreferences } from "@src/state/preferences/hooks";

export const ReferAFriendModal = ({
  isVisible,
  onClose,
}: {
  isVisible?: boolean;
  onClose?: () => void;
}) => {
  const [isSendInProgress, setIsSendInProgress] = useState(false);
  const [isSendComplete, setIsSendComplete] = useState(false);
  const [isSendError, setIsSendError] = useState(false);
  const [existingReferrals, setExistingReferrals] = useState<FriendReferral[]>(
    []
  );
  const { showReferralModal } = useAppPreferences();

  useEffect(() => {
    setIsSendComplete(false);
  }, [onClose]);

  useEffect(() => {
    if (isSendError) {
      toast.error(
        "There was an error sending your invites. Please try again.",
        { duration: 5000 }
      );
    }
  }, [isSendError]);

  useEffect(() => {
    const getReferrals = async () => {
      const friendReferrals = await getFriendReferrals();
      setExistingReferrals(friendReferrals);
    };

    getReferrals();
  }, [isVisible, isSendComplete]);

  const { control, reset, handleSubmit, watch, register, formState } = useForm({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      emails: [] as string[],
    },
  });

  useEffect(() => {
    register("emails", {
      validate: (value) => {
        if (!value) {
          return undefined;
        }

        const invalidEmails = value.filter(
          (email) => !isMaybeValidEmail(email)
        );

        if (invalidEmails.length) {
          /**
           * TODO: Get proper error message from design
           */
          return `Contains atleast 1 invalid email address: ${invalidEmails}`;
        } else {
          return undefined;
        }
      },
    });
  }, [register, formState]);

  const onSubmitHandler = handleSubmit(async (data: any) => {
    setIsSendInProgress(true);
    try {
      await postSendFriendReferrals(data.emails);
      setIsSendComplete(true);
      setIsSendError(false);
      reset();
    } catch (error) {
      setIsSendError(true);
    }

    setIsSendInProgress(false);
  });

  const hasEmailsInputted = Boolean(watch("emails").length);

  return (
    <>
      <Modal
        $maxWidth={isSendComplete ? 400 : 600}
        isOpen={showReferralModal}
        onDismiss={() => {
          onClose?.();
        }}
      >
        <div className="px-6 py-5 text-white">
          <div className="flex flex-row justify-between items-center">
            <h1 className="text-lg font-bold text-white">
              {isSendComplete ? "Invites Sent" : "Refer a Friend"}
            </h1>
            <div
              className="cursor-pointer p-5 -m-5 absolute right-5 top-5 stroke-black dark:stroke-white hover:stroke-muted-300 hover:dark:stroke-muted-300"
              onClick={onClose}
            >
              <IconX />
            </div>
          </div>
          <div className="flex flex-col">
            {isSendComplete ? (
              <ReferralSuccess />
            ) : (
              <>
                <p className="text-neutrals-gray-5 text-xs -mt-[3px] w-full">
                  Earn 5GB for free per friend that joins Desci Nodes. Up to a
                  maximum of 250GB. Invites you’ve sent for your current nodes
                  will also be included in the referral program.
                </p>

                <div className="py-3 my-3 flex flex-col">
                  {/**
                   * NOTE: This should really be in it's own component
                   * But the way the modal is written with the header and footer
                   * I'd have to pull that out to it's own component as well
                   * Juice likely isn't worth the squeeze.
                   */}
                  <form className="h-fit">
                    <div className="mb-8">
                      <Controller
                        name="emails"
                        control={control}
                        render={({ field }: any) => (
                          <CreateableSelect
                            label="Enter emails"
                            field={field}
                            useSpaceAsSeparator
                          />
                        )}
                      />
                      <p className="text-red-400 text-xs">
                        {/* @ts-ignore */}
                        {formState.errors.emails?.message}
                      </p>
                      <span className="text-xs mt-1 text-neutrals-gray-5">
                        Separate emails with a space to add multiple.
                      </span>
                    </div>
                  </form>
                  <hr className="border-neutrals-gray-3" />
                </div>

                <div>
                  <h2 className="text-sm mb-4 font-semibold">Invites Sent</h2>
                  <ul className="list-none">
                    {existingReferrals.map((referral) => {
                      return (
                        <li key={referral.id} className="my-4">
                          <ReferralItem referral={referral} />
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
        <ModalFooter
          isSendComplete={isSendComplete}
          isSendDisabled={
            isSendInProgress ||
            !hasEmailsInputted ||
            Boolean(formState.errors.emails)
          }
          onSubmit={onSubmitHandler}
          onClose={() => onClose?.()}
        />
      </Modal>
    </>
  );
};

const ModalFooter = ({
  isSendComplete,
  isSendDisabled,
  onSubmit,
  onClose,
}: {
  isSendComplete: boolean;
  isSendDisabled: boolean;
  onSubmit: () => void;
  onClose: () => void;
}) => {
  return (
    <div className="bg-neutrals-gray-1 flex flex-col place-items-end py-4 px-8 shadow-upperTealShadow">
      {isSendComplete ? (
        <PrimaryButton
          onClick={(e) => {
            e.preventDefault();
            onClose();
          }}
        >
          Done
        </PrimaryButton>
      ) : (
        <PrimaryButton
          type="submit"
          disabled={isSendDisabled}
          onClick={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          Send Invites
        </PrimaryButton>
      )}
    </div>
  );
};
