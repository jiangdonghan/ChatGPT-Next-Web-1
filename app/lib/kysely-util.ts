import { Generated, ColumnType } from "kysely";
import { createKysely } from "@vercel/postgres-kysely";

export interface UserTable {
  id: Generated<number>;
  accessCode: string;
  name: string | undefined;
  sourceId: string | undefined;
  source: string | undefined;
  usageType: number;
  countLeft: number;
  createdAt: ColumnType<Date, string | undefined, never>;
  expiredAt: ColumnType<Date, string | undefined, never>;
}

// Keys of this interface are table names.
export interface Database {
  users: any;
}

export const db = createKysely<Database>();
export { sql } from "kysely";
