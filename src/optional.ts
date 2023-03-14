export type Optional<T> =
  | {
      isPresent: false;
    }
  | {
      isPresent: true;
      value: T;
    };

export function empty<T>(): Optional<T> {
  return {
    isPresent: false,
  };
}