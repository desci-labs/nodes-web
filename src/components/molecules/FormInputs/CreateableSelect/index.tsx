import React, { useRef } from "react";
import "./style.css";

interface CreateableSelectProps {
  label: string;
  field?: any;
  useSpaceAsSeparator?: boolean;
  optional?: boolean;
}

const CreateableSelectComponent = (props: CreateableSelectProps) => {
  const {
    field: { value = [], onChange },
    label,
    useSpaceAsSeparator,
    optional,
  } = props;
  const tagInputRef = useRef<HTMLInputElement>(null);

  const removeTag = (i: number) => {
    const newTags = [...value];
    newTags.splice(i, 1);
    onChange(newTags);
  };

  const addTag = (val: string | undefined) => {
    console.log('add tag', val, tagInputRef.current?.value);
    if (val && tagInputRef.current?.value) {
      if (value.find((tag: any) => tag.trim().toLowerCase() === val.trim().toLowerCase())) {
        return;
      }
      onChange([...value, val]);
      tagInputRef.current.value = "";
    }
  };

  const inputKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (!tagInputRef.current) return;
    const val = tagInputRef.current?.value;
    if (
      e.key === "Enter" ||
      e.key === "," ||
      (useSpaceAsSeparator && e.key === " ")
    ) {
      e.preventDefault();
      addTag(val);
    } else if (e.key === "Backspace" && !val) {
      e.preventDefault();
      if (value.length) {
        tagInputRef.current.value = value[value.length - 1];
      }
      removeTag(value.length - 1);
    }
  };

  return (
    <div className="border-b border-b-neutrals-gray-5 group rounded-md px-3 pt-2 shadow-sm bg-white dark:bg-neutrals-gray-1 w-full">
      <label
        className="block text-xs font-medium text-gray-900 dark:text-white"
        onClick={() => tagInputRef.current?.focus()}
      >
        {label}
        {optional ? (
          <>
            &nbsp;
            <span className="text-neutrals-gray-5 text-[10px]">(optional)</span>
          </>
        ) : null}
      </label>
      <div className="input-tag">
        <ul className="input-tag__tags">
          {value.map((tag: string, i: number) => (
            <li key={tag} className="bg-tint-primary h-2 inline-block">
              <div className="input-tag__label">{tag}</div>
              <button
                type="button"
                onClick={() => {
                  removeTag(i);
                }}
              >
                +
              </button>
            </li>
          ))}
          <li className="input-tag__tags__input">
            <input
              ref={tagInputRef}
              type="text"
              className={`-ml-2`}
              onKeyDown={inputKeyDown}
              onBlur={() => addTag(tagInputRef.current?.value)}
            />
          </li>
        </ul>
      </div>
    </div>
  );
};

export default CreateableSelectComponent;
