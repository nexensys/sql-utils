export const NUMERIC_TYPES = [
  "BIT",
  "TINYINT",
  "SMALLINT",
  "MEDIUMINT",
  "INT",
  "INTEGER",
  "BIGINT",
  "BOOL",
  "BOOLEAN",
  "DECIMAL",
  "DEC",
  "NUMERIC",
  "FIXED",
  "FLOAT",
  "DOUBLE",
  "REAL"
] as const;

export type NumericType = (typeof NUMERIC_TYPES)[number];

export const UNSIGNED_ZEROFILL = [
  "TINYINT",
  "SMALLINT",
  "MEDIUMINT",
  "INT",
  "INTEGER",
  "BIGINT",
  "DECIMAL",
  "DEC",
  "NUMERIC",
  "FIXED",
  "FLOAT"
] as const satisfies readonly NumericType[];

export type NumericTypesWithUnsignedAndZerofill = typeof UNSIGNED_ZEROFILL[number];

export interface Conversions extends Record<NumericType, any> {
  BIT: Buffer;
  TINYINT: number;
  BOOL: boolean;
  BOOLEAN: boolean;
  SMALLINT: number;
  MEDIUMINT: number;
  INT: number;
  INTEGER: number;
  BIGINT: bigint;
  DECIMAL: string;
  DEC: string;
  NUMERIC: number;
  FIXED: number;
  FLOAT: number;
}

export interface TypeParameters extends Record<NumericType, (string | number)[]> {
  BIT: [] | [M: number];
  TINYINT: [] | [M: number];
  BOOL: [];
  BOOLEAN: [];
  SMALLINT: [] | [M: number];
  MEDIUMINT: [] | [M: number];
  INT: [] | [M: number];
  INTEGER: [] | [M: number];
  BIGINT: [] | [M: number];
  DECIMAL: [] | [M: number] | [M: number, D: number];
  DEC: [] | [M: number] | [M: number, D: number];
  NUMERIC: [] | [M: number] | [M: number, D: number];
  FIXED: [] | [M: number] | [M: number, D: number];
  FLOAT: [] | [p: number] | [M: number, D: number];
}
