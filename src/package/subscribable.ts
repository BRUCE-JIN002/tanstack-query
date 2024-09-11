type Listenter = () => void;

export class Subscribable<TListenter extends Function = Listenter> {
  protected listeners: Set<TListenter>;

  constructor() {
    this.listeners = new Set();
  }

  // 进行订阅，这里传入的`listener`就是触发组件重新re-render的函数

  subscribe(listener: TListenter): () => void {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  hasListeners(): boolean {
    return this.listeners.size > 0;
  }

  protected onSubscribe(): void {
    // 空函数，作用就是避免在子类中未实现该函数导致报错
  }

  protected onUnsubscribe(): void {
    // 空函数，作用就是避免在子类中未实现该函数导致报错
  }
}
