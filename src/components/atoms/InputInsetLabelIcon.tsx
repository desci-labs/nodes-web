import InsetLabelInput from "@components/molecules/FormInputs/InsetLabelInput";

const InputInsetLabelIcon = (props: any) => {
  return (
    <div className="relative">
      <div className="absolute left-1 bottom-5 bg-black rounded-full w-5 flex items-center justify-center h-5 pointer-events-none">
        {props.icon}
      </div>
      <InsetLabelInput {...props} className="pl-8" />
    </div>
  );
};
export default InputInsetLabelIcon;
