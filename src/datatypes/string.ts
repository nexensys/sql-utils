import { AtLeastOneElement } from "./combine/common";

export const STRING_TYPES = [
  "CHAR",
  "VARCHAR",
  "BINARY",
  "VARBINARY",
  "TINYBLOB",
  "TINYTEXT",
  "BLOB",
  "TEXT",
  "MEDIUMBLOB",
  "MEDIUMTEXT",
  "LONGBLOB",
  "LONGTEXT",
  "ENUM",
  "SET",
] as const;

export type StringType = (typeof STRING_TYPES)[number];

export const CHARSET_COLLATE = [
  "CHAR",
  "VARCHAR",
  "TINYTEXT",
  "TEXT",
  "MEDIUMTEXT",
  "LONGTEXT",
  "ENUM",
  "SET",
] as const satisfies readonly StringType[];

export type StringTypesWithCharsetAndCollate = (typeof CHARSET_COLLATE)[number];

export interface Conversions extends Record<StringType, any> {
  CHAR: string;
  VARCHAR: string;
  BINARY: Buffer;
  VARBINARY: Buffer;
  TINYBLOB: Buffer;
  TINYTEXT: string;
  BLOB: Buffer;
  TEXT: string;
  MEDIUMBLOB: Buffer;
  MEDIUMTEXT: string;
  LONGBLOB: Buffer;
  LONGTEXT: string;
  ENUM: string;
  SET: string;
}

export interface TypeParameters extends Record<StringType, (string | number)[]> {
  CHAR: [] | [M: number];
  VARCHAR: [M: number];
  BINARY: [] | [M: number];
  VARBINARY: [M: number];
  TINYBLOB: [];
  TINYTEXT: [];
  BLOB: [] | [M: number];
  TEXT: [] | [M: number];
  MEDIUMBLOB: [];
  MEDIUMTEXT: [];
  LONGBLOB: [];
  LONGTEXT: [];
  ENUM: AtLeastOneElement<string>;
  SET: AtLeastOneElement<string>;
}