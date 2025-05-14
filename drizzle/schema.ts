import { relations } from "drizzle-orm"
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core"

export const users = sqliteTable("users", {
  id: integer("id").primaryKey(), // Telegram ID
  key: text("key"),
  username: text("username"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  createdAt: text("created_at").default(new Date().toISOString()),
})


export const members = sqliteTable("members", {
  id: text("id").primaryKey(),
  role: text("role"),
  group_id: integer("group_id"),
  user_id: integer("user_id"),
  username: text("username"),
  name: text("name"),
  createdAt: text("created_at").default(new Date().toISOString()),
})

export const membersRelations = relations(members, ({ one }) => ({
  group: one(groups, {
    fields: [members.group_id],
    references: [groups.id],
  }),
  user: one(users, {
    fields: [members.user_id],
    references: [users.id],
  }),
}))

export const groups = sqliteTable("groups", {
  id: integer("id").primaryKey(), // Telegram ID
  did: text("did"),
  did_doc: text("did_doc"),
  role: text("role"),
  verida: text("verida"),
  username: text("username"),
  name: text("name"),
  owner: integer("owner"),
  lastName: text("last_name"),
  createdAt: text("created_at").default(new Date().toISOString()),
})
export const groupsRelations = relations(groups, ({ one }) => ({
  owner: one(users, {
    fields: [groups.owner],
    references: [users.id],
  }),
}))
