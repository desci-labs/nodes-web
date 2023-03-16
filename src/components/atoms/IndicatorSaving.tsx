import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import { __log } from "@components/utils";
import { useEffect } from "react";

const IndicatorSaving = () => {
  const { showSavingIndicator } = useManuscriptController([
    "showSavingIndicator",
  ]);
  useEffect(() => {
    if (showSavingIndicator) {
      __log("SET", showSavingIndicator);
      window.onbeforeunload = () => {
        return (window as any).confirm("Changes you made may not be saved.");
      };
    }
    return () => {
      window.onbeforeunload = null;
    };
  }, [showSavingIndicator]);
  return <></>;
};

export default IndicatorSaving;
