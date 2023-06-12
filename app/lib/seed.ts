import { db, sql } from "./kysely-util";

// usageType 1 means count by api counts, usageType 2 means count by membership expire time
export async function seed() {
  const createTable = await db.schema
    .createTable("users")
    .ifNotExists()
    .addColumn("id", "serial", (cb) => cb.primaryKey())
    .addColumn("accessCode", "varchar(255)", (cb) => cb.unique().notNull())
    .addColumn("name", "varchar(255)")
    .addColumn("sourceId", "varchar(255)", (cb) =>
      cb.notNull().defaultTo("default sourceId"),
    )
    .addColumn("source", "varchar(255)", (cb) =>
      cb.notNull().defaultTo("wechat"),
    )
    .addColumn("usageType", "integer", (cb) => cb.notNull().defaultTo(1))
    .addColumn("countLeft", "integer", (cb) => cb.notNull().defaultTo(1))
    .addColumn("createdAt", sql`timestamp with time zone`, (cb) =>
      cb.defaultTo(sql`current_timestamp`),
    )
    .addColumn("expiredAt", "timestamp")
    .execute();

  console.log(`Created "users" table`);

  const users = [
    {
      accessCode: "923401",
      name: "User 1",
      sourceId: "default sourceId",
      source: "wechat",
      usageType: 1,
      countLeft: 1,
      expiredAt: new Date(Date.now() + 86400000),
    },
    {
      accessCode: "458903",
      name: "User 2",
      sourceId: "default sourceId",
      source: "wechat",
      usageType: 1,
      countLeft: 1,
      expiredAt: new Date(Date.now() + 86400000),
    },
    {
      accessCode: "701352",
      name: "User 3",
      sourceId: "default sourceId",
      source: "wechat",
      usageType: 1,
      countLeft: 1,
      expiredAt: new Date(Date.now() + 86400000),
    },
    {
      accessCode: "125790",
      name: "User 4",
      sourceId: "default sourceId",
      source: "wechat",
      usageType: 1,
      countLeft: 1,
      expiredAt: new Date(Date.now() + 86400000),
    },
    {
      accessCode: "869031",
      name: "User 5",
      sourceId: "default sourceId",
      source: "wechat",
      usageType: 1,
      countLeft: 1,
      expiredAt: new Date(Date.now() + 86400000),
    },
  ];

  const addUsers = await db.insertInto("users").values(users).execute();
  console.log("Seeded database with 3 users");
  return {
    createTable,
    addUsers,
  };
}
