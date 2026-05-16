import { z } from "zod/v4";
export declare const bannedTable: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "banned";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "banned";
            dataType: "number";
            columnType: "PgSerial";
            data: number;
            driverParam: number;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: true;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        anonId: import("drizzle-orm/pg-core").PgColumn<{
            name: "anon_id";
            tableName: "banned";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        reason: import("drizzle-orm/pg-core").PgColumn<{
            name: "reason";
            tableName: "banned";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        bannedAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "banned_at";
            tableName: "banned";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
export declare const insertBannedSchema: z.ZodObject<{
    anonId: z.ZodString;
    reason: z.ZodString;
}, {
    out: {};
    in: {};
}>;
export type InsertBanned = z.infer<typeof insertBannedSchema>;
export type Banned = typeof bannedTable.$inferSelect;
//# sourceMappingURL=banned.d.ts.map