import { EMPTY_FUNC } from "@components/utils";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, SelectorIcon } from "@heroicons/react/solid";
import { IconEthereum, IconEthereumCircle } from "@icons";
import { FC, Fragment, useEffect, useState } from "react";

interface CurrencyInputProps {
  amount: number | undefined;
  onAmountChange: any;
  currency: string;
  onCurrencyChange: any;
}

interface Currency {
  name: string;
  id: string;
  image: FC;
}

const CURRENCY_OPTIONS: Currency[] = [
  { name: "ETH", id: "ETH", image: () => <IconEthereumCircle /> },
  { name: "WBTC", id: "WBTC", image: () => <IconEthereumCircle /> },
  { name: "FIL", id: "FIL", image: () => <IconEthereumCircle /> },
];
function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

export default function CurrencyInput(props: CurrencyInputProps) {
  const amount = props.amount && parseInt(`${props.amount * 100}`);

  const setAmount = (val: number | undefined) => {
    props.onAmountChange(val && parseFloat((val / 100).toFixed(2)));
  };

  const [selected, setSelected] = useState(CURRENCY_OPTIONS[0]);

  return (
    <div>
      <div className="mt-1 relative rounded-t-md shadow-sm border-b border-b-[#969696]">
        <input
          type="text"
          name="price"
          id="price"
          className="text-lg block rounded-t-md py-3 w-full pr-12 border-0 sm:text-sm bg-white dark:bg-[#272727] text-gray-900 font-bold dark:text-white focus:outline-none focus:bg-black focus:ring-0 outline-none shadow-none"
          placeholder="0.00"
          autoComplete="off"
          onKeyDown={(e: any) => {
            e.preventDefault();
            if (e.key === "Backspace") {
              if (amount === undefined) return;
              const newVal = `${amount}`.slice(0, -1);
              setAmount(newVal === "" ? undefined : parseInt(newVal));
              return;
            }
            const allowedChars = "0123456789";
            const contains = (stringValue: string, charValue: any) => {
              return stringValue.indexOf(charValue) > -1;
            };
            const invalidKey =
              (e.key.length === 1 && !contains(allowedChars, e.key)) ||
              (e.key === "." && contains(e.target.value, "."));
            if (!invalidKey && `${amount}`.length < 15) {
              setAmount(parseInt((amount || "") + e.key));
            }
          }}
          value={amount === undefined ? "" : (amount / 100).toFixed(2)}
          onChange={EMPTY_FUNC}
        />
        <div className="absolute inset-y-0 right-0 flex items-center">
          <label htmlFor="currency" className="sr-only">
            Currency
          </label>

          <Listbox value={selected} onChange={setSelected}>
            {({ open }) => (
              <>
                <div className=" relative mr-2">
                  <Listbox.Button className="relative w-full bg-[#333333] border border-transparent rounded-lg font-bold cursor-pointer shadow-sm pl-1 pr-7 py-1 my-1 text-left focus:outline-none focus:ring-1 focus:ring-gray-700 focus:border-gray-700 sm:text-sm">
                    <span className="flex items-center">
                      <selected.image />
                      <span className="ml-1 block truncate">
                        {selected.name}
                      </span>
                    </span>
                    <span className="ml-3 absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
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
                    <Listbox.Options className="absolute z-50 mt-1 w-full bg-[#333333] shadow-lg max-h-56 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                      {CURRENCY_OPTIONS.map((opt: any) => (
                        <Listbox.Option
                          key={opt.id}
                          className={({ active }) =>
                            classNames(
                              active
                                ? "text-white bg-gray-600 cursor-pointer"
                                : "text-white",
                              "cursor-default select-none relative py-2 pl-3 pr-9 list-none"
                            )
                          }
                          value={opt.id}
                        >
                          {({ selected, active }) => (
                            <>
                              <div className="flex items-center">
                                <opt.image />
                                <span
                                  className={classNames(
                                    selected ? "font-semibold" : "font-normal",
                                    "ml-3 block truncate"
                                  )}
                                >
                                  {opt.name}
                                </span>
                              </div>

                              {selected ? (
                                <span
                                  className={classNames(
                                    active ? "text-white" : "text-indigo-600",
                                    "absolute inset-y-0 right-0 flex items-center pr-4"
                                  )}
                                >
                                  <CheckIcon
                                    className="h-5 w-5"
                                    aria-hidden="true"
                                  />
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
        </div>
      </div>
    </div>
  );
}
