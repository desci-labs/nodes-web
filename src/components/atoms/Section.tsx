import tw from "tailwind-styled-components";

const Section = tw.div`
    border-[1px]
    bg-white
    border-zinc-400
    dark:border-muted-900
    dark:bg-muted-500
    rounded-lg
    w-full
    overflow-hidden
    ${(p) => p.className}
  `;

export default Section;
