import { Table } from "../schema/Table";
import { Connection, RowDataPacket } from "mysql2/promise";
import { generateColumnDefinition } from "./assemble-column";
import { TableColumn } from "../datatypes";

namespace InformationSchema {
  interface Base extends RowDataPacket {
    TABLE_SCHEMA: string;
    TABLE_NAME: string;
  }

  export interface Tables extends Base {
    TABLE_TYPE: "BASE TABLE" | "VIEW" | "SYSTEM VIEW";
    TABLE_COLLATION: string;
    TABLE_COMMENT: string;
    CHECKSUM: 0 | 1;
  }

  export interface Partitions extends Base {
    PARTITION_NAME: string;
    SUBPARTITION_NAME: string;
    PARTITION_ORDINAL_POSITION: number;
    SUBPARTITION_ORDINAL_POSITION: number;
    PARTITION_METHOD: string;
    SUBPARTITION_METHOD: string;
    PARTITION_EXPRESSION: string;
    SUBPARTITION_EXPRESSION: string;
    PARTITION_COMMENT: string;
  }

  export interface Column extends Base {
    COLUMN_NAME: string;
    ORDINAL_POSITION: number;
    COLUMN_DEFAULT: string;
    IS_NULLABLE: boolean;
    DATA_TYPE: string;
    CHARACTER_MAXIMUM_LENGTH: number | null;
    NUMERIC_PRECISION: null | number;
    NUMERIC_SCALE: null | number;
    DATETIME_PRECISION: null | number;
    CHARACTER_SET_NAME: null | string;
    COLLATION_NAME: null | string;
    COLUMN_TYPE: string;
    COLUMN_KEY: string;
    EXTRA: string;
    COLUMN_COMMENT: string;
    GENERATION_EXPRESSION: string;
  }

  export interface Constraints extends Base {
    CONSTRAINT_NAME: string;
    CONSTRAINT_TYPE: string;
    COLUMN_NAME: string;
  }
}

export async function setupTable(
  t: Table<TableColumn<any, any>[]>,
  conn: Connection
) {
  const [tables] = await conn.query<InformationSchema.Tables[]>(
    /* sql */ `SELECT TABLE_TYPE, TABLE_COLLATION, TABLE_COMMENT, CHECKSUM FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
    [t._schema, t.name]
  );

  if (tables.length > 0) {
    const [columns] = await conn.query<InformationSchema.Column[]>(
      /* sql */ `SELECT
        COLUMN_NAME,
        ORDINAL_POSITION,
        COLUMN_DEFAULT,
        IS_NULLABLE,
        DATA_TYPE,
        CHARACTER_MAXIMUM_LENGTH,
        NUMERIC_PRECISION,
        NUMERIC_SCALE,
        DATETIME_PRECISION,
        CHARACTER_SET_NAME,
        COLLATION_NAME,
        COLUMN_TYPE,
        COLUMN_KEY,
        EXTRA,
        COLUMN_COMMENT,
        GENERATION_EXPRESSION
      FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
      [t._schema, t.name]
    );

    const columnsToCheck = new Set(
      columns.map((c) => c.COLUMN_NAME).concat(t.columns.map((c) => c.name))
    );

    for (const column of columnsToCheck) {
      const existingDef = columns.find((c) => c.COLUMN_NAME === column);
      const colIdx = t.columns.findIndex((c) => c.name === column);
      const colDef = t.columns[colIdx];
      if (!existingDef) {
        await conn.query(
          /* sql */ `ALTER TABLE ${
            t.name
          } ADD COLUMN ${generateColumnDefinition(colDef)} ${
            colIdx > 0 ? `AFTER ${t.columns[colIdx - 1].name}` : "FIRST"
          }`
        );
      } else if (colIdx < 0) {
        await conn.query(
          /* sql */ `ALTER TABLE ${t.name} DROP COLUMN ${existingDef.COLUMN_NAME}`
        );
      } else {
        if (existingDef.COLUMN_KEY === "PRI")
          await conn.query(/* sql */ `ALTER TABLE ${t.name} DROP PRIMARY KEY`);
        await conn.query(
          /* sql */ `ALTER TABLE ${
            t.name
          } MODIFY COLUMN ${generateColumnDefinition(colDef)} ${
            colIdx > 0 ? `AFTER ${t.columns[colIdx - 1].name}` : "FIRST"
          }${
            colDef.default !== existingDef.COLUMN_DEFAULT
              ? typeof colDef.default` ALTER COLUMN ${colDef.name} SET DEFAULT ${colDef.default}`
              : ""
          }`
        );
      }
    }
  } else {
    await conn.query(
      /* sql */ `CREATE${t.options.temporary ? " TEMPORARY" : ""} TABLE ${
        t.name
      } (${t.columns
        .map(generateColumnDefinition)
        .join(", ")}) AUTO_INCREMENT ${t.options.autoIncrement ?? 1}${
        t.options.collate
          ? `${
              typeof t.options.collate === "object"
                ? t.options.collate.default
                  ? " DEFAULT"
                  : ""
                : ""
            } COLLATE ${
              typeof t.options.collate === "string"
                ? t.options.collate
                : t.options.collate.value
            }`
          : ""
      }${
        t.options.charset
          ? `${
              typeof t.options.charset === "object"
                ? t.options.charset.default
                  ? " DEFAULT"
                  : ""
                : ""
            } CHARSET ${
              typeof t.options.charset === "string"
                ? t.options.charset
                : t.options.charset.value
            }`
          : ""
      }${
        typeof t.options.checksum === "number"
          ? ` CHECKSUM ${t.options.checksum}`
          : ""
      }${
        t.options.comment ? ` COMMENT ${JSON.stringify(t.options.comment)}` : ""
      }${
        t.options.partition
          ? ` PARTITION BY ${t.options.partition.by}${
              typeof t.options.partition.count === "number"
                ? ` PARTITIONS ${t.options.partition.count}`
                : ""
            }${
              t.options.partition.subPartition
                ? ` SUBPARTITION BY ${t.options.partition.subPartition.by}${
                    typeof t.options.partition.subPartition.count === "number"
                      ? ` SUBPARTITIONS ${t.options.partition.subPartition.count}`
                      : ""
                  }`
                : ""
            }${
              t.options.partition.definitions
                ? ` ${t.options.partition.definitions
                    .map(
                      (def) =>
                        `PARTITION ${def.name}${
                          def.values
                            ? ` VALUES ${
                                "lessThan" in def.values
                                  ? `LESS THAN ${def.values}`
                                  : `IN $${def.values.in.join(", ")}`
                              }`
                            : ""
                        }${
                          def.comment
                            ? ` COMMENT ${JSON.stringify(def.comment)}`
                            : ""
                        }${
                          def.subPartitions
                            ? ` ${def.subPartitions
                                .map(
                                  (sub) =>
                                    `SUBPARTITION ${sub.name}${
                                      sub.comment
                                        ? ` COMMENT ${JSON.stringify(
                                            sub.comment
                                          )}`
                                        : ""
                                    }`
                                )
                                .join(", ")}`
                            : ""
                        }`
                    )
                    .join(", ")}`
                : ""
            }`
          : ""
      }`
    );
  }
}
