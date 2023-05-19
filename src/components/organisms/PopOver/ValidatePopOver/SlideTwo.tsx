import CurrencyInput from "@components/molecules/FormInputs/CurrencyInput";
import { IconEthereum, IconX } from "@icons";
import {
  ResearchObjectV1Validation,
  ResearchObjectValidationType,
} from "@desci-labs/desci-models";
import { ArcSimple } from ".";
import { __log } from "@components/utils";

interface SlideTwoProps {
  amount: number | undefined;
  setAmount: (val: number | undefined) => void;
  currency: string;
  setCurrency: (val: string) => void;
  onClose: () => void;
  onSubmit: (data: ResearchObjectV1Validation) => void;
  validation?: ResearchObjectV1Validation | undefined;
  validationType?: ResearchObjectValidationType;
  arc: ArcSimple | undefined;
}

const SlideTwo = (props: SlideTwoProps) => {
  const {
    amount,
    setAmount,
    currency,
    setCurrency,
    onClose,
    onSubmit,
    validation,
    arc,
    validationType,
  } = props;

  let validationTypeString = "Replication grant";
  switch (validationType) {
    case ResearchObjectValidationType.REVIEW:
      validationTypeString = "Peer-review";
      break;
    case ResearchObjectValidationType.GRANT:
      validationTypeString = "Replication grant";
      break;
    case ResearchObjectValidationType.AUDIT:
      validationTypeString = "Code audit";
      break;
    case ResearchObjectValidationType.CERTIFICATION:
      validationTypeString = "Certification (Individual)";
      break;
    case ResearchObjectValidationType.CERTIFICATION_ARC:
      validationTypeString = "Certification (ARC)";
      break;
  }

  return (
    <>
      <div className="px-6 py-5">
        <div className="flex flex-row justify-between items-center">
          <div className="text-2xl font-bold">Validate Research</div>
          <IconX
            fill="white"
            width={20}
            height={20}
            className="cursor-pointer"
            onClick={onClose}
          />
        </div>
        <div className="text-lg text-[#969696] leading-6 mt-2">
          Mint a validation grant. The validation grant is an NFT and will be
          transfered to your wallet. You can withdraw unclaimed grants.
        </div>
        <div
          className="text-sm text-[#65C3CA] mt-1 cursor-pointer"
          onClick={() => {
            __log("handle something");
          }}
        >
          Learn More
        </div>
        <div className="py-2">
          <div className="py-3">
            <CurrencyInput
              amount={amount}
              onAmountChange={setAmount}
              currency={currency}
              onCurrencyChange={setCurrency}
            />
          </div>
        </div>
        <div className="flex justify-center py-4">
          <div
            className="flex flex-col border border-[#333333] rounded-lg w-5/6"
            style={{ boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)" }}
          >
            <div className="py-2.5 px-3">
              <div className="flex flex-row justify-between">
                <div>
                  <div className="text-sm font-bold">{arc?.name}</div>
                  <div className="text-xs text-[#969696]">
                    {validationTypeString}
                  </div>
                  {/* <div className="text-xs text-[#969696]">
                    Status: Pending Request
                  </div> */}
                </div>
                {/* <div>O</div> */}
              </div>
            </div>
            <div className="flex flex-row justify-between items-center py-2.5 px-3 bg-[#272727] border-t border-t-[#222222] dark:border-t-tint-primary">
              <div className="text-sm font-bold flex items-center justify-center">
                Grant: <IconEthereum /> {amount || 0}
              </div>
              {/* <OpenLinkPillButton
                link="https://etherscan.io/tx/0x67f67e49e2514da6f28af6c012db495b09ead9f9d6b325eece03752c953bcfd1"
                leftIcon={() => <div className="text-xs font-bold">Txn</div>}
              /> */}
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-row justify-end items-center h-16 w-full dark:bg-[#272727] border-t border-t-tint-primary rounded-b-lg p-4">
        <button
          disabled={!amount}
          className={`${
            !amount
              ? "bg-[#525659] text-[#C3C3C3]"
              : "bg-tint-primary hover:bg-gray-500 text-black"
          } transition-colors rounded-lg py-2 px-4 cursor-pointer`}
          onClick={() => {
            const obj: ResearchObjectV1Validation = {
              type: ResearchObjectValidationType.GRANT,
              title: "ARC Metascience",
              subtitle: `Replication grant`,
              transactionId: undefined,
              tokenId: "24",
              contractAddress: "0x0123959125129a",
              url: "https://cloudflare-ipfs.com/ipfs/QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/wiki",
              deposits: [
                {
                  token: "ETH",
                  address: "0x0",
                  amount: `${amount}`,
                },
              ],
            };
            onSubmit(obj);
          }}
        >
          Mint Validation Grant
        </button>
      </div>
    </>
  );
};

export default SlideTwo;
