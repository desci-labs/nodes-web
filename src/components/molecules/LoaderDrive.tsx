import SpacerHorizontal from "../atoms/SpacerHorizontal";
import { DriveObject } from "../organisms/Drive";
import StatusInfo from "../organisms/Drive/StatusInfo";

const LoaderDrive = () => {
  return (
    <div className="w-full h-full flex flex-col px-[80px] justify-start text-white bg-neutrals-black pb-20 !pb-[300px] top-[95px] relative">
      <div className="">
        <h1 className="text-[28px] leading-[42px] font-bold text-white">
          {/* Node Drive */}&nbsp;
        </h1>
      </div>
      <div className="mt-[24px]">
        <SpacerHorizontal />
      </div>

      <div className="animate-pulse pt-[100px]">
        <div className="bg-neutrals-gray-1 h-full w-full rounded-xl outline-none">
          <ul
            id="HeaderRow"
            className="bg-black rounded-t-xl h-[56px] grid list-none font-bold text-sm text-white content-center justify-items-center gap-10 px-5 border-b border-[#555659] items-center"
            style={{
              gridTemplateColumns:
                "2fr repeat(4, minmax(auto, 1fr)) minmax(125px, auto) repeat(2, 40px)",
            }}
          >
            <li></li>
          </ul>
          <StatusInfo />
          <div className="mt-8"></div>
          {[1, 2, 3].map((i) => {
            return (
              <div
                className={`h-9 w-full bg-neutrals-gray-1 ${
                  i == 3 ? "rounded-b-xl" : ""
                }`}
              ></div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LoaderDrive;
