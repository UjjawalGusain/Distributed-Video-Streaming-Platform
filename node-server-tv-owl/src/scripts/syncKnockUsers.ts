import mongoose from "mongoose";
import knockClient from "../externals/knockClient";
import { MONGODB_URI } from "../config";
import UserModel from "../models/User";

(async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected.");

    const users = await UserModel.find({});
    console.log(`Found ${users.length} users.`);

    for (const user of users) {
      try {
        await knockClient.users.update(user._id.toString(), {
          name: user.username,
          email: user.email,
          avatar: user.avatar,
        });
        console.log("Synced:", user.email);
      } catch (err: any) {
        console.error("Failed for:", user.email, "-", err?.message || err);
      }
    }

    console.log("All users processed.");
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Fatal error:", err);
    process.exit(1);
  }
})();
