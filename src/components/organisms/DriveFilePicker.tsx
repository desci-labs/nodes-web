import PrimaryButton from "@components/atoms/PrimaryButton";
import {
  createVirtualDrive,
  fillOuterSizes,
  getAllTrees,
  manifestToVirtualDrives,
} from "@components/driveUtils";
import { BreadCrumb } from "@components/molecules/DriveBreadCrumbs";
import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import { ResearchObjectComponentType } from "@desci-labs/desci-models";
import {
  IconChevronLeft,
  IconCodeRepo,
  IconData,
  IconDirectory,
  IconIpfs,
  IconResearchNode,
  IconResearchReport,
  IconX,
} from "@icons";

import { useEffect, useState } from "react";
import ReactTooltip from "react-tooltip";
import { DriveNonComponentTypes, DriveObject, FileType } from "./Drive";
import { useNodeReader } from "@src/state/nodes/hooks";

export interface FileDir {
  name: string;
  path: string;
  size: number;
  cid: string;
  type: FileType;
  contains?: Array<FileDir | DriveObject>;
  parent?: DriveObject | FileDir | null;
}

const Empty = () => {
  return <div className="p-5 text-xs">No files</div>;
};

interface DriveTableProps {
  onRequestClose: () => void;
  onInsert: (file: DriveObject) => void;
}

const DriveTable: React.FC<DriveTableProps> = ({
  onRequestClose,
  onInsert,
}) => {
  const [breadCrumbs, setBreadCrumbs] = useState<BreadCrumb[]>([]);
  // const [fullDirectory, setFullDirectory] = useState<
  //   Array<FileDir | DriveObject>
  // >([]);
  const [directory, setDirectory] = useState<DriveObject[]>([]);
  const [, /* nodeDrived */ setNodeDrived] = useState<DriveObject | null>();

  const {
    manifest: manifestData,
    currentObjectId,
    publicView,
    manifestCid,
  } = useNodeReader();

  const [selected, setSelected] = useState<number | undefined>();

  function exploreDirectory(
    name: FileDir["name"] | DriveObject["name"],
    drive: DriveObject
  ) {
    setDirectory(drive.contains!);
    setSelected(undefined);
    setBreadCrumbs([...breadCrumbs, { name: name, drive: drive }]);
  }

  function eatBreadCrumb(index: number) {
    if (index === 0) {
      setDirectory(breadCrumbs[0].drive.contains!);
      setSelected(undefined);
      setBreadCrumbs(breadCrumbs.slice(0, 1));
    }

    if (index !== 0) {
      setDirectory(breadCrumbs[index - 1].drive.contains!);
      setSelected(undefined);
      setBreadCrumbs(breadCrumbs.slice(0, index));
    }
  }

  useEffect(() => {
    if (!manifestData?.components) return;
    const localNodeDrived = manifestToVirtualDrives(manifestData, manifestCid!);
    if (setNodeDrived) setNodeDrived(localNodeDrived);
    // setFullDirectory(nodeDrived.contains!);

    if (setNodeDrived)
      setNodeDrived((nodeDrived) => {
        console.log("does it run");
        if (!nodeDrived) return nodeDrived;
        setDirectory(nodeDrived.contains!);
        setBreadCrumbs([{ name: "Research Node", drive: nodeDrived }]);

        const fetchTrees = async () => {
          // const newNodeDrived = await getAllTrees(nodeDrived);
          //getAllTrees mutates nodeDrived
          await getAllTrees(nodeDrived, currentObjectId!, manifestData, {
            public: publicView,
          });
          // const { contains } =
          // if (!contains) return;

          // setDirectory(contains);
          // if (breadCrumbs[0]?.directory) breadCrumbs[0].directory = contains;
          // if (breadCrumbs[1]?.name === "Data") breadCrumbs[1].directory = contains;

          //fill sizes
          setDirectory((old: DriveObject[]) => {
            const isNodeRoot = old.findIndex(
              (fd) => fd.name === "Research Reports"
            );
            if (isNodeRoot === -1) return old;

            const virtualData = createVirtualDrive({
              name: "Data",
              componentType: ResearchObjectComponentType.DATA,
              contains: old,
            });
            const sizesFilledDrive = fillOuterSizes(virtualData);
            const newDir = [...sizesFilledDrive.contains!];
            return newDir;
          });
        };
        fetchTrees();

        return nodeDrived;
      });
  }, [currentObjectId, manifestCid, manifestData, publicView]);

  useEffect(() => {
    ReactTooltip.rebuild();
  }, []);

  function toggleSelected(
    index: number,
    componentType: ResearchObjectComponentType | DriveNonComponentTypes
  ) {
    if (index === selected) {
      setSelected(undefined);
    } else {
      setSelected(index);
    }
  }

  return (
    <div className="w-full h-full">
      {/* <DriveBreadCrumbs crumbs={breadCrumbs} eatBreadCrumb={eatBreadCrumb} /> */}
      <div className="p-4 border-b border-neutrals-gray-7 flex flex-row items-center justify-between">
        <span className="flex flex-row items-center">
          {breadCrumbs.length > 1 ? (
            <span
              className="pr-2 cursor-pointer"
              onClick={() => eatBreadCrumb(breadCrumbs.length - 1)}
            >
              <IconChevronLeft height={14} stroke={"black"} className="mr-2" />
            </span>
          ) : null}
          <span className="font-bold">
            {breadCrumbs[breadCrumbs.length - 1]?.name}
          </span>
        </span>
        <IconX
          height={14}
          stroke={"black"}
          className="cursor-pointer"
          onClick={onRequestClose}
        />
      </div>
      <div className="h-full w-full outline-none">
        <ReactTooltip
          id="status"
          place="bottom"
          backgroundColor="black"
          // effect="solid"
        >
          <strong>Public:</strong> Published node component. Available publicly
          on IPFS
          <br />
          <strong>Private:</strong> Unpublishd node component. Uploaded
          privately on staging IPFS server <br />
          <strong>Partial:</strong> Node or folder includes public and private
          components
        </ReactTooltip>
        {directory.length ? (
          directory.map((f: any, idx) => {
            return (
              <DriveRow
                key={`drive_row_${f.cid || idx}`}
                file={f}
                exploreDirectory={exploreDirectory}
                index={idx}
                selected={idx === selected}
                toggleSelected={toggleSelected}
                onInsert={onInsert}
              />
            );
          })
        ) : (
          <Empty />
        )}
      </div>
      <div className="flex flex-row justify-end items-center p-3 border-t border-neutrals-gray-7">
        <PrimaryButton
          title="Insert"
          onClick={() =>
            selected !== undefined && onInsert(directory[selected])
          }
          disabled={selected === undefined}
          className="py-1"
        >
          Insert
        </PrimaryButton>
      </div>
    </div>
  );
};

