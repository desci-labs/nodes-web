import { BetaLogo } from "./Header";
import { IconDiscord, IconGitbook, IconGithub, IconTwitter } from "@src/icons";
// import { NavLink } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-black w-full py-12 xs:px-0 px-10 lg:px-0">
      <div className="container mx-auto max-w-5xl grid md:grid-cols-2 place-content-center md:place-content-between text-white py-5">
        <section className="flex items-center my-2 flex-wrap order-1 md:order-0 gap-1 md:gap-4">
          <div className="mx-2 my-2">
            <BetaLogo
              className="w-16 h-16"
              textClassName="text-lg"
              width={55}
              height={55}
            />
          </div>
          <div className="flex flex-col items-start justify-around flex-wrap">
            <div className="flex items-center justify-center">
              <TextLink
                className="text-white inline-block m-2 font-bold"
                title="DeSci Labs"
                url="https://desci.com"
              />
              <TextLink
                className="text-white inline-block m-2 font-bold"
                title="Documentation"
                url="https://docs.desci.com/using-nodes/getting-started"
              />
              <TextLink
                className="text-white inline-block m-2 font-bold"
                title="FAQ"
                url="https://docs.desci.com/find-help/faq"
              />
            </div>
            <div className="flex items-center justify-center">
              {/**No NavLink here -- needs to scroll to top */}
              <a
                href="/terms"
                className="inline-block m-2 text-neutrals-gray-5 hover:text-neutrals-gray-4"
              >
                Terms of Service
              </a>
              <a
                href="/privacy"
                className="inline-block m-2 text-neutrals-gray-5 hover:text-neutrals-gray-4"
              >
                Privacy and Cookies
              </a>
            </div>
          </div>
        </section>
        <section className="place-self-center mb-12 md:mb-5 md:place-self-end flex order-0 md:order-1">
          <a
            href="https://github.com/desci-labs"
            target="_blank"
            rel="noreferrer"
            className="mx-2 dark:bg-tint-primary dark:hover:bg-tint-primary-hover p-1 w-[30px] h-[30px] rounded-full flex items-center justify-center"
          >
            <IconGithub color="black" width={30} />
          </a>
          <a
            href="https://docs.desci.com/"
            target="_blank"
            rel="noreferrer"
            className="mx-2 dark:bg-tint-primary dark:hover:bg-tint-primary-hover p-1 w-[30px] h-[30px] rounded-full flex items-center justify-center"
          >
            <IconGitbook color="black" width={30} />
          </a>
          <a
            href="https://discord.gg/BeJ4dxXdaJ"
            target="_blank"
            rel="noreferrer"
            className="mx-2 dark:bg-tint-primary dark:hover:bg-tint-primary-hover p-1 w-[30px] h-[30px] rounded-full flex items-center justify-center"
          >
            <IconDiscord color="black" width={30} />
          </a>
          <a
            href="https://twitter.com/DeSciLabs"
            target="_blank"
            rel="noreferrer"
            className="mx-2 dark:bg-tint-primary dark:hover:bg-tint-primary-hover p-1 w-[30px] h-[30px] rounded-full flex items-center justify-center"
          >
            <IconTwitter color="black" width={30} />
          </a>
        </section>
      </div>
    </footer>
  );
}

export const TextLink = (props: {
  title: string;
  className?: string;
  url?: string;
}) => (
  <a
    href={props?.url || "##"}
    target="_blank"
    rel="noreferrer"
    className={`text-md hover:underline ${props.className ?? ""} `}
  >
    {props.title}
  </a>
);
