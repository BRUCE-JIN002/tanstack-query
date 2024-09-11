import { sleep } from "./utils";

interface RetryerConfig<TData = unknown, TError = Error> {
  fn: () => TData | Promise<TData>; // 请求函数
  onError?: (error: TError) => void; // 请求失败后的回调
  onSuccess?: (data: TData) => void; // 请求成功的回调
  retry?: number; // 重试次数
  retryDelay?: number; // 重试延迟间隔函数
  abort: () => void;
}

export interface Retryer<TData = unknown> {
  promise: Promise<TData>;
  cancel: () => void;
}

// 默认的请求重试延迟间隔函数
function defaultRetryDelay(failureCount: number) {
  return Math.min(1000 * 2 ** failureCount, 1000 * 30);
}

export function createRetryer<TData = unknown, TError = Error>(
  config: RetryerConfig<TData, TError>
): Retryer<TData> {
  // 记录请求失败次数
  let failureCount = 0;

  let promiseResolve: (data: TData) => void;
  let promiseReject: (error: TError) => void;

  const promise = new Promise<TData>((outerResolve, outerReject) => {
    promiseResolve = outerResolve;
    promiseReject = outerReject;
  });

  const resolve = (value: any) => {
    config.onSuccess?.(value);
    promiseResolve(value);
  };

  const reject = (error: any) => {
    config.onError?.(error);
    promiseReject(error);
  };

  const cancel = () => {
    config.abort();
  };

  const run = () => {
    let promiseOrValue: any;
    try {
      // 执行异步请求
      promiseOrValue = config.fn();
    } catch (error) {
      promiseOrValue = Promise.reject(error);
    }

    Promise.resolve(promiseOrValue)
      .then(resolve)
      .catch((error) => {
        // 默认重试次数
        const retry = config?.retry ?? 3;
        // 默认在出错后重试间隔
        const delay = config?.retryDelay ?? defaultRetryDelay(failureCount);
        const shouldRetry = failureCount < retry;
        if (!shouldRetry) {
          reject(error); // 如果请求失败，则调用reject
          return;
        }
        // 增加失败次数
        failureCount++;
        sleep(delay).then(() => {
          run(); // 递归调用run函数，实现重试
        });
      });
  };

  run();

  return {
    promise,
    cancel
  };
}
