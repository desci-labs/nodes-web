import FileUploaderBare from "@components/organisms/FileUploaderBare";
import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import { IconFile, IconIpfs } from "@icons";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { SpinnerCircular } from "spinners-react";
import InsetLabelSmallInput from "../FormInputs/InsetLabelSmallInput";
import PrimaryButton from "@src/components/atoms/PrimaryButton";
import { strIsCid } from "@src/components/driveUtils";
import { addFilesToDrive } from "@src/state/drive/driveSlice";
import { useSetter } from "@src/store/accessors";
import { ResearchObjectComponentType } from "@desci-labs/desci-models";

interface Props {
  close: () => void;
}

export const ButtonAddData = ({ close }: Props) => {
  const ref = useRef<HTMLInputElement>(null);
  const { setDroppedFileList, setIsAddingComponent } = useManuscriptController(
    []
  );
  const [loading, setLoading] = useState(false);
  const dispatch = useSetter();

  const [showCidFields, setShowCidFields] = useState(false);
  const [externalCidName, setExternalCidName] = useState("");
  const [externalCid, setExternalCid] = useState("");

  const handleOnFileUploadClick = () => {
    document.body.onfocus = () => {
      if ((document.getElementById("input") as HTMLInputElement).value.length) {
        toast.success("Upload started", {
          duration: 3000,
          position: "top-center",
          style: {
            marginTop: 50,
            borderRadius: "10px",
            background: "#333333",
            color: "#fff",
            zIndex: 150,
          },
        });
        setLoading(false);
      } else {
        setLoading(false);
      }
      document.body.onfocus = null;
    };
    document.getElementById("input")?.click();
    setLoading(true);
  };

  const handleAddExternalCid = () => {
    if (!externalCidName.length || !externalCid.length) return;
    dispatch(
      addFilesToDrive({
        componentType: ResearchObjectComponentType.DATA,
        externalCids: [{ name: externalCidName, cid: externalCid }],
      })
    );
    close();
    setIsAddingComponent(false);
  };

  useEffect(() => {
    return () => {
      setExternalCidName("");
      setExternalCid("");
    };
  }, []);

  return (
    <>
      <div className="hidden">
        <FileUploaderBare
          ref={ref}
          autoUpload={true}
          customReq={(files) => {
            setTimeout(() => {
              dispatch(
                addFilesToDrive({
                  componentType: ResearchObjectComponentType.DATA,
                  files,
                })
              );
            }, 500);
            setTimeout(() => {
              close();
              setIsAddingComponent(false);
            }, 50);
          }}
        />
      </div>
      <div className="w-full select-none rounded-md bg-neutrals-black p-2 border-neutrals-gray-2 flex gap-3 transition-all">
        <div
          className="w-[150px] h-24 font-medium text-base border-neutrals-gray-3 border-2 rounded-md hover:bg-neutrals-gray-2 active:bg-neutrals-gray-1 cursor-pointer"
          onClick={handleOnFileUploadClick}
        >
          {loading ? (
            <div className="flex h-full flex-col items-center justify-center gap-2">
              <SpinnerCircular color="white" size={30} />
              Selecting files
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2">
              <IconFile width={30} height={30} />
              Upload Files
            </div>
          )}
        </div>
        <div
          className={`w-[150px] h-24 font-medium text-base border-neutrals-gray-3 border-2 rounded-md hover:bg-neutrals-gray-2 active:bg-neutrals-gray-1 cursor-pointer
          ${showCidFields ? "bg-tint-primary/10" : ""}`}
          onClick={() => {
            setShowCidFields(!showCidFields);
          }}
        >
          <div className="flex h-full flex-col items-center justify-center gap-2">
            <IconIpfs width={30} height={30} />
            External CID
          </div>
        </div>
      </div>
      {showCidFields && (
        <div className="flex gap-3 self-start">
          <InsetLabelSmallInput
            className="w-[270px]"
            label="External CID Name"
            value={externalCidName}
            onChange={(e) => {
              const value = e.target.value;
              const lastChar = value[value.length - 1];
              if (lastChar !== "/") {
                setExternalCidName(value);
              } else {
                setExternalCidName(externalCidName);
              }
            }}
          />
          <InsetLabelSmallInput
            className="w-full"
            label="External CID"
            value={externalCid}
            onChange={(e) => setExternalCid(e.target.value)}
          />
          <PrimaryButton
            disabled={
              !(
                externalCidName.length &&
                externalCid.length &&
                strIsCid(externalCid)
              )
            }
            onClick={handleAddExternalCid}
          >
            Add
          </PrimaryButton>
        </div>
      )}
    </>
  );
};

const AddDataComponent = ({ close }: Props) => {
  return (
    <div className="py-3 flex flex-col gap-6 items-center text-white">
      <ButtonAddData close={close} />
    </div>
  );
};

export default AddDataComponent;
