import PrimaryButton from "@src/components/atoms/PrimaryButton";
import { site } from "@src/constants/routes";
import { useNavigate } from "react-router-dom";
import { SpinnerCircular } from "spinners-react";
import { ViewWrapper } from "./ComponentStackView";

export default function Placeholder(props: {
  isLoading: boolean;
  isError?: boolean;
  fullHeight?: boolean;
}) {
  const navigate = useNavigate();
  return (
    <ViewWrapper>
      <div
        className={`w-screen pt-10 bg-neutrals-black absolute left-0 flex flex-col gap-4 items-center justify-center ${
          props.fullHeight ? "h-screen" : " h-[calc(100vh-56px)]"
        }`}
      >
        {props.isLoading && (
          <>
            <SpinnerCircular size={50} color="#28AAC4" />
            <h1 className="text-xl font-bold text-white">Loading...</h1>
          </>
        )}
        {!props.isLoading && props.isError && (
          <div className="flex flex-col gap-8">
            {/* Placeholder avatar or image */}
            <h1 className="text-4xl font-semibold text-white">
              Research Node Not Found
            </h1>
            <PrimaryButton onClick={() => navigate(`${site.web}`)}>
              Go Home
            </PrimaryButton>
          </div>
        )}
      </div>
    </ViewWrapper>
  );
}
