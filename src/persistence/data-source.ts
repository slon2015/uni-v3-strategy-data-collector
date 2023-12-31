import { DataSource } from "typeorm";
import { Pool, Price } from "./entities";

export const appDataSource = new DataSource({
  type: "sqlite",
  database: "cached_data.db",
  synchronize: true,
  logging: process.env.NODE_ENV === "development" || false,
  entities: [Pool, Price],
  subscribers: [],
  migrations: [],
});

export function initialize() {
  return appDataSource.initialize();
}
