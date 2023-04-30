import { AppDispatch, RootState } from ".";
import { useDispatch, TypedUseSelectorHook, useSelector } from "react-redux";

export const useSetter = () => useDispatch<AppDispatch>();
export const useGetter: TypedUseSelectorHook<RootState> = useSelector;
