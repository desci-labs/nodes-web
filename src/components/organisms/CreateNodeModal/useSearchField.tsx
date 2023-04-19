import { getResearchFields } from "@src/api";
import { ResearchFields } from "@src/types/client";
import useSWR from "swr";

export default function useSearchField(query?: string) {
  // Todo: convert to use redux-query
  const { data, isValidating } = useSWR<{ data: ResearchFields[] }>(
    query,
    getResearchFields,
    { shouldRetryOnError: false }
  );
  return { data: data?.data ?? [], isFetching: isValidating };
}
