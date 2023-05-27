import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import {
  ResearchObjectV1,
} from "@desci-labs/desci-models";
import { ResearchNode } from "@src/state/api/types";
import {
  IconCopyLink,
  IconDeleteForever,
  IconKebab,
  IconPenFancy,
} from "@icons";
import { MouseEvent, useEffect, useRef, useState } from "react";
import { useSetter } from "@src/store/accessors";
import { setEditNodeId } from "@src/state/nodes/nodeReader";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarPortal,
  MenubarTrigger,
} from "../atoms/menubar";
import { getResearchObjectStub } from "@src/api";
import { cleanupManifestUrl } from "../utils";
import axios from "axios";
import toast from "react-hot-toast";

export default function NodeCardMenu({
  node: { uuid, title },
}: {
  node: ResearchNode;
}) {
  const dispatch = useSetter();
  const pullRef = useRef(false);
  const [manifest, setManifest] = useState<ResearchObjectV1>();
  const { setShowAddNewNode } = useManuscriptController([]);

  useEffect(() => {
    if (pullRef.current) return;
    async function getManifest() {
      try {
        let targetManifest: ResearchObjectV1;
        // const cid = convertHexToCID(decodeBase64UrlSafeToHex(uuid));
        const { manifestData, uri, manifestUrl } = await getResearchObjectStub(
          "objects/" + uuid
        );
        if (manifestData) {
          targetManifest = manifestData;
        } else {
          const prepManifestUrl = cleanupManifestUrl(uri || manifestUrl);
          const { data } = await axios.get(prepManifestUrl);

          targetManifest = data;
        }
        setManifest(targetManifest);
        pullRef.current = true;
      } catch (e) {}
    }
    getManifest();
  }, [uuid]);

  const isDpidSupported = !!manifest?.dpid;
  const copydPid = (e: MouseEvent) => {
    e.stopPropagation();
    const dpid = `https://${
      manifest?.dpid?.prefix ? manifest.dpid.prefix + "." : ""
    }dpid.org/${manifest?.dpid?.id}`;
    navigator.clipboard.writeText(dpid);
    toast.success("dPid copied", {
      style: {
        marginTop: 50,
        borderRadius: "10px",
        background: "#333333",
        color: "#fff",
      },
    });
  };
  return (
      <Menubar className="border-0 relative">
        <MenubarMenu>
          <MenubarTrigger className="cursor-pointer text-white p-2">
            <IconKebab
              width={20}
              onClick={(e) => {
                e.stopPropagation();
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
                  setShowAddNewNode(true);
                }}
              >
                <span color="#ffffff">
                  <IconPenFancy width={15} color="#fff" fill="#fff" />
                </span>
                <span className="text-white">Edit Metadata</span>
              </MenubarItem>

              {isDpidSupported ? (
                <MenubarItem
                  className="hover:bg-neutrals-gray-3 disabled:hover:bg-transparent disabled:opacity-5"
                  onClick={copydPid}
                >
                  <IconCopyLink fill="white" width={15} />
                  <span className="text-white">Copy dPid</span>
                </MenubarItem>
              ) : null}
              <MenubarItem
                className="hover:bg-neutrals-gray-3"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <IconDeleteForever
                  height={15}
                  width={15}
                  stroke="#C96664"
                  fill="transparent"
                />
                <span className="text-states-error">Delete</span>
              </MenubarItem>
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
      </Menubar>
  );
}
