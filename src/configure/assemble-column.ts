import {
  Column,
  ReferenceOption,
  TypedColumn,
} from "../datatypes/combine/common";
import { DateColumn } from "../datatypes/combine/date";
import {
  NumericColumn,
  NumericTypeString,
  UnsignedZerofillTypes,
} from "../datatypes/combine/numeric";
import {
  CharsetCollateTypes,
  StringColumn,
  StringTypeString,
} from "../datatypes/combine/string";
import { DATE_TYPES, DateType } from "../datatypes/date";
import { NUMERIC_TYPES, UNSIGNED_ZEROFILL } from "../datatypes/numeric";
import { CHARSET_COLLATE, STRING_TYPES } from "../datatypes/string";

const referenceOptionToSql = (opt: ReferenceOption) =>
  opt === "restrict"
    ? "RESTRICT"
    : opt === "cascade"
    ? "CASCADE"
    : opt === "set null"
    ? "SET NULL"
    : opt === "no action"
    ? "NO ACTION"
    : "SET DEFAULT";

const stripParams = (c: TypedColumn<any, string>): string => {
  const parenIndex = c.type.indexOf("(");
  return c.type.slice(0, parenIndex > -1 ? undefined : parenIndex);
};

const isNumeric = (
  c: TypedColumn<any, string>
): c is NumericColumn<any, NumericTypeString> => {
  return NUMERIC_TYPES.includes(stripParams(c).toUpperCase() as any);
};

const isString = (
  c: TypedColumn<any, string>
): c is StringColumn<any, StringTypeString> => {
  return STRING_TYPES.includes(stripParams(c).toUpperCase() as any);
};

const hasUnsignedZerofill = (
  c: NumericColumn<any, NumericTypeString>
): c is NumericColumn<any, UnsignedZerofillTypes> => {
  return UNSIGNED_ZEROFILL.includes(stripParams(c).toUpperCase() as any);
};

const hasCharsetCollate = (
  c: StringColumn<any, StringTypeString>
): c is StringColumn<any, CharsetCollateTypes> => {
  return CHARSET_COLLATE.includes(stripParams(c).toUpperCase() as any);
};

const assembleTypeString = (c: TypedColumn<any, string>) => {
  if (isNumeric(c)) {
    return `${c.type}${
      hasUnsignedZerofill(c)
        ? `${c.unsigned ? " UNSIGNED" : ""}${c.zerofill ? " ZEROFILL" : ""}`
        : ""
    }`;
  } else if (isString(c)) {
    return `${c.type}${
      hasCharsetCollate(c)
        ? `${c.characterSet ? ` CHARACTER SET ${c.characterSet}` : ""}${
            c.collate ? ` COLLATE ${c.collate}` : ""
          }`
        : ""
    }`;
  }

  return c.type;
};

export function generateColumnDefinition(c: TypedColumn<string, any>) {
  let definition = /* sql */ `${assembleTypeString(c)} ${c.type} ${
    typeof c.default !== "undefined" ? ` DEFAULT ${c.default}` : ""
  }`;
  // For now we jut gonna assume that the syntax is correct. no checks.
  if ("generateAlways" in c) {
    definition += /* sql */ `${
      c.collate ? ` COLLATE ${c.collate}` : ""
    } GENERATED ALWAYS AS (${c.generateAlways.expression}) ${
      c.generateAlways.stored ? "STORED" : "VIRTUAL"
    } ${c.null ?? true ? "NULL" : "NOT NULL"} ${
      c.invisible ? "INVISIBLE" : "VISIBLE"
    }${c.key ? (c.key === "primary" ? " PRIMARY KEY" : " UNIQUE KEY") : ""}${
      c.comment ? ` COMMENT ${JSON.stringify(c.comment)}` : ""
    }`;
  } else {
    definition += /* sql */ ` ${c.null ?? true ? "NULL" : "NOT NULL"}${
      c.default ? `DEFAULT ${String(c.default)}` : ""
    } ${c.invisible ? "INVISIBLE" : "VISIBLE"}${
      c.autoIncrement ? " AUTO_INCREMENT" : ""
    }${c.key ? (c.key === "primary" ? " PRIMARY KEY" : " UNIQUE KEY") : ""}${
      c.comment
        ? ` COMMENT ${JSON.stringify(c.comment)}${
            c.collate ? ` COLLATE ${c.collate}` : ""
          }`
        : ""
    }${c.collate ? ` COLLATE ${c.collate}` : ""} COLUMN_FORMAT ${
      c.format === "fixed"
        ? "FIXED"
        : c.format === "dynamic"
        ? "DYNAMIC"
        : "DEFAULT"
    }${
      c.engineAttribute
        ? ` ENGINE_ATTRIBUTE ${JSON.stringify(c.engineAttribute)}`
        : ""
    }${
      c.secondaryEngineAttribute
        ? ` SECONDARY_ENGINE_ATTRIBUTE ${JSON.stringify(
            c.secondaryEngineAttribute
          )}`
        : ""
    }${c.storage ? (c.storage === "disk" ? " DISK" : " MEMORY") : ""}`;
  }

  definition += /* sql */ `${
    c.reference
      ? `REFERENCES ${c.reference.table} (${c.reference.keyParts
          .map(
            (k) =>
              `${k.expression}${
                k.order ? (k.order === "asc" ? "ASC" : "DESC") : ""
              }`
          )
          .join(", ")})${
          c.reference.match
            ? ` MATCH ${
                c.reference.match === "full"
                  ? "FULL"
                  : c.reference.match === "partial"
                  ? "PARTIAL"
                  : "SIMPLE"
              }`
            : ""
        }${
          c.reference.onDelete
            ? ` ON DELETE ${referenceOptionToSql(c.reference.onDelete)}`
            : ""
        }${
          c.reference.onUpdate
            ? ` ON UPDATE ${referenceOptionToSql(c.reference.onUpdate)}`
            : ""
        }`
      : ""
  }${
    c.check
      ? `${c.check.symbol ? "CONSTRAINT ${c.check.symbol}" : ""} CHECK (${
          c.check.expression
        }) ${c.check.enforced ? "" : "NOT"} ENFORCED`
      : ""
  }`;

  return definition;
}
