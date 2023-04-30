import ComponentLibrary from "@components/organisms/ComponentLibrary";
import { restoreScroll } from "@components/utils";
import { IconRemove } from "@icons";
import { useNodeReader } from "@src/state/nodes/hooks";
import * as React from "react";
import { useManuscriptController } from "@components/organisms/ManuscriptReader/ManuscriptController";

const ComponentAdd = () => {
  const { setIsAddingComponent } = useManuscriptController([]);
  const { currentObjectId } = useNodeReader();

  /**
   * Allow user to hit escape to get out of the Add Component screen
   */
  React.useEffect(() => {
    window.onkeydown = (e) => {
      if (e.key === "Escape") {
        setIsAddingComponent(false);
        restoreScroll();
      }
    };
    return () => {
      window.onkeydown = null;
    };
  });

  return (
    <>
      {/** We use z-105 to place above My Collection + PopOverNewNode */}
      <div
        className={`fixed z-[101] select-none font-inter top-[55px] left-0 h-[calc(100vh-55px)] w-screen bg-neutrals-black text-white will-change-transform p-8 animate-scaleIn`}
      >
        <div className="w-[calc(100%-320px)]">
          <div
            className={`absolute left-6 rounded-full hover:bg-primary p-3.5 cursor-pointer z-10 bg-tint-primary ${
              currentObjectId ? "" : "hidden"
            }`}
            onClick={() => {
              setIsAddingComponent(false);
              restoreScroll();
            }}
          >
            <span className="stroke-[#212121] dark:stroke-white">
              <IconRemove
                strokeWidth={2}
                strokeLinecap="square"
                className="w-[17px] h-[17px] stroke-neutrals-black"
              />
            </span>
          </div>
          <div className="overflow-auto h-[calc(100vh-55px)] absolute top-0 pt-8 w-[calc(100%)] pr-8">
            <ComponentLibrary />
          </div>
        </div>
        {/* <SidePanelStorage /> */}
      </div>
    </>
  );
};

export default ComponentAdd;
