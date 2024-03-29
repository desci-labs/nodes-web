import { cn } from "@src/lib/utils";
import React, { useState } from "react";

interface Props {
  title: string;
  copyText: string;
  copyButtonText?: string;
  children: JSX.Element | string;
  className?: string;
}

const CopyBox = ({
  title,
  copyText,
  copyButtonText = "Copy Link",
  children,
  className,
}: Props) => {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    setCopied((prev) => true);
    navigator.clipboard.writeText(copyText);
    setTimeout(() => {
      setCopied((prev) => false);
    }, 750);
  }
  return (
    <div
      className={`bg-neutrals-gray-1 p-2 border-b-2 border-neutrals-gray-3 ${className}`}
    >
      <h1 className="font-bold select-none">{title}</h1>
      <div className="my-1">{children}</div>
      <button
        className={cn(
          "text-tint-primary font-bold hover:text-tint-primary-hover disabled:text-neutrals-gray-4",
          copied && "text-states-success hover:text-states-success"
        )}
        onClick={handleCopy}
        disabled={!copyText}
      >
        {copied ? "Copied!" : copyButtonText}
      </button>
    </div>
  );
};

interface CodeBoxProps {
  title: string;
  label: string;
  children: JSX.Element | string;
  className?: string;
  onHandleClick: () => void;
}

export const CodeBox = ({
  title,
  label,
  children,
  className,
  onHandleClick,
}: CodeBoxProps) => {
  return (
    <div
      className={`bg-neutrals-gray-1 p-2 border-b-2 border-neutrals-gray-3 ${className}`}
    >
      <h1 className="font-bold select-none">{title}</h1>
      <div className="my-1">{children}</div>
      <button
        className="text-tint-primary font-bold hover:text-tint-primary-hover"
        onClick={onHandleClick}
      >
        {label}
      </button>
    </div>
  );
};

export default CopyBox;
