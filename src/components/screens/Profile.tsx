import PrimaryButton from "@src/components/atoms/PrimaryButton";
import { IconX } from "@src/icons";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import PerfectScrollbar from "react-perfect-scrollbar";
import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import ProfileInfo from "@src/components/organisms/ProfileInfo";
import Profiler, {
  ProfileValues,
} from "@src/components/organisms/WrapperProfileModal";
import Modal from "@src/components/molecules/Modal/Modal";

export interface ProfilePopOverProps {
  onClose: () => void;
}

export function ProfileInfoWrapper(props: ProfilePopOverProps) {
  const { showProfileUpdater, setShowProfileUpdater } = useManuscriptController(
    ["showProfileUpdater"]
  );
  const {
    formState: { isSubmitting, isSubmitSuccessful },
  } = useFormContext<ProfileValues>();

  const [, setCanSubmitAgain] = useState(true);
  // reset 'successful' state to allow user to edit again
  useEffect(() => {
    if (isSubmitSuccessful) {
      setTimeout(() => {
        setCanSubmitAgain(true);
      }, 2000);
    } else {
      setCanSubmitAgain(false);
    }
  }, [isSubmitSuccessful]);

  if (!showProfileUpdater) return null;

  return (
    <Modal
      onDismiss={() => {
        setShowProfileUpdater(false);
      }}
      isOpen={showProfileUpdater}
      $maxWidth={700}
    >
      <div className="py-4 px-6 text-neutrals-gray-5 lg:w-[700px]">
        <div className="flex flex-row justify-between items-center">
          <div className="text-lg font-bold text-white">
            Complete my profile
          </div>
          <IconX
            fill="white"
            width={20}
            height={20}
            className="cursor-pointer"
            onClick={() => {
              console.log("CLOSE", props.onClose);
              setShowProfileUpdater(false);
              props.onClose();
            }}
          />
        </div>
        <div className="py-1 text-xs">
          Enter a PDF link associated with your research manuscript to start
          creating your research node
        </div>
        <PerfectScrollbar className="overflow-auto">
          <div className="py-5 flex justify-center items-center my-[30px] max-h-[650px]">
            <ProfileInfo inModal />
          </div>
        </PerfectScrollbar>
      </div>
      <Modal.Footer>
        <PrimaryButton
          disabled={isSubmitting}
          form="userProfileForm"
          className="flex gap-2"
        >
          Save changes
        </PrimaryButton>
      </Modal.Footer>
    </Modal>
  );
}

export default function ProfilePopOver(props: ProfilePopOverProps) {
  return (
    <Profiler>
      <ProfileInfoWrapper {...props} />
    </Profiler>
  );
}
