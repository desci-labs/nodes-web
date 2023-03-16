import { DriveObject, FileDir } from "@components/organisms/Drive";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/solid";
import React from "react";

export interface BreadCrumb {
  name: string;
  drive: DriveObject;
}

interface BreadCrumbsProps {
  crumbs: BreadCrumb[];
  eatBreadCrumb: (index: number) => void;
}

const DriveBreadCrumbs = ({ crumbs, eatBreadCrumb }: BreadCrumbsProps) => {
  return (
    <div className="flex items-center my-3 h-[28px]">
      {crumbs.map((c, i) => {
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
