/* This example requires Tailwind CSS v2.0+ */
import React, { useMemo, useState } from "react";
import { CheckIcon } from "@heroicons/react/solid";
import {
  Combobox,
  ComboboxInput,
  ComboboxList,
  ComboboxOption,
  ComboboxPopover,
} from "@reach/combobox";
import DefaultSpinner from "@src/components/atoms/DefaultSpinner";
import useDebouncer from "@src/hooks/useDebouncer";
import useSearchField from "./useSearchField";
import PrimaryButton from "@src/components/atoms/PrimaryButton";
import { ResearchFields } from "@src/types/client";
import { random } from "lodash";
import { IconX } from "@src/icons";

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

interface Props {
  placeholder?: string;
  onChange: (value: string[]) => void;
}

export default function FieldSelector(props: Props) {
  let { onChange } = props;
  const [touched, setTouched] = useState<boolean>(false);
  const [input, setInput] = useState("");
  const [values, setValues] = useState<string[]>([]);
  const [debouncedInput] = useDebouncer(input, 300);
  const { isFetching, data } = useSearchField(debouncedInput);
  const [customCategories, addCategory] = useState<ResearchFields[]>([]);

  const onHandleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value.trim());
  };

  const onValueChanged = (value: string) => {
    if (values.includes(value)) return;
    setInput("");
    setValues((values) => values.concat(value));
    onChange(values.concat(value));
  };

  const categories = useMemo(
    () =>
      data.concat(
        customCategories.filter((c) => c.name.includes(input.trim()))
      ),
    [customCategories, data, input]
  );

  const removefield = (index: number) => {
    const update = [...values];
    update.splice(index, 1);
    setValues((_) => update);
    onChange(update);
  };

  return (
    <Combobox
      aria-label="Select Science field"
      className="relative"
      onSelect={onValueChanged}
    >
      <div
        className={`relative flex flex-wrap gap-1 w-full border-0 p-0 text-sm bg-transparent font-medium placeholder-white text-gray-900 dark:text-white focus:outline-none focus:group:bg-black focus:ring-0 ring-transparent dark:ring-transparent outline-none shadow-none bg-white dark:bg-[#272727] ${
          touched && !values.length
            ? "border border-tint-primary-dark"
            : "border border-transparent border-b border-b-[#969696]"
        } rounded-md shadow-sm pl-1 pr-1 text-left sm:text-sm`}
      >
        <div className="flex gap-1 flex-wrap items-center shrink">
          {values.map((value, idx) => (
            <span
              key={idx}
              className="p-[2px] px-2 bg-tint-primary-dark rounded-md hover:bg-tint-primary cursor-pointer flex items-center gap-1"
              onClick={() => removefield(idx)}
            >
              {value} <IconX className="cursor-pointer" width={10} />
            </span>
          ))}
        </div>
        <ComboboxInput
          type="text"
          placeholder="Enter category..."
          selectOnClick
          onChange={onHandleChange}
          className="block grow text-sm w-full bg-transparent ring-0 focus:ring-0 border-none focus:border-none"
        />
      </div>

      {(data || isFetching) && (
        <ComboboxPopover portal={false}>
          <ComboboxList
            onBlur={() => {
              setTouched(true);
            }}
            className="absolute z-10 mt-1 w-full bg-white dark:bg-[#272727] shadow-lg max-h-52 rounded-md py-1 text-base overflow-y-scroll focus:outline-none sm:text-sm list-none"
          >
            {isFetching && (
              <div className="w-full flex justify-center">
                <DefaultSpinner size={30} className="ml-4" />
              </div>
            )}
            {categories.map((option: ResearchFields, idx) => (
              <ComboboxOption
                key={option.id}
                value={option.name}
                className={` ${
                  values.includes(option.name)
                    ? "text-white bg-tint-primary-dark"
                    : "text-gray-900 dark:text-white"
                }
                     hover:bg-[#525659] cursor-pointer select-none relative py-2 pl-3 pr-9`}
              >
                <>
                  <div className="flex items-center">
                    <span
                      className={classNames(
                        true ? "font-semibold" : "font-normal",
                        "block truncate text-md"
                      )}
                    >
                      <span className="pl-2">{option.name}</span>
                    </span>
                  </div>

                  {values.includes(option.name) ? (
                    <span
                      className={classNames(
                        true ? "text-white" : "text-teal",
                        "absolute inset-y-0 right-0 flex items-center pr-4"
                      )}
                    >
                      <CheckIcon className="h-5 w-5" aria-hidden="true" />
                    </span>
                  ) : null}
                </>
              </ComboboxOption>
            ))}
          </ComboboxList>
          {categories.length === 0 && !isFetching ? (
            <div
              className={`flex flex-col justify-center items-center absolute z-10 mt-1 p-2 w-full gap-2 bg-white dark:bg-[#272727] shadow-lg max-h-96 rounded-md py-2 text-base ${
                isFetching && "hidden"
              }`}
            >
              <span>{input}</span>
              <span className="block text-gray-400 text-sm">No results found</span>
              <PrimaryButton
                className="block mt-1 cursor-pointer disabled:cursor-not-allowed"
                onClick={() =>
                  addCategory((prev) =>
                    prev.concat([{ name: input, id: random(500, 600) }])
                  )
                }
              >
                Add New Field of Science
              </PrimaryButton>
            </div>
          ) : (
            ""
          )}
        </ComboboxPopover>
      )}
    </Combobox>
  );
}