export default DriveTable;

interface DriveRowProps {
  file: DriveObject;
  exploreDirectory: (
    name: FileDir["name"] | DriveObject["name"],
    drive: DriveObject
  ) => void;
  index: number;
  selected: boolean;
  toggleSelected: (
    index: number,
    componentType: ResearchObjectComponentType | DriveNonComponentTypes
  ) => void;
  onInsert?: (file: DriveObject) => void;
}

function DriveRow({
  file,
  index,
  selected,
  toggleSelected,
  exploreDirectory,
  onInsert,
}: DriveRowProps) {
  function renderComponentIcon() {
    const classes = "w-[34px] h-[34px] ";
    switch (file.componentType) {
      case DriveNonComponentTypes.MANIFEST:
        return <IconResearchNode className={classes} />;
      case ResearchObjectComponentType.PDF:
        return <IconResearchReport className={classes} />;
      case ResearchObjectComponentType.DATA:
        return <IconData className={classes} />;
      case ResearchObjectComponentType.CODE:
        return <IconCodeRepo className={classes} />;
      default:
        return <IconResearchNode className={classes} />;
    }
  }

  return (
    <ul
      className={`h-[48px]list-none font-medium text-sm content-center justify-items-center items-center gap-10 px-5 hover:bg-neutrals-gray-8
        ${
          selected
            ? "bg-tint-primary bg-opacity-50 hover:bg-tint-primary hover:bg-opacity-75"
            : null
        }`}
      onClick={(e) => {
        e.stopPropagation();
        toggleSelected(index, file.componentType);
      }}
    >
      <li
        className={`justify-self-start flex gap-2 w-full h-[48px] items-center cursor-pointer`}
        onClick={(e) => {
          if (e.ctrlKey) return;
          if (file.contains) exploreDirectory(file.name, file);
        }}
      >
        <span>
          {file.type === FileType.DIR ? (
            <IconDirectory />
          ) : (
            <IconIpfs height={20} width={17.3} />
          )}
        </span>
        {file.name}
      </li>
    </ul>
  );
}
