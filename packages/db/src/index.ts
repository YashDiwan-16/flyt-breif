import {
  FLYTBASE_DATABASE_NAME,
  flytbaseCollections,
} from "@flyt-breif/core";
import { env } from "@flyt-breif/env/server";
import mongoose from "mongoose";

if (mongoose.connection.readyState === 0) {
  await mongoose.connect(env.DATABASE_URL, {
    dbName: FLYTBASE_DATABASE_NAME,
  });
}

const client = mongoose.connection.getClient().db(FLYTBASE_DATABASE_NAME);

export { client };
export {
  FLYTBASE_DATABASE_NAME,
  flytbaseCollections,
  FLYTBASE_DATABASE_NAME as FLYTBREIF_DATABASE_NAME,
  flytbaseCollections as flytbreifCollections,
};
export * from "./models/auth.model";
export * from "./models/sales-intelligence.model";
