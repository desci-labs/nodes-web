import type { Web3ReactHooks } from "@web3-react/core";
import { SpinnerCircular } from "spinners-react";

export function Status({
  isActivating,
  isActive,
  error,
}: {
  isActivating: ReturnType<Web3ReactHooks["useIsActivating"]>;
  isActive: ReturnType<Web3ReactHooks["useIsActive"]>;
  error?: Error;
}) {
  return (
    <div className="text-[9px] flex items-center justify-center align-middle leading-3 font-normal text-gray-300">
      {error ? (
        <>
          <span className="leading-3 w-28">
            {error.name ?? "Error"}
            {error.message ? `: ${error.message}` : null} &nbsp;
          </span>
          <span style={{ filter: "hue-rotate(20deg) saturate(0.6)" }}>🔴</span>
        </>
      ) : isActivating ? (
        <>
          <SpinnerCircular
            size={15}
            color="gold"
            secondaryColor={"transparent"}
          />
        </>
      ) : isActive ? (
        <span className="bg-tint-primary w-3 h-3 mt-0 rounded-full"></span>
      ) : (
        <span className="opacity-30 group-hover:opacity-50">⚪️</span>
      )}
    </div>
  );
}
