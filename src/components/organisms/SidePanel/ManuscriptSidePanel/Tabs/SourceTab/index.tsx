// import ContributorsSection from "./ContributorsSsection";
import Credits from "./Credits";
// import OrganizationsSection from "./OrganizationsSection";
import PropertyTagsSection from "./PropertyTagsSection";

interface SourceTabProps {}

const SourceTab = (props: SourceTabProps) => {
  return (
    <div className="flex flex-col gap-0">
      <PropertyTagsSection />
      <Credits />
      {/* <OrganizationsSection /> */}
    </div>
  );
};

export default SourceTab;
