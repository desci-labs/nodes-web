import ClickableAddIcon from "@components/atoms/ClickableAddIcon";
import PillButton from "@components/atoms/PillButton";
import TooltipIcon from "@components/atoms/TooltipIcon";
import CollapsibleSection from "@components/organisms/CollapsibleSection";
import { useNodeReader } from "@src/state/nodes/hooks";
import {
  IconInfo,
  IconOrganization,
  IconProtocolLabs,
  IconViewLink,
} from "icons";
import toast from "react-hot-toast";
import Section from "../../Section";
import SectionHeader from "../../Section/SectionHeader";

interface OrganizationsSectionProps {}

const OrganizationsSection = (props: OrganizationsSectionProps) => {
  const { manifest: manifestData, mode } = useNodeReader();

  if (
    mode !== "editor" &&
    (!manifestData ||
      !manifestData.organizations ||
      !manifestData.organizations.length)
  ) {
    return null;
  }

  const isEditing = mode === "editor";

  return (
    <CollapsibleSection
      startExpanded={true}
      title={
        <div className="flex w-full justify-between">
          Organizations
          {!isEditing ? (
            <TooltipIcon
              icon={<IconInfo className="fill-black dark:fill-[white]" />}
              id="contributor-organization"
              tooltip="Linked Organizations"
            />
          ) : null}
        </div>
      }
      collapseIconComponent={
        isEditing
          ? () => {
              return (
                <ClickableAddIcon
                  onClick={(e: React.MouseEvent<HTMLElement>) => {
                    e.stopPropagation();
                    toast.error("Coming Soon", {
                      duration: 2000,
                      position: "top-center",
                      style: {
                        marginTop: 60,
                        borderRadius: "10px",
                        background: "#111",
                        color: "#fff",
                      },
                    });
                    // setIsModalVisible(true);
                  }}
                />
              );
            }
          : undefined
      }
      className="mb-4"
    >
      <div className="flex flex-col gap-3">
        {manifestData &&
          manifestData.organizations &&
          manifestData.organizations.map((organization: any, index: number) => (
            <Section
              key={index}
              header={() => (
                <SectionHeader
                  title={() => (
                    <div className="flex flex-col">
                      <div className="text-sm font-bold">
                        {organization.name}
                      </div>

                      <div className="text-xs text-gray-400">
                        {organization.subtext}
                      </div>
                    </div>
                  )}
                  action={() => (
                    <div className="rounded-full border-[1px] p-[3px] w-[28px] h-[28px] dark:border-white dark:fill-white fill-black border-black">
                      <IconOrganization />
                    </div>
                  )}
                  className="bg-zinc-100 dark:bg-muted-900"
                />
              )}
            >
              <div className="flex flex-row px-4 py-2 justify-end gap-2 w-full">
                <PillButton
                  onClick={() => window.open(organization.url, "_blank")}
                  leftIcon={() => <IconProtocolLabs />}
                  rightIcon={() => <IconViewLink />}
                />
              </div>
            </Section>
          ))}
      </div>
    </CollapsibleSection>
  );
};

export default OrganizationsSection;
