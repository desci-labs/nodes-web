import { DriveObject, FileDir } from "@components/organisms/Drive";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/solid";
import { useDrive } from "@src/state/drive/hooks";
import React from "react";

interface BreadCrumbsProps {
  eatBreadCrumb: (index: number) => void;
}

const DriveBreadCrumbs = ({ eatBreadCrumb }: BreadCrumbsProps) => {
  const { breadCrumbs } = useDrive();
  return (
    <div className="flex items-center my-3 h-[28px]">
      {breadCrumbs.map((c, i) => {
        return (
          <div
            key={`breadcrumb_${c.name}+${i}`}
            className="flex flex-row items-center"
          >
            {i !== 0 && (
              <ChevronRightIcon
                width={28}
                height={28}
                // className="fill-neutrals-gray-7"
              />
            )}
            <span
              className={`font-medium text-white hover:text-tint-primary-hover cursor-pointer  ${
                i == 0 ? "text-tint-primary" : "text-white"
              }`}
              onClick={() => eatBreadCrumb(i)}
            >
              {c.name}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default DriveBreadCrumbs;
