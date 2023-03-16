import type { FunctionComponent } from "react";
import cx from "classnames";

const IconSubTextHeader = ({
  headerText,
  subText,
  Icon,
  withCircleBorder,
}: {
  headerText: string;
  subText?: string;
  Icon?: FunctionComponent;
  withCircleBorder: boolean;
}) => (
  <div className="flex flex-row items-center">
    {Icon ? (
      <div
        className={cx(
          " mr-[13px]  border-tint-primary flex justify-center items-center",
          { "rounded-full border-[1.5px]  p-[8px]": withCircleBorder }
        )}
      >
        <div
          className={cx({
            "w-6 h-6": withCircleBorder,
            "w-12 h-12": !withCircleBorder,
          })}
        >
          <Icon />
        </div>
      </div>
    ) : null}
    <div className="flex flex-col">
      <h1 className="text-[20px] font-semibold text-white">{headerText}</h1>
      {subText ? (
        <p className="text-neutrals-gray-5 text-[12px] w-96">{subText}</p>
      ) : null}
    </div>
  </div>
);

export default IconSubTextHeader;
