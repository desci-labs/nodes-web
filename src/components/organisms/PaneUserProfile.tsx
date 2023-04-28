import { memo } from "react";
import UserAttestations from "@components/organisms/UserAttestations";
import ProfileInfo from "./ProfileInfo";
import Profiler from "./WrapperProfileModal";

export const PaneUserProfile = memo(() => {
  return (
    <div
      className={`h-screen w-screen fixed left-0 pl-16 pt-14 top-0 z-[102] will-change-transform transition-opacity duration-150 bg-neutrals-black opacity-100`}
    >
      <div className="bg-neutrals-black flex flex-col md:flex-row h-full overflow-y-scroll w-full text-white overflow-x-hidden">
        <div className="hidden sm:flex sm:mr-auto" />
        <div className="py-5 px-7 md:px-0">
          <ProfileInfo />
        </div>
        <div className="sm:ml-auto">
          <UserAttestations />
        </div>
      </div>
    </div>
  );
});

export default function Profile() {
  return (
    <Profiler>
      <PaneUserProfile />
    </Profiler>
  );
}
