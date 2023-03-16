import React, { KeyboardEvent } from "react";

const TextArea = (props: any) => {
  const { field, ...rest } = props;
  return <textarea {...rest} {...field} />;
};

export const Input = (props: any) => {
  const { field, ...rest } = props;
  return <input {...rest} {...field} />;
};

interface PlaceholderInputProps {
  placeholder: string;
  textClassName?: string;
  value?: string;
  onChange?: (e: KeyboardEvent) => void;
  multiline?: boolean;
  properties?: {};
  field?: any;
  fieldState?: any;
  clickToSelect?: boolean;
  mandatory?: boolean;
  className?: string;
  optional?: boolean;
}

export default function PlaceholderInput(props: PlaceholderInputProps) {
  const {
    placeholder,
    value,
    onChange,
    multiline,
    properties,
    field = {},
    className,
    clickToSelect,
    mandatory = false,
    fieldState,
    optional = false,
  } = props;

  const InputComponent = multiline ? TextArea : Input;
  return (
    <div
      className={`${
        fieldState?.isTouched && mandatory && !field.value
          ? "border border-rose-400"
          : "border border-transparent border-b border-b-[#969696]"
      } group rounded-sm px-3 py-2 shadow-sm bg-white dark:bg-[#272727] w-full relative ${className}`}
    >
      <InputComponent
        type="text"
        className={`relative block w-full border-0 p-0 text-sm bg-transparent font-medium placeholder-white text-gray-900 dark:text-white focus:outline-none  focus:group:bg-black focus:ring-0 outline-none shadow-none ${props.textClassName} placeholderOptional`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        field={field}
        onClick={(e: React.MouseEvent) => {
          if (clickToSelect) {
            (e.currentTarget as HTMLInputElement).select();
          }
        }}
        {...properties}
      />
      {optional && !field.value && (
        <div id="optional" className="absolute left-3 top-2">
          <span className="font-medium text-sm invisible">{placeholder}</span>
          <span className="text-neutrals-gray-5"> (optional)</span>
        </div>
      )}
    </div>
  );
}
