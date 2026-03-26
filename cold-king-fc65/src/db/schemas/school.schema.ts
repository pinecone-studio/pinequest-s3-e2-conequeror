import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const schools = sqliteTable("schools", {
	id: text().primaryKey(),
	schoolName: text().notNull(),
	email: text().notNull(),
	managerLastName: text().notNull(),
	managerFirstName: text().notNull(),
	aimag: text().notNull(),
	createdAt: int().notNull(),
});
