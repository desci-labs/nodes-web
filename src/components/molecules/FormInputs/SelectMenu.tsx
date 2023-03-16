/* This example requires Tailwind CSS v2.0+ */
import { Fragment, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, SelectorIcon } from "@heroicons/react/solid";

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
interface SelectMenuProps {
  label: string;
  value?: SelectOption;
  onSelect?: (value: any) => void;
  data: any[];
  field?: Record<string, any>;
  mandatory?: boolean;
  defaultValue?: SelectOption;
  className?: string;
  title?: string;
}

export default function SelectMenu(props: SelectMenuProps) {
  let {
    label,
    onSelect,
    data,
    field = {},
    mandatory = false,
    defaultValue,
    title,
  } = props;
  const { ref, ...fieldWithoutRef } = field;
  const [touched, setTouched] = useState<boolean>(false);

  let value = field?.value || props?.value || defaultValue;
  onSelect = field?.onChange || onSelect;
  const chosen = data && value && data.filter((p: any) => p.name === value)[0];

  return (
    <Listbox
      value={value}
      onChange={(value) => onSelect?.(value)}
      {...fieldWithoutRef}
    >
      {({ open }) => (
        <>
          <div className={`mt-1 relative dark:text-white ${props.className}`}>
            <Listbox.Button
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
                <span className="block truncate font-bold">
                  {value?.name || label}
                </span>
              </span>
              <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <SelectorIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options
                onBlur={() => {
                  setTouched(true);
                }}
                className="absolute z-10 mt-1 w-full bg-white dark:bg-[#272727] shadow-lg max-h-96 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm list-none"
              >
                {data.map((person: any) => (
                  <Listbox.Option
                    key={person.id}
                    className={({ active }) =>
                      classNames(
                        active
                          ? "text-white bg-indigo-600 dark:bg-[#525659]"
                          : "text-gray-900 dark:text-white",
                        "cursor-pointer select-none relative py-2 pl-3 pr-9"
                      )
                    }
                    value={person}
                  >
                    {({ selected, active }) => (
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
                            <span className="pl-2">{person.name}</span>
                          </span>
                        </div>

                        {selected ? (
                          <span
                            className={classNames(
                              active ? "text-white" : "text-teal",
                              "absolute inset-y-0 right-0 flex items-center pr-4"
                            )}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </>
      )}
    </Listbox>
  );
}
