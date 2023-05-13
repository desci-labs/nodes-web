import tw from "tailwind-styled-components";

const ButtonSecondary = tw.button`
 select-none
 transition-colors
 rounded-lg
 py-1
 px-4
 font-bold
 flex
 gap-1
 h-9
 justify-center
 items-center
 group
 ${(p) =>
   p.disabled
     ? `bg-[#525659] text-[#C3C3C3] cursor-not-allowed`
     : `border-tint-primary border-[1px] text-white hover:text-black font-bold text-sm hover:bg-tint-primary cursor-pointer`}
 ${(p) => p.className}`;

export default ButtonSecondary;
