import { useEffect, useState } from "react";

export default function useDebouncer<T = number | string>(
  value: T,
  delay: number
): [T, boolean] {
  const [loading, setLoading] = useState(false);
  const [_value, _setValue] = useState<T>(value);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      _setValue(value);
      setLoading(false);
    }, delay);
    return () => {
      clearTimeout(timer);
      setLoading(false);
    };
  }, [value, delay]);

  return [_value, loading];
}
