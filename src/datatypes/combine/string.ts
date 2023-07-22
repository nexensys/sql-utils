import {
  StringType,
  StringTypesWithCharsetAndCollate,
  TypeParameters,
  Conversions,
} from "../string";
import { Column, WithParameters } from "./common";

type TypesWithParameters = {
  [k in StringType]: WithParameters<k, TypeParameters[k]>;
};

export type StringTypeString = TypesWithParameters[StringType];

export type CharsetCollateTypes = TypesWithParameters[StringTypesWithCharsetAndCollate];

type BaseType<T extends TypesWithParameters[StringType]> = {
  [k in keyof TypesWithParameters]: T extends TypesWithParameters[k]
    ? k
    : never;
}[keyof TypesWithParameters];

export type StringColumn<N extends string, T extends StringTypeString> = Column<
  N,
  string
> & {
  type: T;
} & (BaseType<T> extends StringTypesWithCharsetAndCollate
    ? {
        characterSet?: string;
        collate?: string;
      }
    : {});

export type StringColumnType<C extends StringColumn<string, any>> =
  C extends StringColumn<any, infer T extends TypesWithParameters[StringType]>
    ? Conversions[BaseType<T>]
    : any;
