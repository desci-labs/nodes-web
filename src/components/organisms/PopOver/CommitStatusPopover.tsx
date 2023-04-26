import AccountCard from "@components/atoms/AccountCard";
import PrimaryButton from "@components/atoms/PrimaryButton";
import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import {
  cleanupManifestUrl,
  convertUUIDToHex,
  getBytesFromCIDString,
} from "@components/utils";
import { useWeb3React } from "@web3-react/core";

import { ethers } from "ethers";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";

import { DEFAULT_CHAIN } from "@components/molecules/ConnectWithSelect";
import {
  CHAIN_DEPLOYMENT,
  doSwitchChain,
  DPID_CHAIN_DEPLOYMENT,
} from "@components/../chains";
import WarningSign from "@components/atoms/warning-sign";
import { publishResearchObject, updateDraft } from "@api/index";
import axios from "axios";
import {
  ResearchObjectComponentType,
  ResearchObjectV1,
} from "@desci-labs/desci-models";
import { SpinnerCircular } from "spinners-react";
import { Wallet } from "@src/state/api/types";
import { useHistoryReader, useNodeReader } from "@src/state/nodes/hooks";
import { useSetter } from "@src/store/accessors";
import { setManifest } from "@src/state/nodes/viewer";
import { setPendingCommits } from "@src/state/nodes/history";
import { tags } from "@src/state/api/tags";
import { nodesApi } from "@src/state/api/nodes";
import Modal, { ModalProps } from "@src/components/molecules/Modal/Modal";
import WalletManagerModal from "@src/components/molecules/WalletManagerModal";
import { fetchTreeThunk } from "@src/state/drive/driveSlice";
import { useNodesMediaCoverQuery } from "@src/state/api/media";

export const LOCALSTORAGE_TXN_LIST = "desci:txn-list";

