import {
  FLYTBREIF_DATABASE_NAME,
  flytbreifCollections,
} from "@flyt-breif/core";
import { env } from "@flyt-breif/env/server";
import mongoose from "mongoose";

await mongoose.connect(env.DATABASE_URL, {
  dbName: FLYTBREIF_DATABASE_NAME,
});

const client = mongoose.connection.getClient().db(FLYTBREIF_DATABASE_NAME);

export { client };
export { FLYTBREIF_DATABASE_NAME, flytbreifCollections };
export * from "./models/auth.model";
export * from "./models/sales-intelligence.model";
