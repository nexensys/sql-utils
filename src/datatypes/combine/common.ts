import { DateType } from "../date";
import { DateColumn } from "./date";
import { NumericColumn, NumericTypeString } from "./numeric";
import { StringColumn, StringTypeString } from "./string";

export type AtLeastOneElement<T = any> = [T] | [T, ...T[]];

type ParametersList<P extends any[], First extends boolean = true> = P extends [
  infer T extends string | number,
  ...infer Rest
]
  ? `${First extends true ? "" : `,${"" | " "}`}${T extends string
      ? string
      : T}${ParametersList<Rest, false>}`
  : P extends [infer T extends string | number]
  ? `${First extends true ? "" : `,${"" | " "}`}${T extends string
      ? string
      : T}`
  : "";

type Parameters<P extends any[]> = `(${ParametersList<P>})`;

export type WithParameters<
  T extends string,
  P extends any[]
> = `${T}${P extends AtLeastOneElement ? Parameters<P> : ""}`;

export type ReferenceOption =
  | "restrict"
  | "cascade"
  | "set null"
  | "no action"
  | "set default";

export interface BaseColumn<N extends string, T extends string = string> {
  name: N;
  type: T;
  null?: boolean;
  key?: "primary" | "unique";
  comment?: string;
  invisible?: boolean;
  reference?: {
    table: string;
    keyParts: {
      expression: string;
      order?: "asc" | "desc";
    }[];
    match?: "full" | "partial" | "simple";
    onDelete?: ReferenceOption;
    onUpdate?: ReferenceOption;
  };
  check?: {
    symbol?: string;
    expression: string;
    enforced?: boolean;
  };
  collate?: string;
  default?: any;
}

export interface GeneratedColumn<N extends string, T extends string = string>
  extends BaseColumn<N, T> {
  generateAlways: {
    expression: string;
    stored?: boolean;
  };
}

export interface StaticColumn<N extends string, T extends string = string>
  extends BaseColumn<N, T> {
  default?: any;
  autoIncrement?: boolean;
  format?: "fixed" | "dynamic" | "default";
  engineAttribute?: string;
  secondaryEngineAttribute?: string;
  storage?: "disk" | "memory";
}

export type Column<N extends string, T extends string = string> =
  | GeneratedColumn<N, T>
  | StaticColumn<N, T>;

export type TypedColumn<
  N extends string,
  T extends string
> = T extends NumericTypeString
  ? NumericColumn<N, T>
  : T extends DateType
  ? DateColumn<N, T>
  : T extends StringTypeString
  ? StringColumn<N, T>
  : Column<string, "JSON"> | Column<string, string>;
