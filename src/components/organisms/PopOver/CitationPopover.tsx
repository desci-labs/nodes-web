import PrimaryButton from "@components/atoms/PrimaryButton";
import { useManuscriptController } from "@components/organisms/ManuscriptReader/ManuscriptController";
import { IconWarning } from "@icons";
import {
  ButtonHTMLAttributes,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Controller, useForm } from "react-hook-form";
import { CopyButton, useCopier } from "@components/molecules/Copier";
import { ResearchObjectComponentType } from "@desci-labs/desci-models";
import { getPublishedVersions } from "@src/api";
import { AccessStatus, DriveObject, FileDir, FileType } from "../Drive";
import {
  CITATION_FORMATS,
  DEFAULT_RESULT,
  getFormatter,
} from "@src/helper/citation";
import { BsClipboard } from "react-icons/bs";
import { CheckIcon } from "@heroicons/react/solid";
import { useUser } from "@src/state/user/hooks";
import { useNodeReader } from "@src/state/nodes/hooks";
import Modal, { ModalProps } from "@src/components/molecules/Modal/Modal";
import SelectList from "@src/components/molecules/FormInputs/SelectList";

// Todo: implement a useNodeDetails hook to get the details of a the currentObjectId like (owner etc)
// Todo: use the owner details to determine if the current user is the owner
// Todo: if the current userId == ownerId, add extra features like profile
// Todo: completion shortcut if user has not completed their  profile

