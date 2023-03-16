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
  const [copyBtn, setCopyBtn] = useState<string>(copyButtonText);

  function handleCopy() {
    setCopyBtn("Copied!");
    navigator.clipboard.writeText(copyText);
    setTimeout(() => setCopyBtn(copyButtonText), 750);
  }
  return (
    <div
      className={`bg-neutrals-gray-1 p-2 border-b-2 border-neutrals-gray-3 ${className}`}
    >
      <h1 className="font-bold select-none">{title}</h1>
      <div className="my-1">{children}</div>
      <button
        className="text-tint-primary font-bold hover:text-tint-primary-hover"
        onClick={handleCopy}
      >
        {copyBtn}
      </button>
    </div>
  );
};

export default CopyBox;
