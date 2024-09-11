import { QueryKey, UseQueryOptions, UseQueryResult } from "./types";
import { useBaseQuery } from "./useBaseQuery";

export function useQuery<
  TError = Error,
  TData = unknown,
  TQueryKey extends QueryKey = QueryKey
>(options: UseQueryOptions<TData, TQueryKey>): UseQueryResult<TData, TError> {
  return useBaseQuery(options);
}
