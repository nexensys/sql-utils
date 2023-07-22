import {
  NumericType,
  NumericTypesWithUnsignedAndZerofill,
  TypeParameters,
  Conversions,
} from "../numeric";
import { Column, WithParameters } from "./common";

type TypesWithParameters = {
  [k in NumericType]: WithParameters<k, TypeParameters[k]>;
};

export type NumericTypeString = TypesWithParameters[NumericType];

export type UnsignedZerofillTypes =
  TypesWithParameters[NumericTypesWithUnsignedAndZerofill];

type BaseType<T extends TypesWithParameters[NumericType]> = {
  [k in keyof TypesWithParameters]: T extends TypesWithParameters[k]
    ? k
    : never;
}[keyof TypesWithParameters];

export type NumericColumn<
  N extends string,
  T extends NumericTypeString
> = Column<N, string> & {
  type: T;
} & (BaseType<T> extends NumericTypesWithUnsignedAndZerofill
    ? {
        unsigned?: boolean;
        zerofill?: boolean;
      }
    : {});

export type NumericColumnType<C extends NumericColumn<any, any>> =
  C extends NumericColumn<any, infer T extends TypesWithParameters[NumericType]>
    ? Conversions[BaseType<T>]
    : any;
