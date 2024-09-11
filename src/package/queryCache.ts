import { QueryKey } from "./types";
import { Query } from "./query";

function isObject(val: unknown): boolean {
  return val !== null && typeof val === "object";
}

export function hashKey(queryKey: QueryKey): string {
  return JSON.stringify(queryKey, (_, val) => {
    if (isObject(val)) {
      return Object.keys(val)
        .sort()
        .reduce((result, key) => {
          result[key] = val[key];
          return result;
        }, {} as Record<string, unknown>);
    }
    return val;
  });
}

export class QueryCache {
  #queries: Map<string, Query>;

  constructor() {
    this.#queries = new Map<string, Query>();
  }

  has(queryKey: Array<unknown>): boolean {
    return Array.from(this.#queries.keys()).some(
      (queryHash) => queryHash === hashKey(queryKey)
    );
  }

  get(queryHash: string) {
    return this.#queries.get(queryHash);
  }

  add(query: Query) {
    if (!this.#queries.has(query.queryHash)) {
      this.#queries.set(query.queryHash, query);
    }
  }

  remove(query: Query<any, any, any>): void {
    const queryInMap = this.#queries.get(query.queryHash);
    if (queryInMap) {
      if (queryInMap === query) {
        this.#queries.delete(query.queryHash);
      }
    }
  }

  // 构建 `Query` 实例
  build(options: any) {
    const queryKey = options.queryKey;
    const queryHash = hashKey(queryKey);
    let query = this.get(queryHash);
    if (!query) {
      query = new Query({
        queryKey,
        queryHash,
        options,
        cache: this
      });
      this.add(query);
    }
    return query;
  }

  // 获取全部 `Query` 实例
  getAll(): Array<Query> {
    return [...this.#queries.values()];
  }

  clear() {
    this.getAll().forEach((query) => {
      this.remove(query);
    });
  }
}
