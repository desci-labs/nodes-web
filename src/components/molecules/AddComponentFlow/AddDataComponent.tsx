import FileUploaderBare from "@components/organisms/FileUploaderBare";
import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import { IconFile, IconFolder, IconIpfs, IconWarning } from "@icons";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { SpinnerCircular } from "spinners-react";
import InsetLabelSmallInput from "../FormInputs/InsetLabelSmallInput";
import PrimaryButton from "@src/components/atoms/PrimaryButton";
import { strIsCid } from "@src/components/driveUtils";
import { addFilesToDrive } from "@src/state/drive/driveSlice";
import { useSetter } from "@src/store/accessors";
import { ResearchObjectComponentType } from "@desci-labs/desci-models";
import { useDrive } from "@src/state/drive/hooks";
import { useGetUser } from "@src/hooks/useGetUser";

interface Props {
  close: () => void;
  directory?: boolean;
  id?: string;
}

export const ButtonAddData = ({ close, directory, id }: Props) => {
  const ref = useRef<HTMLInputElement>(null);
  const { setDroppedFileList, setIsAddingComponent } = useManuscriptController(
    []
  );
  const [loading, setLoading] = useState(false);
  const dispatch = useSetter();

  const handleOnFileUploadClick = () => {
    document.body.onfocus = () => {
      if ((document.getElementById(id) as HTMLInputElement).value.length) {
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
    document.getElementById(id)?.click();
    setLoading(true);
  };

  return (
    <>
      <div className="hidden">
        <FileUploaderBare
          id={id}
          ref={ref}
          autoUpload={true}
          directoryPicker={directory}
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
      <div className="w-[150px] select-none rounded-md bg-neutrals-black  border-neutrals-gray-2 flex gap-3 transition-all">
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
              {id === "file_data" ? (
                <IconFile width={30} height={30} />
              ) : (
                <IconFolder width={30} height={30} />
              )}
              {id === "file_data" ? "Upload Files" : "Upload Folder"}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const AddExternalCidButton = ({
  showCidFields,
  setShowCidFields,
}: {
  showCidFields: boolean;
  setShowCidFields: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  return (
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
  );
};

const AddDataComponent = ({ close }: Props) => {
  const [externalCidName, setExternalCidName] = useState("");
  const [externalCid, setExternalCid] = useState("");
  const [externalCidError, setExternalCidError] = useState("");
  const [showCidFields, setShowCidFields] = useState(false);

  const { setDroppedFileList, setIsAddingComponent } = useManuscriptController(
    []
  );

  const { currentDrive } = useDrive();
  const dispatch = useSetter();

  const [isAdmin, setIsAdmin] = useState(false);
  const { userData } = useGetUser();

  useEffect(() => {
    if (userData && userData.email?.includes("@desci.com")) {
      setIsAdmin(true);
    }
  }, [userData]);

  const handleAddExternalCid = () => {
    if (!externalCidName.length || !externalCid.length) return;
    if (!strIsCid(externalCid)) {
      setExternalCidError("Invalid CID provided");
      return;
    }
    if (currentDrive?.external) {
      setExternalCidError("Can't add files to external directory");
      return;
    }

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
      setExternalCidError("");
    };
  }, []);

  return (
    <>
      <div className="py-3 flex items-center gap-3 text-white">
        <ButtonAddData id="file_data" close={close} />
        <ButtonAddData id="folder_data" directory={true} close={close} />
        {isAdmin && (
          <AddExternalCidButton
            setShowCidFields={setShowCidFields}
            showCidFields={showCidFields}
          />
        )}
      </div>
      {showCidFields && (
        <div className="text-white mt-2 flex flex-col gap-3">
          <div className="self-start">
            <p className="flex gap-2 font-medium items-center bg-neutrals-gray-1 px-2 py-1 rounded-md w-fit">
              <IconWarning /> Experimental Feature
            </p>
            <p className=" text-sm">
              This feature is experimental. Please report any issues using the
              feedback form, and include the CID used.
            </p>
            <p className="text-rose-400 text-sm">{externalCidError}</p>
          </div>
          <div className="flex gap-3 self-start">
            <InsetLabelSmallInput
              className="w-[270px]"
              label="External CID Name"
              value={externalCidName}
              onChange={(e: any) => {
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
              onChange={(e: any) => {
                setExternalCid(e.target.value);
                if (!strIsCid(e.target.value))
                  setExternalCidError("Invalid CID provided");
              }}
            />
            <PrimaryButton
              disabled={!(externalCidName.length && externalCid.length)}
              onClick={handleAddExternalCid}
            >
              Add
            </PrimaryButton>
          </div>
        </div>
      )}
    </>
  );
};

export default AddDataComponent;
