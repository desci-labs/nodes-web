import ButtonSecondary from "@src/components/atoms/ButtonSecondary";
import { ResearchObjectIcon, SVGIconProps } from "@src/components/Icons";
import { app, site, web } from "@src/constants/routes";
import { IconHamburger, IconX } from "@src/icons";
import { useUser } from "@src/state/user/hooks";
import { NavLink, useNavigate } from "react-router-dom";
import { TextLink } from "./Footer";
import { useMobileMenu, useSetMobileMenu } from "./useAppMenu";

export const BetaLogo = ({
  textClassName,
  className,
  ...props
}: {
  className?: string;
  textClassName?: string;
} & SVGIconProps) => (
  <NavLink to={site.web} className="flex items-center justify-around gap-1">
    <div className="node-icon-wrapper bg-gradient-to-br from-[#00E3FF] to-[#0A697C] p-[2px] animate-nodeGradient">
      <div
        className={`bg-black w-full h-full p-[2px] flex items-center justify-center ${
          className ?? ""
        }`}
      >
        <ResearchObjectIcon {...props} />
      </div>
    </div>
    <div
      className={`logo-text relative pl-1 flex flex-col items-start justify-around text-white leading-[1] ${
        textClassName ?? ""
      }`}
    >
      <span>
        De<span className="text-primary">Sci</span>
      </span>
      <span>Nodes</span>
    </div>
  </NavLink>
);

const URL_FAQ = "https://docs.desci.com/find-help/faq";
const URL_GETTING_STARTED =
  "https://docs.desci.com/using-nodes/getting-started";

export default function Header() {
  const navigate = useNavigate();
  const userProfile = useUser();
  const isLoggedIn = userProfile.userId > 0;

  return (
    <div className="px-4 md:px-0 w-screen bg-black py-3 flex justify-center select-none transition-transform duration-1000 relative">
      <div className="container mx-auto flex gap-5 justify-between items-center h-[60px]">
        <nav className="flex gap-10 items-center md:grow">
          <BetaLogo textClassName="text-xs" />
          <a
            href={URL_GETTING_STARTED}
            target="_blank"
            rel="noreferrer noopener"
            title="Getting Started"
            className="hidden md:block text-white hover:text-gray-500"
          >
            Getting Started
          </a>
          <a
            href={URL_FAQ}
            title="FAQ"
            target="_blank"
            rel="noreferrer noopener"
            className="hidden md:block text-white hover:text-gray-500"
          >
            FAQ
          </a>
        </nav>
        <div className="flex items-center gap-4">
          <ButtonSecondary
            className="py-5 px-6"
            onClick={() =>
              isLoggedIn
                ? navigate(`${site.app}${app.nodes}/start`)
                : navigate(`${site.web}${web.login}`)
            }
          >
            <span className="text-lg">{isLoggedIn ? "App" : "Log In"}</span>
          </ButtonSecondary>
          <MenuTrigger />
        </div>
      </div>
      <MobileMenu />
    </div>
  );
}

function MenuTrigger() {
  const { toggleMenu } = useSetMobileMenu();
  return (
    <div className="md:hidden flex items-center">
      <button
        className="m-0 px-2 py-3 border border-tint-primary rounded-md  hover:bg-tint-primary"
        onClick={toggleMenu}
      >
        <IconHamburger
          color="white"
          stroke="#000"
          fill="#fff"
          width={40}
          height={20}
        />
      </button>
    </div>
  );
}

function MobileMenu() {
  const opened = useMobileMenu();
  const { toggleMenu } = useSetMobileMenu();
  return (
    <div
      className={`z-50 pointer-none opacity-0 md:hidden fixed left-0 right-0 top-0 min-h-[50px] p-4 backdrop-blur-2xl overflow-hidden w-full ${
        opened ? "pointer-click opacity-100 animate-slideFromTop" : "h-0"
      }`}
    >
      <div className="flex items-center">
        <div className="flex gap-4 grow">
          <TextLink
            url={URL_GETTING_STARTED}
            title="Getting Started"
            className="text-white hover:text-gray-500"
          />
          <TextLink
            title="FAQ"
            url={URL_FAQ}
            className="text-white hover:text-gray-500"
          />
        </div>
        <button className="m-0 p-4" onClick={toggleMenu}>
          <IconX color="white" stroke="#ffffff" width={40} height={20} />
        </button>
      </div>
    </div>
  );
}
