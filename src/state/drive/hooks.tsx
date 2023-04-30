import { useGetter } from "@src/store/accessors";
import { DriveState } from "./driveSlice";

export const useDrive = (): DriveState => {
  const driveState = useGetter((state) => state.drive);
  return driveState;
};
