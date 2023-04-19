import { useGetter } from "@src/store/accessors";

export const useDrive = () => {
  const driveState = useGetter((state) => state.drive);
  return driveState;
};
