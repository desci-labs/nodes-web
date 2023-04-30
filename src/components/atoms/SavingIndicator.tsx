import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";

const SavingIndicator = () => {
  const { showSavingIndicator } = useManuscriptController([
    "showSavingIndicator",
  ]);
  return showSavingIndicator ? (
    <div className="fixed animate-[pulse_0.4s_ease-in-out_infinite] inter bottom-4 right-4 flex text-xs bg-tint-primary text-white z-50 py-2 px-3 rounded-md gap-2">
      saving
    </div>
  ) : null;
};
export default SavingIndicator;
