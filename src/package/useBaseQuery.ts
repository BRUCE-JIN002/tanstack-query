import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { QueryObserver } from "./queryObserver";
import { useQueryClient } from "./QueryClientProvider";
import { QueryKey, UseBaseQueryOptions, UseBaseQueryResult } from "./types";

export function useBaseQuery<
  TError = Error,
  TData = unknown,
  TQueryKey extends QueryKey = QueryKey
>(
  optoins: UseBaseQueryOptions<TData, TQueryKey>
): UseBaseQueryResult<TData, TError> {
  // 通过 hook 拿到 `QueryClient` 实例
  const client = useQueryClient();

  const [observer] = useState(
    () => new QueryObserver<TError, TData, TQueryKey>(client, optoins)
  );

  // 获取查询结果
  const result = observer.getOptimisticResult(optoins);

  useSyncExternalStore(
    useCallback(
      (onStoreChange) => {
        // 订阅，为了当状态更新时通知组件重新渲染
        const unsubscribe = observer.subscribe(onStoreChange);
        return unsubscribe;
      },
      [observer]
    ),
    () => observer.getCurrentResult(),
    () => observer.getCurrentResult()
  );

  useEffect(() => {
    observer.setOptions(optoins);
  }, [observer, optoins]);

  return result;
}
