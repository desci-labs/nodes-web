import { setShowReferralModal } from "@src/state/preferences/preferencesSlice";
import { useSetter } from "@src/store/accessors";

const FriendReferralButton = () => {
  const dispatch = useSetter();

  return (
    <div className="hover:bg-[#222429] cursor-pointer w-full py-2">
      <button
        className="text-left text-xs"
        onClick={() => dispatch(setShowReferralModal(true))}
      >
        <p className="px-4 text-white">Refer a Friend</p>
        <div className={"block px-4 text-xs mt-1"}>
          <p className="font-medium text-gray-900 truncate justify-start flex w-48">
            <span className="text-gray-500 w-32 justify-start flex items-start">
              Get 5GB for Free
            </span>
            <span className="text-tint-primary group-hover:text-tint-primary-hover w-20 text-right justify-end text-xs pt-0.5">
              Send Invite
            </span>
          </p>
        </div>
      </button>
    </div>
  );
};

export default FriendReferralButton;
