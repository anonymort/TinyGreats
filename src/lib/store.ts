export type Subscriber<T> = (value: T) => void;
export type Unsubscriber = () => void;

export class Store<T> {
  private value: T;
  private listeners = new Set<Subscriber<T>>();

  constructor(initial: T) {
    this.value = initial;
  }

  get(): T {
    return this.value;
  }

  set(newValue: T): void {
    if (this.value === newValue) return;
    this.value = newValue;
    this.notify();
  }

  update(updater: (current: T) => T): void {
    this.set(updater(this.value));
  }

  subscribe(fn: Subscriber<T>): Unsubscriber {
    this.listeners.add(fn);
    fn(this.value); // Immediately call with current value
    return () => this.listeners.delete(fn);
  }

  private notify(): void {
    this.listeners.forEach(fn => fn(this.value));
  }
}

// Create a derived store that depends on other stores
export function derived<T>(
  stores: Store<any> | Store<any>[],
  fn: (values: any) => T,
  initialValue?: T
): Store<T> {
  const storeArray = Array.isArray(stores) ? stores : [stores];
  const derivedStore = new Store<T>(initialValue as T);

  const update = () => {
    const values = storeArray.map(s => s.get());
    const newValue = fn(Array.isArray(stores) ? values : values[0]);
    derivedStore.set(newValue);
  };

  storeArray.forEach(store => store.subscribe(update));
  update(); // Initial computation

  return derivedStore;
}
