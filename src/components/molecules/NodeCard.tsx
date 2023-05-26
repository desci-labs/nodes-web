import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import { RESEARCH_OBJECT_NODES_PREFIX } from "@desci-labs/desci-models";
import { ResearchNode } from "@src/state/api/types";
import {
  IconCopyLink,
  IconKebab,
  IconNodeNoMetadata,
  IconPen,
  IconPenFancy,
} from "@icons";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { app, site } from "@src/constants/routes";
import { useSetter } from "@src/store/accessors";
import { setEditNodeId, setPublicView } from "@src/state/nodes/nodeReader";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarPortal,
  MenubarTrigger,
} from "../atoms/menubar";

export interface NodeProps {
  id?: number;
  disabled?: boolean;
  isCurrent?: boolean;
  onClick?: () => void;
  onHandleEdit?: () => void;
}

const NodeCard = ({
  id,
  uuid,
  title,
  updatedAt,
  disabled,
  isPublished,
  isCurrent,
  onClick,
  onHandleEdit,
}: ResearchNode & NodeProps) => {
  const dispatch = useSetter();
  const { setShowAddNewNode } = useManuscriptController([]);
  const navigate = useNavigate();

  const updatedTime: number = Date.parse(updatedAt || new Date().toString());
  const options: Intl.DateTimeFormatOptions = {
    dateStyle: "medium",
    timeStyle: "short",
  };
  const targetUrl = `${site.app}${app.nodes}/${RESEARCH_OBJECT_NODES_PREFIX}${
    uuid || id
  }`;
  const [showContext, setShowContext] = useState<boolean>(false);

  return (
    <div
      className={`select-none flex flex-col cursor-pointer group`}
      onClick={() => {
        if (!disabled) {
          dispatch(setPublicView(false));
          onClick && onClick();
          navigate(targetUrl);
        }
      }}
    >
      <div
        className={`rounded-t-md p-4 bg-[#333333] gap-2 flex flex-col group-hover:!border-neutrals-gray-3 border-2 border-transparent border-b-0 ${
          isCurrent ? "!border-white" : ""
        }`}
      >
        <div className="flex items-center gap-2">
          {updatedAt ? (
            <>
              <div className="rounded-md bg-black text-white font-bold text-[10px] sm:text-xs md:text-sm px-2 py-0.5">
                Creator: Author
              </div>
              <div className="text-[11px] text-neutrals-gray-5">
                Last update:{" "}
                {new Date(updatedTime).toLocaleString("en-US", options)}
              </div>
              <div className="ml-auto ">
                <Menubar className="border-0 relative">
                  <MenubarMenu>
                    <MenubarTrigger className="cursor-pointer text-white p-2">
                      <IconKebab
                        width={20}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowContext(!showContext);
                        }}
                      />
                    </MenubarTrigger>
                    <MenubarPortal>
                      <MenubarContent
                        align="end"
                        sideOffset={-30}
                        alignOffset={30}
                        className="border-0 bg-neutrals-gray-2"
                      >
                        <MenubarItem
                          className="hover:bg-neutrals-gray-3"
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch(
                              setEditNodeId({
                                uuid: uuid!,
                                title,
                                licenseType: null,
                              })
                            );
                            onHandleEdit?.();
                            setShowAddNewNode(true);
                          }}
                        >
                          <span color="#ffffff">
                            <IconPenFancy
                              width={15}
                            />
                          </span>
                          <span className="text-white">Edit Metadata</span>
                        </MenubarItem>
                        <MenubarItem
                          className="hover:bg-neutrals-gray-3"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log("dpid");
                            navigator.clipboard.writeText("");
                            // dispatch(
                            //   setEditNodeId({
                            //     uuid: uuid!,
                            //     title,
                            //     licenseType: null,
                            //   })
                            // );
                            // onHandleEdit?.();
                            // setShowAddNewNode(true);
                          }}
                        >
                          <IconCopyLink fill="white" width={15} />
                          <span className="text-white">Copy dPid</span>
                        </MenubarItem>
                      </MenubarContent>
                    </MenubarPortal>
                  </MenubarMenu>
                </Menubar>
              </div>
            </>
          ) : null}
        </div>
        {disabled ? (
          <div
            className={`bg-[rgb(25,27,28)] w-18 rounded-md shadow-sm p-3 mr-4`}
          >
            <IconNodeNoMetadata />
          </div>
        ) : null}
        <div className="text-xl font-bold text-white w-full overflow-hidden overflow-ellipsis">
          {title || "Untitled Node"}
        </div>
      </div>
      {/**TODO: convert following into BadgeComponent */}
      <div
        className={`${
          isCurrent ? "!border-white" : ""
        } w-full bg-neutrals-black-2 h-11 rounded-b-md border-t !border-t-tint-primary flex flex-shrink flex-row justify-between px-4 py-2 group-hover:!border-neutrals-gray-3 group-hover:border-t-neutrals-gray-6 border-2 border-transparent`}
      >
        <div className="bg-black rounded-md text-white text-[11px] px-2 font-medium flex items-center gap-1.5">
          <div
            className={`${
              isPublished ? "bg-success" : "bg-success-pending"
            } h-2 w-2 rounded-full`}
          />
          <span className="text-[9px] sm:text-[11px]">
            {isPublished ? "Published" : "Unpublished"}
          </span>
        </div>
        {isCurrent ? (
          <div className="bg-success rounded-md text-neutrals-gray-1 text-[11px] px-2 font-medium flex items-center gap-1.5">
            <span className="text-[9px] sm:text-[11px]">Currently Editing</span>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default NodeCard;
