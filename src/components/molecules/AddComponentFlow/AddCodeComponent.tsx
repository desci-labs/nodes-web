import React from "react";
import InsetLabelInput from "../FormInputs/InsetLabelInput";

interface Props {
  urlOrDoi: string | undefined;
  setUrlOrDoi: React.Dispatch<React.SetStateAction<string | undefined>>;
}

const AddCodeComponent: React.FC<Props> = ({ urlOrDoi, setUrlOrDoi }) => {
  return (
    <div className="py-3 flex flex-col gap-6 items-center">
      <InsetLabelInput
        label={"Enter Github URL"}
        value={urlOrDoi}
        mandatory={true}
        onChange={(value: any) => {
          setUrlOrDoi(value.target.value.trim());
        }}
      />
    </div>
  );
};

export default AddCodeComponent;
