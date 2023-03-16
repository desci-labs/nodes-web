import SpacerHorizontal from "@components/atoms/SpacerHorizontal";
import DataUsage from "@components/molecules/DataUsage";

const PanelSection = ({ children, className }: any) => {
  return <div className={`${className}`}>{children}</div>;
};

const SectionTitle = ({ children }: any) => {
  return <h2 className="text-white font-bold text-lg">{children}</h2>;
};

const SectionSubtitle = ({ children }: any) => {
  return <div className="text-sm text-neutrals-gray-5">{children}</div>;
};

const SidePanelStorage = ({ className }: any) => {
  return (
    <div
      className={`w-[320px] bg-[#232323] h-[calc(100vh-55px)] fixed top-0 right-0 pr-8 p-4 gap-4 flex flex-col ${className}`}
    >
      <DataUsage />
      <SpacerHorizontal />
      <PanelSection>
        <SectionTitle>dPIDs</SectionTitle>
        <SectionSubtitle>
          Citable persistent identifiers generated.
        </SectionSubtitle>
      </PanelSection>
      <SpacerHorizontal />
      <PanelSection>
        <SectionTitle>Component Inventory</SectionTitle>
        <SectionSubtitle>Components of your research node.</SectionSubtitle>
      </PanelSection>
    </div>
  );
};

export default SidePanelStorage;
