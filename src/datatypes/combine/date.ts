import { DateType, Conversions } from "../date";
import { Column } from "./common";

export type DateColumn<N extends string, T extends DateType> = Column<
  N,
  string
> & {
  type: T;
};

export type DateColumnType<C extends DateColumn<string, DateType>> =
  C extends DateColumn<any, infer T extends DateType> ? Conversions[T] : any;
