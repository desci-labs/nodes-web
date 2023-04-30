import { AnnotationUpdateProps } from "../molecules/Annotation";
import PrimaryButton from "./PrimaryButton";
import ToggleSwitch from "./ToggleSwitch";

interface EditAnnotationFooterProps {
  keepAnnotating: boolean;
  setKeepAnnotating: (val: boolean) => void;
  handleCancel: () => void;
  handleSave: (obj: AnnotationUpdateProps) => void;
  annotationText: string;
}

const EditAnnotationFooter = ({
  annotationText,
  setKeepAnnotating,
  keepAnnotating,
  handleCancel,
  handleSave,
}: EditAnnotationFooterProps) => {
  return (
    <div className="flex gap-2">
      <div
        onClick={handleCancel}
        className="cursor-pointer rounded-md h-7 px-2 justify-center align-middle items-center flex font-bold text-gray-600 hover:text-gray-900 hover:font-bold"
        tabIndex={5}
      >
        Cancel
      </div>
      <PrimaryButton
        disabled={!annotationText?.trim().length}
        onClick={() => handleSave({ text: annotationText })}
        className="rounded-md bg-black hover:bg-gray-700 h-7 px-2 justify-center align-middle items-center flex text-white font-bold"
        tabIndex={3}
      >
        Save
      </PrimaryButton>
    </div>
  );
};

export default EditAnnotationFooter;
