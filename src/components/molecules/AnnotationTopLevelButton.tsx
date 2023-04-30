import AnnotationButton from "@components/atoms/AnnotationButton";
import AnnotationButtonClose from "@components/atoms/AnnotationButtonClose";
import PanelButton from "@components/atoms/PanelButton";
import TooltipIcon from "@components/atoms/TooltipIcon";
import { ResearchObjectComponentType } from "@desci-labs/desci-models";
import { useNodeReader, usePdfReader } from "@src/state/nodes/hooks";
import { useSetter } from "@src/store/accessors";
import { setAnnotatingViaButton, setIsAnnotating } from "@src/state/nodes/pdf";

const AnnotationTopLevelButton = () => {
  const dispatch = useSetter();
  const { mode, componentStack } = useNodeReader();
  const { isEditingAnnotation, isAnnotating } = usePdfReader();

  const isCode =
    componentStack &&
    componentStack[componentStack.length - 1]?.type ===
      ResearchObjectComponentType.CODE;

  if (mode === "editor" && !isEditingAnnotation && !isCode) {
    return (
      <PanelButton
        orientation="left"
        key="annotation-panel-button"
        onClick={() => {
          dispatch(setIsAnnotating(!isAnnotating));
          dispatch(setAnnotatingViaButton(true));
        }}
        className={`transition-transform duration-750`}
      >
        <div className="m-8 mr-[18px]">
          {isAnnotating ? (
            <>
              <div
                className="animate-ping absolute z-[-1]"
                style={{ animationIterationCount: 1 }}
              >
                <AnnotationButton />
              </div>
              <TooltipIcon
                id="annotation-button"
                key={"tooltip-annotation-click"}
                placement={"bottom"}
                tooltip="Click or drag on the PDF. Click this X to stop annotating"
                icon={<AnnotationButtonClose />}
              />
            </>
          ) : (
            <>
              <TooltipIcon
                id="annotation-button"
                placement="bottom"
                tooltip="Add annotation"
                key={"tooltip-annotation-add"}
                icon={<AnnotationButton />}
              />
            </>
          )}
        </div>
      </PanelButton>
    );
  }
  return null;
};
export default AnnotationTopLevelButton;
