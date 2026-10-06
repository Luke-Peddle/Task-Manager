export const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export const toDate = (value?: string | null) => (value ? new Date(value) : null);

export const ifProvided = <T, R>(value: T | undefined, map: (value: T) => R) =>
  value === undefined ? undefined : map(value);