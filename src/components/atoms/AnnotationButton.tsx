import { IconAddComment } from "@icons";

const AnnotationButton = () => (
  <div className="p-3 rounded-2xl bg-black group-hover:bg-zinc-900 transition-all ease duration-300">
    <IconAddComment
      height={24}
      width={24}
      fill="#28AAC4"
      className={`group-hover:fill-[#94d0d6] transition ease duration-300`}
    />
  </div>
);

export default AnnotationButton;