const CommitStatusPopover = (props: ModalProps & { onSuccess: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState<string>("0x");
  const [error, setError] = useState<string>();
  const [openWalet, setOpenWallet] = useState(false);

  const dispatch = useSetter();
  const {
    manifest: manifestData,
    currentObjectId,
    manifestCid,
  } = useNodeReader();
  const { pendingCommits } = useHistoryReader();

  const close = () => {
    // setGateway(undefined);
    // setError(undefined);
    // setUrlOrDoi(undefined);
    // setSubType(undefined);
    props?.onDismiss?.();
  };
  const { hooks, chainId, connector, account } = useWeb3React();
  const { usePriorityProvider } = hooks;
  const provider = usePriorityProvider();

  useEffect(() => {
    setAddress(account!);
  }, [account]);

  const createCommit = useCallback(async () => {
    setLoading(true);

    try {
      setError(undefined);
      if (provider) {
        const contractAddress = CHAIN_DEPLOYMENT.address;

        let contract = new ethers.Contract(
          contractAddress,
          CHAIN_DEPLOYMENT.abi
        );

        let dpidContract = new ethers.Contract(
          DPID_CHAIN_DEPLOYMENT.address,
          DPID_CHAIN_DEPLOYMENT.abi
        );

        const connect = (contract: any) => {
          // @ts-ignore
          contract = contract.connect(provider);
          const signer = provider?.getSigner?.();
          // @ts-ignore
          if (signer !== undefined) contract = contract.connect(signer!);
          return contract;
        };

        contract = connect(contract);
        dpidContract = connect(dpidContract);

        let base64UuidToBase16 = convertUUIDToHex(currentObjectId!);

        console.log("Publish CID", base64UuidToBase16, manifestCid);
        let exists = false;
        try {
          exists = (await contract.functions.exists(base64UuidToBase16))[0];
        } catch (err) {
          console.warn(err);
        }
        let tx;
        let cid = getBytesFromCIDString(manifestCid!);
        console.log("DPID CID", cid, manifestCid);
        // debugger;
        // check if token exists, if so update operation
        const DEFAULT_DPID_PREFIX_STRING = "beta";
        const DEFAULT_DPID_PREFIX = ethers.utils.formatBytes32String(
          DEFAULT_DPID_PREFIX_STRING
        );
        if (exists) {
          tx = await contract.functions.updateMetadata(base64UuidToBase16, cid);
        } else {
          const expectedDpidTx = await dpidContract.functions.getOrganization(
            DEFAULT_DPID_PREFIX
          );

          // optimistically retrieve new manifest with dpid
          const newManifestData: ResearchObjectV1 = {
            ...manifestData!,
            dpid: {
              prefix: DEFAULT_DPID_PREFIX_STRING,
              id: expectedDpidTx[0].toString(),
            },
          };

          const {
            hash,
            uri,
            manifestUrl,
            manifestData: retrievedManifestData,
          } = await updateDraft({
            uuid: currentObjectId!,
            manifest: newManifestData,
          });

          const regFee = await dpidContract.functions.getFee();
          const hashBytes = getBytesFromCIDString(hash);
          tx = await contract.functions.mintWithDpid(
            base64UuidToBase16,
            hashBytes,
            DEFAULT_DPID_PREFIX,
            expectedDpidTx[0],
            { value: regFee[0], gasLimit: 350000 }
          );

          if (retrievedManifestData) {
            dispatch(setManifest(retrievedManifestData));
          } else {
            const newManifestUrl = cleanupManifestUrl(uri || manifestUrl);
            const { data } = await axios.get(newManifestUrl);
            dispatch(setManifest(data));
          }
        }
        // console.log("GOT COUNT", resp);

        await tx.wait();
        let txnList = [];
        const val = localStorage.getItem(LOCALSTORAGE_TXN_LIST);
        if (val) {
          txnList = JSON.parse(val);
        }
        txnList.push(tx.hash);
        localStorage.setItem(LOCALSTORAGE_TXN_LIST, JSON.stringify(txnList));

        // const toBlock = await provider.getBlockNumber();
        const eventFilter = contract.filters.VersionPush();
        const events = await contract.queryFilter(eventFilter);

        console.log(events);

        // const md = { ...manifestData! };
        /** Keep track of pending transactions */
        // const newPendingCommits = { ...pendingCommits };
        // if (!newPendingCommits[currentObjectId!]) {
        //   newPendingCommits[currentObjectId!] = [];
        // }
        // newPendingCommits[currentObjectId!].push({
        //   author: {
        //     id: address,
        //     name: address,
        //   },
        //   content: "",
        //   title: "Published",
        //   date: new Date().getTime(),
        //   transaction: {
        //     id: tx.hash,
        //   },
        // });
        const commit = {
          author: {
            id: address,
            name: address,
          },
          content: "",
          title: "Published",
          date: new Date().getTime(),
          transaction: {
            id: tx.hash,
          },
        };
        dispatch(
          setPendingCommits({
            id: currentObjectId!,
            commits: [...(pendingCommits[currentObjectId!] ?? []), commit],
          })
        );
        dispatch(nodesApi.util.invalidateTags([{ type: tags.nodes }]));

        // store locally in case of refresh or new tab
        // localStorage.setItem(
        //   LS_PENDING_COMMITS_KEY,
        //   JSON.stringify(newPendingCommits)
        // );

        if (currentObjectId && manifestCid && manifestData) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars

          publishResearchObject({
            uuid: currentObjectId,
            cid: manifestCid,
            manifest: manifestData,
            transactionId: tx.hash,
          });
        }

        toast.success("Node published!", {
          duration: 2000,
          position: "top-center",
          style: {
            marginTop: 60,
            borderRadius: "10px",
            background: "#111",
            color: "#fff",
          },
        });

        setTimeout(() => dispatch(fetchTreeThunk()));

        props.onSuccess?.();
        close();
      } else {
        toast.error("You must connect a wallet first", {
          duration: 2000,
          position: "top-center",
          style: {
            marginTop: 0,
            borderRadius: "10px",
            background: "#111",
            color: "#fff",
          },
        });
        setOpenWallet(true);
      }
    } catch (err: any) {
      console.error(err);
      setError([err.message, err.data?.message].filter(Boolean).join(" -- "));
      if (err && err.code === "UNSUPPORTED_OPERATION") {
        if (err.reason.indexOf("unknown account") === 0) {
          setOpenWallet(true);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [manifestCid, manifestData, currentObjectId, address, setError]);

  const { wallets } = useManuscriptController(["wallets"]);

  const associatedAccounts: Wallet[] = wallets?.filter(
    (w) => w.address !== address
  );
  const hasAssociated = associatedAccounts && associatedAccounts.length;

  // const isConnected = associatedAccounts?.length < wallets?.length;
  const switchChain = useCallback(doSwitchChain, [connector, setError]);
  const usingAssociatedAccount = !!wallets.filter((w) => w.address === address)
    .length;

  return (
    <>
      <Modal
        $maxWidth={550}
        onDismiss={close}
        isOpen={props.isOpen}
        $scrollOverlay={true}
      >
        <div className="px-6 py-5 lg:w-[550px] text-white">
          <Modal.Header title="Final Step" onDismiss={close} />
          <div className="py-8 px-12" style={{ width: 500 }}>
            <div className="flex flex-col gap-4">
              <div className="text-xs text-center">
                You are now committing your Node into a public blockchain
              </div>
              <div className="text-gray-500 text-xs -mb-4 ml-2">
                Selected cryptographic identity
              </div>

              {wallets && address && usingAssociatedAccount ? (
                <AccountCard
                  account={address}
                  className="pt-10 flex self-center"
                  associated={
                    !!wallets.filter((w) => w.address === address).length
                  }
                  serverWallet={wallets.find((w) => w.address === address)}
                  active={true}
                  canAssociate={!hasAssociated}
                />
              ) : (
                <b>
                  Error: Please select an associated account before continuing
                </b>
              )}
              {error ? (
                <span className="text-[10px] overflow-hidden">{error}</span>
              ) : null}
              {chainId !== DEFAULT_CHAIN ? (
                <span className="text-red-400 text-xs">
                  Wrong network selected
                </span>
              ) : null}
              {chainId !== DEFAULT_CHAIN ? (
                <PrimaryButton
                  onClick={() =>
                    switchChain(
                      DEFAULT_CHAIN,
                      connector.provider!,
                      chainId!,
                      setError
                    )
                  }
                >
                  Fix: Switch Network
                </PrimaryButton>
              ) : (
                <>
                  <div className="text-black text-lg mt-2 border-2 px-5 py-4 items-center flex flex-col text-center bg-yellow-200 border-yellow-300 rounded-md">
                    <WarningSign style={{ filter: "grayscale(1) invert(1)" }} />{" "}
                    Your work will be <strong>visible to the public</strong>{" "}
                    after this step is completed
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <Modal.Footer>
          <PrimaryButton
            onClick={createCommit}
            disabled={!usingAssociatedAccount || loading}
          >
            {loading ? (
              <div className="flex flex-row gap-2 items-center w-full justify-center">
                Publishing <SpinnerCircular color="black" size={20} />
              </div>
            ) : (
              "Sign and Publish"
            )}
          </PrimaryButton>
        </Modal.Footer>
      </Modal>
      <WalletManagerModal
        isOpen={openWalet}
        onDismiss={useCallback(() => setOpenWallet(false), [setOpenWallet])}
      />
    </>
  );
};

export default CommitStatusPopover;
