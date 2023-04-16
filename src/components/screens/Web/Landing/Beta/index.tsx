import { ArrowNarrowDownIcon } from "@heroicons/react/outline";
import ButtonSecondary from "@src/components/atoms/ButtonSecondary";
import PrimaryButton from "@src/components/atoms/PrimaryButton";
import { app, site, web } from "@src/constants/routes";
import {
  IconBlock,
  IconDigitalKey,
  IconPlanet,
  IconRepo,
  SvgIconProps,
} from "@src/icons";
import { useUser } from "@src/state/user/hooks";
import { PropsWithChildren, ReactElement } from "react";
import { NavLink } from "react-router-dom";
import "../style.scss";
import Footer from "./Footer";
import Header from "./Header";

export default function BetaLanding() {
  return (
    <>
      <Header />
      <div className="px-10 lg:px-0">
        <Banner />
        <IntroCards />
        <Terminologies />
      </div>
      <Footer />
    </>
  );
}

const Terminologies = () => (
  <section className="container mx-auto max-w-5xl mt-36 mb-20 text-white">
    <h2 className="text-xl font-bold text-white mb-8 pb-16 md:mb-0">
      Open infrastructure for FAIR digital research objects
    </h2>
    <TermItem
      title="open"
      action={
        <a
          href="https://docs.desci.com/learn/open-state-repository"
          target="_blank"
          rel="noreferrer noopener"
        >
          <ButtonSecondary className="py-5 px-6">Learn more</ButtonSecondary>
        </a>
      }
    >
      <>
        Nodes are published on an{" "}
        <a
          href="https://docs.desci.com/learn/open-state-repository"
          target="_blank"
          rel="noopener noreferrer"
          className="text-tint-primary hover:text-tint-primary-hover"
        >
          Open State repository
        </a>{" "}
        that is irrevocably open access, without platform boundaries or vendor
        lock-in.{" "}
      </>
    </TermItem>
    <TermItem
      title="FAIR"
      action={
        <a
          href="https://docs.desci.com/find-help/faq/fair"
          target="_blank"
          rel="noreferrer noopener"
        >
          <ButtonSecondary className="py-5 px-6">Learn more</ButtonSecondary>
        </a>
      }
    >
      <>
        Make your work findable, accessible, interoperable, and reusable by
        leveraging{" "}
        <a
          href="https://www.go-fair.org/fair-principles/"
          target="_blank"
          rel="noreferrer"
          className="text-tint-primary hover:text-tint-primary-hover"
        >
          FAIR
        </a>
        -enabling technology.
      </>
    </TermItem>
  </section>
);

function TermItem(
  props: PropsWithChildren<{ title: string; action: ReactElement }>
) {
  return (
    <div className="mb-16 md:mb-0 md:p-5 grid grid-cols-1 md:grid-cols-12 place-items-center place-content-start gap-4">
      <span className="text-2xl font-bold col-span-2 place-self-start md:place-self-center uppercase tracking-wider">
        {props.title}
      </span>
      <span className="block text-xl col-span-8 md:px-2 text-neutrals-gray-5">
        {props.children}
      </span>
      <div className="place-self-start col-span-2">{props.action}</div>
    </div>
  );
}

const IntroCards = () => (
  <>
    <div id="intro-cards" />
    <div className="container mx-auto max-w-4xl grid grid-cols-1 md:grid-cols-2 place-content-between mt-36 w-full gap-8">
      <IntroCard
        title="Elevate your research"
        caption="Use FAIR-enabling technology for your preprints and Green Open Access
        publications. Create verifiable research and interactive manuscripts
        with datasets, code and more."
        Icon={IconPlanet}
      />
      <IntroCard
        Icon={IconRepo}
        title="A new kind of repository"
        caption="The Nodes application is developed with an Open State repository for storing, accessing, and computing on FAIR digital objects. Make all your work securely open, citeable, and compute-enabled."
      />
      <IntroCard
        Icon={IconBlock}
        title="Help us improve scientific publishing"
        caption="We are developing novel publishing tools for scientists. Help us test them, your feedback means everything. "
      />
      <IntroCard
        Icon={IconDigitalKey}
        title="Stay in control of your work"
        caption="Your Node is yours. You are free to publish your work anywhere else that’s relevant to you. "
      />
    </div>
  </>
);

export const Banner = () => {
  const userData = useUser();

  const isLoggedIn = userData?.userId > 0;

  return (
    <section className="container mx-auto max-w-5xl flex flex-col gap-10 md:gap-0 md:flex-row items-center justify-between mt-24 md:mt-36 relative">
      <div className="flex flex-col items-start justify-start text-white gap-5">
        <h1 className="text-4xl md:text-6xl max-w-3xl !leading-tight">
          An experimental platform for next-generation scientific publishing
        </h1>
        <span className="text-2xl mb-2">
          Publish composable research objects stored open state
        </span>
        <NavLink
          to={
            isLoggedIn ? `${site.app}${app.nodes}` : `${site.web}${web.login}`
          }
        >
          <PrimaryButton className="px-8 py-4">
            <span className="text-[18px]">Test the Beta</span>
          </PrimaryButton>
        </NavLink>
      </div>
      <ArrowNarrowDownIcon
        color="#fff"
        width="100"
        strokeWidth={1}
        onClick={() => {
          const el = document.getElementById("intro-cards");
          el?.scrollIntoView({ behavior: "smooth" });
        }}
        className="md:absolute top-50 right-[-50px] will-change-transform animate-float cursor-pointer"
      />
    </section>
  );
};

function IntroCard(props: {
  title: string;
  caption: string;
  Icon: SvgIconProps;
}) {
  return (
    <div className="p-[1px]  border-neutrals-gray-3 border-2 bg-transparent from-[#00E3FF] to-[#0A697C] text-white rounded-md box-border group">
      <div className="px-12 py-12 text-white rounded-md box-border h-full w-full flex flex-col items-start justify-center">
        <div className="flex flex-col gap-1 items-start">
          <props.Icon width={35} className="mb-1" />
          <h2 className="text-2xl font-bold">{props.title}</h2>
          <span className="text-neutrals-gray-5 text-lg">{props.caption}</span>
        </div>
      </div>
    </div>
  );
}
