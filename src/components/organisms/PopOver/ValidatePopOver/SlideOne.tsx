import { IconX } from "@icons";
import { ResearchObjectV1Validation, ResearchObjectValidationType } from "@desci-labs/desci-models";
import { useCallback, useEffect } from "react";
import { ArcSimple } from ".";
import SelectMenu from "@src/components/molecules/FormInputs/SelectMenu";
import { __log } from "@components/utils";

interface ValidationDescription {
  id: number;
  name: string;
  type: ResearchObjectValidationType;
  description: string;
}

const validateData: ValidationDescription[] = [
  {
    id: 1,
    name: "Attribute certification (invited)",
    type: ResearchObjectValidationType.CERTIFICATION,
    description:
      "Individuals you trust to possess the expertise required to verify the attributes of your research node.",
  },
  {
    id: 2,
    name: "Attribute certification (ARC)",
    type: ResearchObjectValidationType.CERTIFICATION_ARC,
    description:
      "Individuals you trust to possess the expertise required to verify the attributes of your research node.",
  },
  {
    id: 3,
    name: "Peer-review",
    type: ResearchObjectValidationType.REVIEW,
    description:
      "Individuals you trust to possess the expertise required to verify the attributes of your research node.",
  },
  {
    id: 4,
    name: "Replication grant",
    type: ResearchObjectValidationType.GRANT,
    description: "Fund a replication study.",
  },
  {
    id: 5,
    name: "Code audit",
    type: ResearchObjectValidationType.AUDIT,
    description: "Review the code for functional parity with the manuscript",
  },
];

const arcData: { [key: number]: ArcSimple[] } = {
  1: [
    {
      id: 1,
      name: "ARC Cryptology",
      description:
        "Specializes in cutting-edge research in the field of cryptology.",
    },
    {
      id: 2,
      name: "ARC Metascience",
      description:
        "Specializes in using research methods to study how research is done and find where improvements can be made.",
    },
  ],
  2: [
    {
      id: 1,
      name: "ARC Cryptology",
      description:
        "Specializes in cutting-edge research in the field of cryptology.",
    },
    {
      id: 2,
      name: "ARC Metascience",
      description:
        "Specializes in using research methods to study how research is done and find where improvements can be made.",
    },
  ],
  3: [
    {
      id: 1,
      name: "ARC Cryptology",
      description:
        "Specializes in cutting-edge research in the field of cryptology.",
    },
    {
      id: 2,
      name: "ARC Metascience",
      description:
        "Specializes in using research methods to study how research is done and find where improvements can be made.",
    },
  ],
  4: [
    {
      id: 1,
      name: "ARC Cryptology",
      description:
        "Specializes in cutting-edge research in the field of cryptology.",
    },
    {
      id: 2,
      name: "ARC Metascience",
      description:
        "Specializes in using research methods to study how research is done and find where improvements can be made.",
    },
  ],
  5: [
    {
      id: 1,
      name: "ARC Cryptology",
      description:
        "Specializes in cutting-edge research in the field of cryptology.",
    },
    {
      id: 2,
      name: "ARC Metascience",
      description:
        "Specializes in using research methods to study how research is done and find where improvements can be made.",
    },
  ],
};

interface SlideOneProps {
  validationType: ValidationDescription;
  setValidationType: (val: ValidationDescription) => void;
  arc: any;
  setArc: (val: any) => void;
  onClose: () => void;
  onSubmit: () => void;
  setValidation: (data: ResearchObjectV1Validation) => void;
}

const SlideOne = (props: SlideOneProps) => {
  const {
    validationType,
    setValidation,
    setValidationType,
    arc,
    setArc,
    onClose,
    onSubmit,
  } = props;

  // load different subtype options for different components
  const chosenType = (validationType || { id: "1" }).id;
  const chosenArcData = arcData[chosenType];

  useEffect(() => {
    if (validationType) {
      setValidation({
        title: "",
        subtitle: "",
        type: validationType.type,
        deposits: [],
        tokenId: "--",
        transactionId: undefined,
        contractAddress: "",
        url: "",
      });
    }
  }, [validationType]);

  const renderDescription = useCallback((data: any) => {
    return data && data.description ? (
      <div className="">
        <div className="text-sm">{data.name}</div>
        <div className="text-sm text-[#969696]">{data.description}</div>
        <div
          className="text-sm text-[#65C3CA] mt-1 cursor-pointer"
          onClick={() => {
            __log("handle something");
          }}
        >
          Learn More
        </div>
      </div>
    ) : null;
  }, []);

  return (
    <>
      <div className="px-6 py-5">
        <div className="flex flex-row justify-between items-center">
          <div className="text-2xl font-bold">Verify Research</div>
          <IconX
            fill="white"
            width={20}
            height={20}
            className="cursor-pointer"
            onClick={onClose}
          />
        </div>
        <div className="text-lg text-[#969696] leading-6 mt-2">
          Anyone can contribute to verifying the robustness of scientific
          results. This is done through validation grants.
        </div>
        <div className="py-2">
          <div className="py-3">
            <SelectMenu
              data={validateData}
              label="Select validation type"
              value={validationType}
              onSelect={(value: ValidationDescription) =>
                setValidationType(value)
              }
            />
          </div>
          {renderDescription(validationType)}
          {validationType && chosenArcData.length ? (
            <div className="py-3 my-3">
              <SelectMenu
                label="Select ARC"
                value={arc}
                data={chosenArcData}
                onSelect={(value: ArcSimple) => setArc(value)}
              />
            </div>
          ) : null}
          {renderDescription(arc)}
        </div>
      </div>
      <div className="flex flex-row justify-end items-center h-16 w-full dark:bg-[#272727] border-t border-t-[#81C3C8] rounded-b-lg p-4">
        <button
          disabled={!validationType && !arc}
          className={`${
            !validationType || !arc
              ? "bg-[#525659] text-[#C3C3C3]"
              : "bg-tint-primary hover:bg-gray-500 text-black"
          } transition-colors rounded-lg py-2 px-4 cursor-pointer`}
          onClick={onSubmit}
        >
          Next
        </button>
      </div>
    </>
  );
};

export default SlideOne;
