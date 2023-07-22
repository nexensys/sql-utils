import { Connection } from "mysql2/promise";
import { TableColumn } from "../datatypes";
import { setupTable } from "../configure/setup-table";

export class Table<C extends readonly TableColumn<any, any>[]> {
  public _schema: string = "";
  constructor(
    public name: string,
    public columns: C,
    public options: {
      temporary?: boolean;
      autoIncrement?: number;
      collate?:
        | string
        | {
            value: string;
            default: boolean;
          };
      charset?:
        | string
        | {
            value: string;
            default: boolean;
          };
      checksum?: 0 | 1;
      comment?: string;
      partition?: {
        by: string;
        count?: number;
        subPartition?: {
          by: string;
          count?: number;
        };
        definitions?: {
          name: string;
          values?:
            | {
                lessThan: string | "MAXVALUE";
              }
            | { in: string[] };
          comment?: string;
          subPartitions?: {
            name: string;
            comment?: string;
          }[];
        }[];
      };
    }
  ) {}

  async ensure(conn: Connection) {
    await setupTable(this as any, conn);
  }
}
