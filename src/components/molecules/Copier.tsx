import { CheckIcon } from "@heroicons/react/solid";
import { ButtonHTMLAttributes, FC, useState } from "react";
import { BsClipboard } from "react-icons/bs";

export function useCopier() {
  const [copied, setCopied] = useState(false);

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 1500);
    });
  }

  return { handleCopy, copied };
}

export default function Copier(props: {
  text: string;
  classes?: string;
  icon?: FC<any>;
}) {
  const { handleCopy, copied } = useCopier();

  return (
    <>
      {copied ? (
        <CheckIcon className={`w-8 ${props.classes ?? ""}`} />
      ) : (
        <>
          {props?.icon ? (
            <>{props?.icon({ onClick: () => handleCopy(props.text) })}</>
          ) : (
            <BsClipboard
              className={`cursor-pointer w-8 ${props.classes ?? ""}`}
              onClick={() => handleCopy(props.text)}
            />
          )}
        </>
      )}
    </>
  );
}

export function CopyButton(
  props: ButtonHTMLAttributes<HTMLButtonElement> & {
    text: string;
    label: string;
  }
) {
  const { handleCopy, copied } = useCopier();

  return (
    <button
      {...props}
      className={`text-sm font-bold text-tint-primary hover:text-tint-primary-hover disabled:text-neutrals-gray-4 ${props.className}`}
      onClick={() => handleCopy(props.text)}
    >
      {copied ? (
        <CheckIcon className="w-5 h-5" />
      ) : (
        <BsClipboard className="w-5 h-5" />
      )}
    </button>
  );
}
