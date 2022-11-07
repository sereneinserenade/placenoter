export const stopPrevent = <T extends unknown>(e: T): T => {
  (e as Event).stopPropagation?.();
  (e as Event).preventDefault?.();

  return e
}
