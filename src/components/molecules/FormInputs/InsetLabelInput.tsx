import React, { KeyboardEvent, useState } from "react";

const TextArea = (props: any) => {
  const { field, ...rest } = props;
  return <textarea {...rest} {...field} />;
};

const Input = (props: any) => {
  const { field, ...rest } = props;
  return <input {...rest} {...field} />;
};

interface InsetLabelInputProps {
  label: string;
  labelClassName?: string;
  textClassName?: string;
  value?: string;
  onChange?: (e: KeyboardEvent) => void;
  multiline?: boolean;
  field?: any;
  fieldState?: any;
  clickToSelect?: boolean;
  mandatory?: boolean;
  className?: string;
}

export default function InsetLabelInput(props: InsetLabelInputProps) {
  const {
    label,
    value,
    onChange,
    multiline,
    field = {},
    className,
    clickToSelect,
    mandatory = false,
    fieldState,
  } = props;

  const [focused, setFocused] = useState<boolean>(false);

  const InputComponent = multiline ? TextArea : Input;
  return (
    <div
      className={`${
        fieldState?.isTouched && mandatory && !field.value
          ? "border-none border-rose-400"
          : "border-none border-transparent border-b border-b-[#969696]"
      } ${
        focused ? "shadow-InputActive" : "shadow-Input"
      } group rounded-md rounded-b-none px-3 py-2 bg-white dark:bg-[#272727] w-full ${className}`}
    >
      <label
        className={`block text-xs font-bold text-gray-900 dark:text-white pointer-events-none ${props.labelClassName}`}
      >
        {label}
        {!mandatory ? (
          <>
            &nbsp;<span className="text-gray-500">(optional)</span>
          </>
        ) : null}
      </label>
      <InputComponent
        type="text"
        className={`relative ${
          multiline ? "pt-1" : "pt-4 -mb-4 -top-4"
        } block w-full border-0 p-0 text-sm bg-transparent text-gray-900 dark:text-white focus:outline-none  focus:group:bg-black focus:ring-0 outline-none shadow-none ${
          props.textClassName
        }`}
        onFocus={(e: React.FocusEvent) => {
          setFocused(true);
        }}
        onBlur={(e: React.FocusEvent) => {
          setFocused(false);
        }}
        value={value}
        onChange={onChange}
        // {...!onChange ? {} : { readOnly: true }}
        field={field}
        onClick={(e: React.MouseEvent) => {
          if (clickToSelect) {
            (e.currentTarget as HTMLInputElement).select();
          }
        }}
      />
    </div>
  );
}
