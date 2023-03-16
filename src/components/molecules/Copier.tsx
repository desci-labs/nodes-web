import { CheckIcon, LinkIcon } from "@heroicons/react/solid";
import { useState } from "react";

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

export default function Copier(props: { text: string; classes?: string }) {
  const { handleCopy, copied } = useCopier();
  return (
    <div className="flex items-center justify-center text-center border-none bg-black w-8 p-2 text-sm rounded-xl">
      {copied ? (
        <CheckIcon className={props.classes ?? "w-12"} />
      ) : (
        <LinkIcon
          className={`cursor-pointer w-8 ${props.classes ?? ""}`}
          onClick={() => handleCopy(props.text)}
        />
      )}
    </div>
  );
}
