import useDataUsage from "@hooks/useDataUsage";
import ProgressBar from "./ProgressBar";
import React from "react";

const DataUsage = () => {
  const { formattedLimit, formattedSpaceUsed, percent, loading } =
    useDataUsage();

  return (
    <PanelSection className={`flex flex-col gap-2 ${loading ? 'animate-pulse' : ''}`}>
      <div className="flex flex-col justify-between items-start gap-1">
        <h1 className="font-bold">Private Drive</h1>
        <ProgressBar value={percent} />
        <div className="flex items-center justify-between w-full text-xs text-white font-normal">
          {loading ? <div className="h-4 w-full bg-neutrals-gray-3 opacity-50" /> : (
            <>
              <span>{`${formattedSpaceUsed} of ${formattedLimit} Used`}</span>
              <span>{Number(Math.max(percent, 0)).toFixed(0)}% full</span>
            </>
          )}
        </div>
      </div>
    </PanelSection>
  );
};

export default DataUsage;

const PanelSection = ({ children, className }: any) => {
  return <div className={`${className}`}>{children}</div>;
};
