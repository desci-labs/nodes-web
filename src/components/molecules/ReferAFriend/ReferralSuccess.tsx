import { IconCircleCheck } from "@src/icons";

export const ReferralSuccess = () => {
  return (
    <div className="items-center">
      <p className="text-neutrals-gray-5 text-sm text-left -mt-[3px] w-full">
        We will let you know when your friend accepts their invite and when your
        free storage is applied.
      </p>

      <div className="flex flex-col items-center my-8">
        <IconCircleCheck className="w-16 h-16" fill="#00A180" />
      </div>

      <div className="text-center mt-8">
        <span className="text-sm text-white text-center">
          The invites have been sent successfully.
        </span>
      </div>
    </div>
  );
};
