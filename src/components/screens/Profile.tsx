import PrimaryButton from "@src/components/atoms/PrimaryButton";
import PopoverFooter from "@src/components/molecules/Footer";
import { IconX } from "@src/icons";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import PerfectScrollbar from "react-perfect-scrollbar";
import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import PopOver from "@src/components/organisms/PopOver";
import ProfileInfo from "@src/components/organisms/ProfileInfo";
import Profiler, { ProfileValues } from "@src/components/organisms/WrapperProfileModal";

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
    <PopOver
      {...props}
      zIndex={121}
      style={{
        width: 700,
        marginLeft: 0,
        marginRight: 0,
      }}
      footer={() => (
        <PopoverFooter>
          <PrimaryButton
            disabled={isSubmitting}
            form="userProfileForm"
            className="flex gap-2"
          >
            Save changes
          </PrimaryButton>
        </PopoverFooter>
      )}
      containerStyle={{
        backgroundColor: "#3A3A3ABF",
      }}
      onClose={() => {
        setShowProfileUpdater(false);
        // props.onClose();
      }}
      isVisible={showProfileUpdater}
      className="rounded-lg bg-zinc-100 dark:bg-zinc-900 animate-slideFromBottom"
    >
      <div className="py-4 px-6 text-neutrals-gray-5">
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
    </PopOver>
  );
}

export default function ProfilePopOver(props: ProfilePopOverProps) {
  return (
    <Profiler>
      <ProfileInfoWrapper {...props} />
    </Profiler>
  );
}
