import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

const SkeletonOrcid = (props: any) => (
  <SkeletonTheme baseColor="transparent" highlightColor="#CCC">
    <Skeleton
      containerClassName="w-10"
      className="rounded-none"
      duration={0.8}
    />
  </SkeletonTheme>
);

export default SkeletonOrcid;
