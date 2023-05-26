/* This example requires Tailwind CSS v2.0+ */
import { Fragment, useState } from "react";
import { Transition } from "@headlessui/react";
import { CheckIcon, SelectorIcon } from "@heroicons/react/solid";
import {
  ListboxInput,
  ListboxButton,
  ListboxPopover,
  ListboxOption,
} from "@reach/listbox";
import styled from "styled-components";

const StyledListBoxInput = styled(ListboxInput)<{}>`
  [data-reach-listbox-input] {
    border: none;
  }
`;
function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

type SelectOption = {
  id: number;
  name: string;
  avatar?: any;
  type?: any;
  description?: string;
};
interface SelectListProps {
  label: string;
  labelRenderer?: (option: SelectOption) => JSX.Element;
  value?: SelectOption;
  onSelect?: (value: any) => void;
  data: any[];
  field?: Record<string, any>;
  mandatory?: boolean;
  defaultValue?: SelectOption;
  className?: string;
  title?: string;
}

// TODO: create a custom Popover component to use

export default function SelectList(props: SelectListProps) {
  let {
    label,
    onSelect,
    data,
    field = {},
    mandatory = false,
    defaultValue,
    title,
    labelRenderer,
  } = props;
  const { ref, ...fieldWithoutRef } = field;
  const [touched, setTouched] = useState<boolean>(false);

  let value = field?.value || props?.value;
  onSelect = field?.onChange || onSelect;
  const chosen = data && value && data.filter((p: any) => p.name === value)[0];

  const labelId = `select-list-${1}`;

  const onHandleChange = (value: any) => {
    if (value === label || value.id === defaultValue?.id) return;
    onSelect?.(value);
  };

  const isDefaultSelected = !value || value.id === defaultValue?.id;
  return (
    <div>
      <StyledListBoxInput
        defaultValue={defaultValue || value}
        onChange={onHandleChange}
        aria-labelledby={labelId}
        className="border-0 border-transparent relative mt-2"
        {...fieldWithoutRef}
      >
        <ListboxButton className="border-0 border-transparent w-full p-0 m-0">
          <div
            className={`relative w-full bg-white dark:bg-[#272727] ${
              touched && mandatory && !field.value
                ? "border border-rose-400"
                : "border border-transparent border-b border-b-[#969696]"
            } rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-pointer focus:outline-none sm:text-sm`}
          >
            {title && <span className="text-xs font-bold">{title}</span>}
            <span className="flex items-center ">
              {chosen && chosen.avatar ? (
                <div className="rounded-full border-black dark:border-white p-1 fill-black dark:fill-white border-[1px] h-[26px] w-[26px] leading-[26px] items-center inline-flex align-middle">
                  {value ? chosen.avatar : null}
                </div>
              ) : null}
              <span className="block truncate font-bold text-white">
                {(value?.name && labelRenderer
                  ? labelRenderer(value)
                  : value?.name) || label}
              </span>
            </span>
            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <SelectorIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </div>
        </ListboxButton>
        <ListboxPopover
          portal={true}
          className="relative max-h-96"
          onBlur={() => {
            setTouched(true);
          }}
        >
          <div
            style={{
              minHeight: data.length > 2 ? 120 : data.length * 42,
            }}
            className={`max-h-96 h-fit overflow-hidden overflow-y-scroll`}
          >
            <Transition
              show={true}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="absolute z-[1044] w-full h-full bg-white dark:bg-[#272727] shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm list-none border border-neutrals-gray-4">
                {defaultValue ? (
                  <ListboxOption
                    key={`listbox_${defaultValue?.id}`}
                    className={classNames(
                      "hover:text-white hidden hover:bg-indigo-600 hover:dark:bg-[#525659] text-gray-900 dark:text-white cursor-pointer select-none relative py-2 pl-3 pr-9"
                    )}
                    value={defaultValue as unknown as any}
                  >
                    <>
                      <div className="flex items-center">
                        <span
                          className={classNames(
                            isDefaultSelected ? "font-semibold" : "font-normal",
                            "block truncate text-md"
                          )}
                        >
                          <span className="pl-2">{defaultValue?.name}</span>
                        </span>
                      </div>
                      {isDefaultSelected && (
                        <span
                          className={classNames(
                            "text-teal hover:text-white absolute inset-y-0 right-0 flex items-center pr-4"
                          )}
                        >
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      )}
                    </>
                  </ListboxOption>
                ) : null}
                {data.map((person: SelectOption) => {
                  const selected = person.name === value?.name;
                  return (
                    <ListboxOption
                      key={`listbox_${person.id}`}
                      className={classNames(
                        "hover:text-white hover:bg-indigo-600 hover:dark:bg-[#525659] text-gray-900 dark:text-white cursor-pointer select-none relative py-2 pl-3 pr-9"
                      )}
                      value={person as unknown as any}
                    >
                      <>
                        <div className="flex items-center">
                          <span
                            className={classNames(
                              selected ? "font-semibold" : "font-normal",
                              "block truncate text-md"
                            )}
                          >
                            {person.avatar ? (
                              <div className="rounded-full border-black dark:border-white p-1 fill-black dark:fill-white border-[1px] h-[26px] w-[26px] leading-[26px] items-center inline-flex align-middle">
                                {person.avatar}
                              </div>
                            ) : null}{" "}
                            <span className="pl-2">
                              {labelRenderer
                                ? labelRenderer(person)
                                : person.name}
                            </span>
                          </span>
                        </div>

                        {selected ? (
                          <span
                            className={classNames(
                              "text-teal hover:text-white absolute inset-y-0 right-0 flex items-center pr-4"
                            )}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    </ListboxOption>
                  );
                })}
              </div>
            </Transition>
          </div>
        </ListboxPopover>
      </StyledListBoxInput>
    </div>
  );
}
