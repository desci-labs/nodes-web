import Credits from "./Credits";;

interface CreditTabProps {}

const CreditTab = (props: CreditTabProps) => {
  return (
    <div className="flex flex-col gap-0">
      <Credits />
      {/* <OrganizationsSection /> */}
    </div>
  );
};

export default CreditTab;
