import tw from "tailwind-styled-components";
const SectionHeader = tw.div`
flex
flex-row
space-between
items-center
border-neutral-300
dark:border-dark-gray
border-b
${(p) => p.className}
`;

export default SectionHeader;
