export const DATE_TYPES = [
  "DATE",
  "TIME",
  "DATETIME",
  "TIMESTAMP",
  "YEAR",
] as const;

export type DateType = (typeof DATE_TYPES)[number];

export interface Conversions extends Record<DateType, any> {
  DATE: Date;
  TIME: string;
  DATETIME: Date;
  TIMESTAMP: Date;
  YEAR: number;
}
