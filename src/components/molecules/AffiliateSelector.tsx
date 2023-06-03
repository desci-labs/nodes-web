/* This example requires Tailwind CSS v2.0+ */
import React, { memo, useEffect, useMemo, useRef, useState } from "react";
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
import { Organization } from "@src/types/client";
import { IconRor, IconX } from "@src/icons";
import useSWR from "swr";
import { getRorQueries } from "@src/api";
import { FlexRowSpaceBetween } from "../styled";

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

interface Props {
  placeholder?: string;
  onChange: (value: Organization[]) => void;
  defaultValues: Organization[];
}

function useRorQuery(query?: string) {
  // Todo: convert to use redux-query
  const { data, isValidating } = useSWR<{
    results: Organization[];
  }>(query, getRorQueries, { shouldRetryOnError: false });
  return { data: data?.results ?? [], isFetching: isValidating };
}

function AffiliateSelector(props: Props) {
  let { onChange } = props;
  const [, setTouched] = useState<boolean>(false);
  const [input, setInput] = useState("");
  const [values, setValues] = useState<string[]>([]);
  const [debouncedInput] = useDebouncer(input, 300);
  const { isFetching, data } = useRorQuery(debouncedInput);
  const inputChangedRef = useRef(false);
  const dataCacheRef = useRef<{ [key: string]: Organization }>({});

  const onHandleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const defaultValues = useMemo(
    () => props.defaultValues?.map((org) => org.name) || [],
    [props.defaultValues]
  );

  useEffect(() => {
    // don't prefill default values if an edit has been made
    if (inputChangedRef.current === true) return;

    if (values.length === 0 && defaultValues?.length > 0) {
      setValues(defaultValues);
      onChange(props?.defaultValues ?? []);
      props.defaultValues.forEach(
        (org) =>
          (dataCacheRef.current[org.name] = { id: org.id, name: org.name })
      );
    }
  }, [values, defaultValues, onChange, props?.defaultValues]);

  const onValueChanged = (value: string) => {
    if (values.includes(value)) return;
    setInput("");
    setValues((values) => values.concat(value));
    const transformedValues = values
      .concat(value)
      .map((name) => dataCacheRef.current?.[name])
      .filter(Boolean);
    onChange(transformedValues);
    inputChangedRef.current = true;
  };

  const categories = useMemo(() => {
    data.forEach(
      (org) => (dataCacheRef.current[org.name] = { id: org.id, name: org.name })
    );
    return data;
  }, [data]);

  const removefield = (index: number) => {
    const update = [...values];
    update.splice(index, 1);
    setValues((_) => update);
    const transformedValues = update.map(
      (name) => dataCacheRef.current?.[name]
    );
    onChange(transformedValues);
    inputChangedRef.current = true;
  };

  return (
    <Combobox
      aria-label="Select Science field"
      className="relative w-full"
      onSelect={onValueChanged}
    >
      <FlexRowSpaceBetween className="bg-white dark:bg-[#272727] rounded-tr-md rounded-tl-md shadow-verifyInput">
        <div
          className={`relative flex flex-wrap gap-0 w-full border-0 p-2 text-sm bg-transparent font-medium placeholder-white text-gray-900 dark:text-white focus:outline-none focus:group:bg-black focus:ring-0 ring-transparent dark:ring-transparent outline-none shadow-none text-left sm:text-sm`}
        >
          {/* <label className="grow w-full">Add Affiliation ROR PID or Name</label> */}
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
            placeholder="Add Affiliation ROR PID or Name"
            selectOnClick
            onChange={onHandleChange}
            value={input}
            className="block grow text-sm w-full bg-transparent ring-0 focus:ring-0 border-none focus:border-none placeholder-white placeholder:font-bold"
          />
        </div>
        <IconRor className="mr-2 fill-white" width={32} />
      </FlexRowSpaceBetween>

      {(data || isFetching) && (
        <ComboboxPopover
          portal={true}
          style={{
            minHeight: "200px",
            zIndex: 1046,
            marginLeft: -8,
          }}
        >
          <ComboboxList
            onBlur={() => {
              setTouched(true);
            }}
            className="absolute z-10 mt-1 w-full bg-white dark:bg-[#272727] shadow-lg max-h-52  rounded-md py-1 text-base overflow-y-scroll focus:outline-none sm:text-sm list-none"
          >
            {isFetching && (
              <div className="w-full flex justify-center">
                <DefaultSpinner size={30} className="ml-4" />
              </div>
            )}
            {categories.map((option: Organization, idx) => (
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
          {categories.length === 0 &&
          !isFetching &&
          debouncedInput === input ? (
            <div
              className={`flex flex-col justify-center items-center absolute z-10 mt-1 p-2 w-full gap-2 bg-white dark:bg-[#272727] shadow-lg max-h-96rounded-md py-2 text-base ${
                isFetching && "hidden"
              }`}
            >
              <span className="text-white font-bold">{input}</span>
              <span className="block text-gray-400 text-sm">
                No results found
              </span>
            </div>
          ) : (
            ""
          )}
        </ComboboxPopover>
      )}
    </Combobox>
  );
}

export default memo(AffiliateSelector);
