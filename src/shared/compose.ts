export function compose<T, B = T>(...fns: any[]): (input: T) => T {
  return <B>(arg: any) => fns.reduce((a, f) => f(a), arg) as any as T;
}
