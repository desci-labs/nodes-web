import React, {
  ChangeEvent,
  ChangeEventHandler,
  FormEventHandler,
  forwardRef,
  HTMLProps,
  KeyboardEvent,
} from "react";

const TextArea = forwardRef<
  HTMLTextAreaElement,
  HTMLProps<HTMLTextAreaElement>
>((props: HTMLProps<HTMLTextAreaElement>, ref) => {
  return <textarea ref={ref} {...props} />;
});

const Input = forwardRef<HTMLInputElement, HTMLProps<HTMLInputElement>>(
  (props: HTMLProps<HTMLInputElement>, ref) => {
    return <input ref={ref} {...props} />;
  }
);

interface InsetLabelSmallInputProps {
  label: string;
  labelClassName?: string;
  textClassName?: string;
  value?: string;
  onChange?: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  multiline?: boolean;
  properties?: {};
  field?: any;
  fieldState?: any;
  clickToSelect?: boolean;
  mandatory?: boolean;
  className?: string;
  optional?: boolean;
  disabled?: boolean;
  maxLength?: number;
  pattern?: string;
  onFocus?: FormEventHandler;
}

const InsetLabelSmallInput = forwardRef<
  HTMLFormElement,
  InsetLabelSmallInputProps
>((props: InsetLabelSmallInputProps, ref) => {
  const {
    label,
    value,
    multiline,
    properties,
    field = {},
    className,
    clickToSelect,
    mandatory = false,
    fieldState,
    optional = false,
    disabled = false,
    maxLength,
    onFocus,
    pattern,
    onChange,
  } = props;
  const InputComponent = multiline ? TextArea : Input;

  return (
    <div
      className={`${
        fieldState?.isTouched && mandatory && !field.value
          ? "border border-rose-400"
          : "border border-transparent border-b border-b-[#969696] focus-within:border-b-tint-primary-hover"
      } group rounded-sm px-3 py-2 shadow-sm bg-white dark:bg-[#272727] w-full relative ${className}`}
    >
      <label
        className={`absolute font-medium text-sm text-gray-900 dark:text-white pointer-events-none ${
          props.labelClassName
        } ${field.value || value?.length ? "top-0 text-[10px]" : "top-3"}`}
      >
        {label}
        {optional && (
          <span className="text-neutrals-gray-5 align-top text-[10px]">
            {" "}
            (optional)
          </span>
        )}
      </label>
      <InputComponent
        type="text"
        className={`relative block w-full border-0 p-0 ${
          field.value ? "mt-2 py-0.5" : "mt-0 py-1.5"
        } text-sm leading-3 bg-transparent font-medium text-gray-900 dark:text-white focus:outline-none focus:group:bg-black focus:ring-0 outline-none shadow-none ${
          props.textClassName ?? ""
        }
        ${multiline ? "mt-2 leading-[1.25rem]" : null}`}
        disabled={disabled}
        value={value}
        onClick={(e: React.MouseEvent) => {
          if (clickToSelect) {
            (e.currentTarget as HTMLInputElement).select();
          }
        }}
        onFocus={onFocus}
        maxLength={maxLength}
        {...properties}
        pattern={pattern}
        onChange={onChange}
        {...field}
        ref={ref}
      />
    </div>
  );
});

export default InsetLabelSmallInput;
