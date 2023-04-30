import { ExternalLinkComponent } from "@desci-labs/desci-models";
import { IconViewLink } from "@icons";
import * as React from "react";

interface Props {
  component: ExternalLinkComponent;
}
const ExternalLinkViewer = ({ component }: Props) => {
  return (
    <div className="w-screen h-screen text-white text-center justify-center items-center flex">
      <div
        onClick={() => {
          window.open(component.payload.url, "_blank");
        }}
        className="-mt-48 rounded-md bg-neutrals-gray-1 w-96 mx-auto text-sm flex flex-col items-center gap-8 p-8 hover:bg-neutrals-gray-2 cursor-pointer group"
      >
        <h1>External Link</h1>
        <div className="bg-black p-4 rounded-md shadow-inner w-64 break-all block font-mono text-[10px]">
          {component.payload.url}
        </div>
        <button className="flex gap-1">
          Visit URL <IconViewLink />
        </button>
      </div>
    </div>
  );
};

export default ExternalLinkViewer;
