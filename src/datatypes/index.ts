import { Column, TypedColumn } from "./combine/common";
import { DateColumn, DateColumnType } from "./combine/date";
import { NumericColumn, NumericColumnType } from "./combine/numeric";
import { StringColumn, StringColumnType } from "./combine/string";

export type TableColumn<N extends string, T extends string> = TypedColumn<N, T>;

export type ColumnType<C extends Column<string, string>> =
  C extends NumericColumn<string, any>
    ? NumericColumnType<C>
    : C extends DateColumn<string, any>
    ? DateColumnType<C>
    : C extends StringColumn<string, any>
    ? StringColumnType<C>
    : any;
