import { useResponsive } from "@src/hooks";
import { isTablet } from "@src/constants/web";
import PanelButton from "./PanelButton";
// import { useManuscriptController } from "../organisms/ManuscriptReader/ManuscriptController";
import { IconDesciNodes } from "@src/icons";
import { useSetter } from "@src/store/accessors";
import { toggleResearchPanel } from "@src/state/nodes/nodeReader";

const ButtonMysterious = () => {
  const { isPortrait } = useResponsive();
  const dispatch = useSetter();

  return (
    <PanelButton
      orientation="right"
      onClick={() => {
        dispatch(toggleResearchPanel(true));
      }}
      id="fab-node"
      style={isPortrait && isTablet ? { top: "unset", bottom: 8 } : {}}
    >
      <div className="m-8 mr-[18px] flex justify-center items-center w-14 h-14 rounded-2xl bg-black group-hover:bg-zinc-900 transition-all ease duration-300">
        <IconDesciNodes width={32} height={27} />
      </div>
    </PanelButton>
  );
};

export default ButtonMysterious;