const CitationComponent = () => {
  const userProfile = useUser();
  const { componentToCite, setShowProfileUpdater } = useManuscriptController([
    "componentToCite",
    "showProfileUpdater",
  ]);
  const {
    manifest: manifestData,
    currentObjectId,
    publicView,
  } = useNodeReader();

  const { control, watch } = useForm({
    defaultValues: {
      format: CITATION_FORMATS[0],
    },
  });
  const format = watch("format");

  const [version, setVersion] = useState<number>();
  const [year, setYear] = useState<number | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    setIsLoading(true);

    (async () => {
      try {
        if (currentObjectId) {
          const versionData = await getPublishedVersions(currentObjectId!);
          setIsPublished(versionData.versions.length > 0);
          if (versionData.versions.length === 0) return;
          const v = versionData.versions[versionData.versions.length - 1];
          setVersion(versionData.versions.length - 1);
          setYear(new Date(v.time * 1000).getFullYear());
        }
      } catch (e) {
        console.error("public version", e);
      } finally {
        setIsLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentObjectId]);

  const isDpidSupported = !!manifestData?.dpid;
  const dpidLink = useMemo(
    () =>
      isDpidSupported
        ? `https://${
            manifestData?.dpid?.prefix ? manifestData?.dpid?.prefix + "." : ""
          }dpid.org/${manifestData?.dpid?.id}/v${version || 1}`
        : "",
    [
      isDpidSupported,
      manifestData?.dpid?.id,
      manifestData?.dpid?.prefix,
      version,
    ]
  );

  const getComponentDpid = useCallback((): string => {
    if (!componentToCite) return "";

    const component =
      componentToCite.type === FileType.Dir
        ? componentToCite?.contains?.[0] ?? null
        : componentToCite;
    if (!component) return dpidLink;

    let componentParent: DriveObject | FileDir = component;
    while (
      componentParent &&
      componentParent.parent &&
      componentParent.parent.cid?.length > 10
    ) {
      componentParent = componentParent?.parent!;
    }

    const index = manifestData?.components.findIndex(
      (c) => c.id === component.cid || c.id === componentParent.cid
    );
    const versionString =
      index === undefined || index < 0 ? version : `${version}/${index}`;

    let fqi = isDpidSupported
      ? `${manifestData?.dpid?.id}/${versionString}`
      : `${currentObjectId?.replaceAll(".", "") ?? ""}/${versionString}`;

    let fqiDataSuffix = undefined;

    if (
      index &&
      manifestData?.components[index]?.type ===
        ResearchObjectComponentType.DATA &&
      componentParent
    ) {
      const splitPath = component.path?.split("/").filter((a) => a !== "Data");
      if (splitPath && splitPath.length > 1) {
        let newPath = splitPath.slice(1);
        newPath.unshift(componentParent.name);
        if (componentToCite.type === FileType.Dir) {
          newPath = [componentParent.name];
        }
        fqiDataSuffix = newPath.join("/");
      }
    }

    const fqDpid =
      index === undefined || index < 0
        ? dpidLink
        : `${dpidLink}/${index}${fqiDataSuffix ? `/${fqiDataSuffix}` : ""}`;

    const link = isDpidSupported
      ? fqDpid
      : `${window.location.protocol}//${window.location.host}/${fqi}${
          fqiDataSuffix ? `/${fqiDataSuffix}` : ""
        }`;

    let codeLink = `${window.location.protocol}//${window.location.host}/${fqi}`;

    return component.componentType === ResearchObjectComponentType.CODE
      ? codeLink
      : link;
  }, [
    componentToCite,
    currentObjectId,
    dpidLink,
    isDpidSupported,
    manifestData?.components,
    manifestData?.dpid?.id,
    version,
  ]);

  const canCite = (publicView || userProfile?.profile.name) && manifestData;
  const formatter = useMemo(() => getFormatter(format.name), [format.name]);
  const { citation } = useMemo(
    () =>
      canCite
        ? formatter({
            author: userProfile?.profile?.name,
            manifest: manifestData!,
            dpidLink: getComponentDpid(),
            year,
            isPublished: componentToCite?.accessStatus === AccessStatus.PUBLIC,
            componentType: componentToCite?.componentType,
          })
        : DEFAULT_RESULT,
    [
      canCite,
      formatter,
      userProfile?.profile?.name,
      manifestData,
      getComponentDpid,
      year,
      componentToCite?.accessStatus,
      componentToCite?.componentType,
    ]
  );

  return (
    <div className="w-full">
      <div className="py-3 mb-2">
        <Controller
          name="format"
          control={control}
          render={({ field }: any) => (
            <SelectList
              title="Choose citation format"
              label="Choose citation format"
              data={CITATION_FORMATS}
              defaultValue={CITATION_FORMATS[0]}
              field={field}
              mandatory={true}
            />
          )}
        />
      </div>
      <div className="flex flex-col gap-5">
        <Box>
          <div className="flex flex-col gap-1 ml-3 items-start relative">
            <span className="text-xs font-bold">Citation</span>
            <pre className="overflow-auto w-full">
              <code>{citation}</code>
            </pre>
            {/* <span className="text-sm">{citation}</span> */}
            <CopyButton
              disabled={!(isPublished && canCite && citation)}
              text={citation}
              label="Copy Citation"
              className="absolute right-2 top-0"
            />
          </div>
        </Box>
        {!publicView && !userProfile?.profile.name && (
          <div>
            <div className="text-neutrals-gray-7 text-sm border-yellow-300 gap-2 bg-neutrals-gray-3 p-2 rounded-md flex flex-row items-center">
              <IconWarning height={16} /> Complete your profile to cite this
              component
            </div>
            <PrimaryButton
              className="bg-transparent hover:bg-transparent text-tint-primary hover:text-white"
              onClick={() => setShowProfileUpdater(true)}
            >
              {" "}
              Complete Profile{" "}
            </PrimaryButton>
          </div>
        )}
        {isDpidSupported && dpidLink && (
          <>
            <Box>
              <div className="flex flex-col gap-1 ml-3 items-start relative">
                <span className="text-xs font-bold">dPID</span>
                <input
                  type="text"
                  className="text-sm bg-transparent outline-none border-0 p-0 pr-10 !ring-0 block w-full overflow-auto"
                  value={getComponentDpid()}
                />
                <CopyButton
                  disabled={!isPublished}
                  text={getComponentDpid()}
                  label="Copy dPID"
                  className="absolute right-2 top-0"
                />
              </div>
            </Box>
            <p className="text-neutrals-gray-5 text-xs">
              The decentralized persistent identifier (dPID) is a long-lasting
              reference to this research node that supports versioning, data
              storage, and compute.
              {/* {componentToCite?.accessStatus != AccessStatus.PUBLIC ? <div className="pt-2">Note: This file has not yet been published so it may not be available via dpid.org.</div> : null} */}
              {/* specific document, file, or other digital object.{" "} */}
              {/** NOTE: referencing research object until we add support for file-specific citation */}
            </p>
          </>
        )}
        {!isDpidSupported && (
          <div className="text-neutrals-gray-7 text-sm border-yellow-300 gap-2 bg-neutrals-gray-3 p-2 rounded-md flex flex-row items-center">
            <IconWarning height={16} /> This node version has no dPID. A dPID is
            assigned upon publishing.
          </div>
        )}
      </div>
    </div>
  );
};



function Box(props: PropsWithChildren<{}>) {
  return (
    <div className="relative w-full bg-white dark:bg-[#272727] border border-transparent border-b border-b-[#969696] rounded-t-md shadow-sm py-2 text-left focus:outline-none sm:text-sm">
      {props.children}
    </div>
  );
}

const CitationPopover = (props: ModalProps) => {
  const { showCitationModal, setShowCitationModal } = useManuscriptController([
    "showCitationModal",
  ]);
  const close = () => {
    props?.onDismiss?.();
    setShowCitationModal(false);
  };

  return (
    <Modal
      {...props}
      isOpen={showCitationModal}
      onDismiss={close}
      $maxWidth={650}
    >
      <div className="px-6 py-5 text-white">
        <Modal.Header
          onDismiss={close}
          title="Cite"
          subTitle="Choose your citation format then click copy citation, or copy
              dPID."
        />
        <div className="py-2">
          <CitationComponent />
        </div>
      </div>
      <Modal.Footer>
        <PrimaryButton className="w-[63px] justify-center flex" onClick={close}>
          Done
        </PrimaryButton>
      </Modal.Footer>
    </Modal>
  );
};

export default CitationPopover;
