import React from "react";

interface RadialLoaderProps {
  percent: number;
  background?: string;
}

const RadialLoader: React.FC<RadialLoaderProps> = ({
  percent,
  background = "white",
}) => {
  return (
    <div className="relative flex justify-center items-center w-[27px] h-[27px] transition-all">
      <div
        id="backCircle"
        className="w-[27px] h-[27px] rounded-full "
        style={{
          background: `conic-gradient(
                #272727 ${percent}%,
                #ababab ${percent}.5%  
              )`,
          clipPath: `circle(30% at 30% 30%);`,
        }}
      ></div>
      <div
        id="innerCircle"
        className={`bg-${background} min-w-[21.5px] min-h-[21.5px] absolute rounded-full `}
      ></div>
    </div>
  );
};

export default RadialLoader;
