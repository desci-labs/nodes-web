import ContributorsSection from "./ContributorsSection";
import OrganizationsSection from "./OrganizationsSection";
import PropertyTagsSection from "./PropertyTagsSection";

interface SourceTabProps {}

const SourceTab = (props: SourceTabProps) => {
  return (
    <div className="flex flex-col gap-0">
      <PropertyTagsSection />
      {/* <ContributorsSection />
      <OrganizationsSection /> */}
    </div>
  );
};

export default SourceTab;
