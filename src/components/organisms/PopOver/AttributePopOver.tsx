import styled from "styled-components";

import AcmPillButton from "@components/atoms/PillButton/AcmPillButton";
import DoiPillButton from "@components/atoms/PillButton/DoiPillButton";
import ButtonCopyLink from "@components/atoms/ButtonCopyLink";
import OpenLinkPillButton from "@components/atoms/PillButton/OpenLinkPillButton";
import OrcidPillButton from "@components/atoms/PillButton/OrcidPillButton";
import { IconCheckShieldDark, IconX } from "@icons";
import ArtifactsEvaluated from "@images/artifacts_evaluated.png";
import PopOver from ".";

const PopoverImage = styled.img.attrs({ src: ArtifactsEvaluated })``;
const ArtifactGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-column-gap: 1rem;
  grid-row-gap: 1rem;
  width: 100%;
`;
const ArtifactGridItems = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  border-radius: 0.5rem;
`;

const ARTIFACTS = [
  {
    name: "Issuer",
    pillButton: AcmPillButton,
  },
  {
    name: "Certifiers",
    pillButton: OrcidPillButton,
  },
  {
    name: "Requirements",
    pillButton: DoiPillButton,
    link: "https://www.acm.org/publications/policies/artifact-review-and-badging-current",
  },
  {
    name: "Proofs",
    pillButton: ButtonCopyLink,
  },
];

const AttributePopOver = (props: any) => {
  //  = props.data;
  if (!props.data) {
    return <></>;
  }
  return (
    <PopOver
      {...props}
      style={{
        color: "black",
        width: 600,
        margin: "3rem 0.75rem",
        overflow: "auto",
        ...props.style,
      }}
      containerStyle={{
        backgroundColor: "#3A3A3ABF",
        ...props.containerStyle,
      }}
      displayCloseIcon={false}
      className="rounded-lg bg-zinc-100 dark:bg-zinc-900  w-full"
    >
      <div className="py-3 px-6">
        <div className="flex flex-row justify-between items-center">
          <div
            className="cursor-pointer p-5 -m-5 absolute right-5 top-5 stroke-black dark:stroke-white hover:stroke-muted-300 hover:dark:stroke-muted-300"
            onClick={() => props.onClose()}
          >
            <IconX />
          </div>
        </div>
        <div className="flex flex-col items-center h-full">
          <span className="relative my-4 pt-4">
            <img
              src={props.data.full}
              className={`w-[120px] min-h-[120px] ${
                props.value ? "" : "opacity-20"
              }`}
            />
            {/* {props.value ? (
              <IconCheckShieldDark
                className="absolute top-2 -right-4 fill-black dark:fill-white"
                style={{ width: 38 }}
              />
            ) : (
              <></>
            )} */}
          </span>
          <span className="text-xl pb-3 dark:text-zinc-100 font-bold">
            {props.data.title}
          </span>
          <span
            className={`text-neutrals-gray-5
            text-xs h-full  w-11/12 block py-4`}
            dangerouslySetInnerHTML={{
              __html: props.data.description.replaceAll(/\n/g, "<br/>"),
            }}
          ></span>
          <div className="text-neutrals-gray-5 text-[10px] py-5">
            This badge has been awarded by{" "}
            <a
              href="https://descifoundation.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-tint-primary"
            >
              DeSci Foundation
            </a>
          </div>
        </div>
      </div>
      {/* <ArtifactGrid className="py-4 px-8">
            {ARTIFACTS.map((artifact: any, index: number) => (
              <ArtifactGridItems
                key={artifact.name}
                className="py-2.5 px-3 dark:bg-dark-gray dark:text-white border-[1px] border-black dark:border-transparent"
              >
                <span className="text-lg">{artifact.name}</span>
                <artifact.pillButton
                  link={`${
                    artifact.link ? artifact.link : "https://google.com"
                  }`}
                />
              </ArtifactGridItems>
            ))}
          </ArtifactGrid>
          <div className="text-center text-xs text-gray-700 dark:text-zinc-500 w-5/6 block py-4">
            The Association for Computing Machinery (ACM) is an international
            learned societiy for computing. It was founded in 1947 and is the
            world's largest scientific and educational computing society. In
            2020, the ACM launched its badge collection to promote
            reproducibility and sharing of scientific artifacts.
          </div>
        </div>
      </div>
      <div className="flex flex-row justify-end bg-white dark:bg-dark-gray dark:border-teal border-t w-full py-2 px-4">
        <OpenLinkPillButton
          leftIcon={() => <span className="text-xs">Txn</span>}
          link="https://etherscan.io/tx/0x67f67e49e2514da6f28af6c012db495b09ead9f9d6b325eece03752c953bcfd1"
        />
      </div> */}
    </PopOver>
  );
};

export default AttributePopOver;
