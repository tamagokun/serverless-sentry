import { sql } from "drizzle-orm";
import { text, integer, sqliteTable, index } from "drizzle-orm/sqlite-core";

export const event = sqliteTable(
  "Event",
  {
    id: text("id").primaryKey(),
    projectId: integer("projectId")
      .notNull()
      .references(() => project.id),
    type: text("type", { enum: ["EXCEPTION", "MESSAGE"] }).notNull(),
    message: text("message"),
    stack: text("stack", { mode: "json" }),
    meta: text("meta", { mode: "json" }),
    count: integer("count"),
    createdAt: text("createdAt").default(sql`(CURRENT_TIMESTAMP)`),
    lastEventAt: text("lastEventAt").default(sql`(CURRENT_TIMESTAMP)`),
    resolvedAt: text("resolvedAt"),
  },
  (table) => {
    return {
      projectIdx: index("projectIdx").on(table.projectId),
    };
  }
);

export const project = sqliteTable("Project", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name"),
  secureToken: text("secureToken"),
  clientToken: text("clientToken"),
  createdAt: text("createdAt").default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updatedAt"),
});

export const token = sqliteTable("Token", {
  token: text("token").primaryKey(),
  name: text("name"),
  active: integer("active", { mode: "boolean" }).default(false),
  createdAt: text("createdAt").default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updatedAt"),
});
