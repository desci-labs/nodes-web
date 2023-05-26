// @ts-ignore
import IdenticonComponent from "react-identicons";

interface IdenticonProps {
  string: any;
  size?: number;
  className?: string;
}

const Identicon = (props: IdenticonProps) => {
  const { string, size = 26 } = props;
  return (
    <span
      style={{ minWidth: 21, width: size }}
      className={`cursor-pointer fill-black stroke-black rounded-full overflow-hidden border dark:border-white dark:bg-black border-black ${props.className}`}
    >
      <IdenticonComponent
        size={size}
        string={string}
        padding={0.5}
        bg="white"
      />
    </span>
  );
};

export default Identicon;
