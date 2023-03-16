import styled, { StyledComponent } from "styled-components";

export const TimelineGutter = styled.div.attrs({
  className: `flex w-10 flex-col items-center -ml-2`,
})``;

export const TimelineGutterBulletLayer = styled(TimelineGutter)`
  position: absolute;
  right: 100%;
  top: 0;
  bottom: 0;
`;
export const TimelineBullet: StyledComponent<
  "div",
  any,
  any
> = styled.div.attrs(({ selected }: any) => ({
  className: `rounded-full bg-black dark:bg-zinc-300 mt-4 flex justify-center items-center ${
    selected ? "h-5 w-5" : "h-2 w-2"
  }`,
}))``;
export const DateText = styled.p.attrs({
  className: "text-sm font-bold",
})``;
