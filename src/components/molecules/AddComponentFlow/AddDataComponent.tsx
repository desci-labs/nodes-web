import FileUploaderBare from "@components/organisms/FileUploaderBare";
import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import { IconFile } from "@icons";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { SpinnerCircular } from "spinners-react";

interface Props {
  close: () => void;
}

export const ButtonAddData = ({ close }: Props) => {
  const ref = useRef<HTMLInputElement>();
  const { setDroppedFileList, setIsAddingComponent } = useManuscriptController(
    []
  );
  const [loading, setLoading] = useState(false);
  return (
    <>
      <div className="hidden">
        <FileUploaderBare
          ref={ref}
          autoUpload={true}
          customReq={(files) => {
            setTimeout(() => {
              setIsAddingComponent(false);
              setDroppedFileList(files);
              setIsAddingComponent(false);
            }, 500);
            setTimeout(() => {
              close();
              setIsAddingComponent(false);
            }, 50);
          }}
        />
      </div>
      <div
        onClick={() => {
          document.body.onfocus = () => {
            if (
              (document.getElementById("input") as HTMLInputElement).value
                .length
            ) {
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
          //   ref.current!.click();
        }}
        className="w-full select-none rounded-md bg-neutrals-black p-2 cursor-pointer active:bg-neutrals-gray-1 hover:bg-neutrals-gray-2 border-neutrals-gray-2"
      >
        {loading ? (
          <div className="flex flex-row gap-2 items-center">
            Selecting files <SpinnerCircular color="white" size={20} />
          </div>
        ) : (
          <div className="flex flex-row items-center gap-2">
            <IconFile />
            Upload Files
          </div>
        )}
      </div>
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
