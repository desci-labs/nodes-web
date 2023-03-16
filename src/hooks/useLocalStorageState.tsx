import {
  Dispatch,
  SetStateAction,
  useDebugValue,
  useEffect,
  useRef,
  useState,
} from "react";

/**
 *
 * @param {String} key The key to set in localStorage for this value
 * @param {Object} defaultValue The value to use if it is not already in localStorage
 */
export default function useLocalStorageState<TValue>(
  key: string,
  defaultValue: TValue
) {
  const [state, setState] = useState<TValue>(() => defaultValue);

  useDebugValue(`${key}: ${JSON.stringify(state)}`);

  const prevKeyRef = useRef(key);
  const countKeyRef = useRef(0);

  useEffect(() => {
    if (typeof window === undefined) return;

    const prevKey = prevKeyRef.current;
    if (prevKey !== key) {
      window.localStorage.removeItem(prevKey);
    }
    prevKeyRef.current = key;

    const valueInLocalStorage = window.localStorage.getItem(key);
    if (valueInLocalStorage) {
      setState(() => JSON.parse(valueInLocalStorage) as TValue);
    }
  }, [key]);

  useEffect(() => {
    if (countKeyRef.current > 0) {
      if (typeof window !== undefined) {
        window.localStorage.setItem(key, JSON.stringify(state));
      }
    }
    countKeyRef.current += 1;
  }, [key, state]);

  return [state, setState] as [TValue, Dispatch<SetStateAction<TValue>>];
}
