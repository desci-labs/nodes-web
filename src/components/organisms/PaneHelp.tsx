import { IconDiscord, IconGitbook, IconRowTable } from "@src/icons";

interface HelpCardProps {
  icon: any;
  title: string;
  subtitle: string;
  url: string;
}

const HelpCard = ({ icon, title, subtitle, url }: HelpCardProps) => {
  return (
    <a
      key={title}
      href={url}
      rel="noreferrer noopener"
      target="_blank"
      className="cursor-pointer text-center flex flex-col w-full py-10 px-8 gap-3 border-gray-400 border rounded-md hover:border-gray-200 hover:bg-black align-center justify-center"
    >
      <div className="w-full text-center">{icon}</div>
      <span className="font-bold text-center">{title}</span>

      <span className="text-xs text-center">{subtitle}</span>
    </a>
  );
};

const HELP_ITEMS: HelpCardProps[] = [
  {
    icon: <IconGitbook fill="white" stroke="white" className="mx-auto" />,
    title: "Documentation",
    subtitle: "Read our documentation and guides",
    url: "https://docs.desci.com",
  },
  {
    icon: <IconRowTable height={24} className="mx-auto" />,
    title: "FAQ",
    subtitle: "Frequently asked questions, answered",
    url: "https://docs.desci.com/find-help/faq",
  },
  {
    icon: <IconDiscord className="mx-auto" />,
    title: "Community Support",
    subtitle: "Problems? Chat with us on Discord and we'll help!",
    url: "https://docs.desci.com/find-help/community-support",
  },
];

const PaneHelp = () => {
  return (
    <div className="h-screen w-screen fixed pt-14 left-0 z-[102] flex flex-col text-white">
      <div
        className={`flex justify-center items-center overflow-auto flex-col w-full h-[calc(100vh-55px)] p-10 bg-neutrals-black top-0 z-[50] gap-3`}
      >
        <h1 className="text-2xl font-bold mb-10 pt-20">Help</h1>
        <div className="flex flex-col gap-5 h-full mb-20">
          {HELP_ITEMS.map((a) => (
            <HelpCard {...a} />
          ))}
        </div>
      </div>
    </div>
  );
};
export default PaneHelp;
