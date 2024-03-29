import { DriveObject, FileDir } from "@components/organisms/Drive";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/solid";
import { AvailableUserActionLogTypes, postUserAction } from "@src/api";
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
                width={20}
                height={20}
                // className="fill-neutrals-gray-7"
              />
            )}
            <span
              className={`font-medium text-sm text-white hover:text-tint-primary-hover cursor-pointer  ${
                i == 0 ? "text-tint-primary" : "text-white"
              }`}
              onClick={() => {
                eatBreadCrumb(i);
                postUserAction(
                  AvailableUserActionLogTypes.driveNavigateBreadcrumb
                );
              }}
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
