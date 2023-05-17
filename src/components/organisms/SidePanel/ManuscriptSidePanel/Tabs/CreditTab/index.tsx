// import ContributorsSection from "./ContributorsSsection";
import Credits from "./Credits";
// import OrganizationsSection from "./OrganizationsSection";
import PropertyTagsSection from "./PropertyTagsSection";

interface CreditTabProps {}

const CreditTab = (props: CreditTabProps) => {
  return (
    <div className="flex flex-col gap-0">
      <PropertyTagsSection />
      <Credits />
      {/* <OrganizationsSection /> */}
    </div>
  );
};

export default CreditTab;
