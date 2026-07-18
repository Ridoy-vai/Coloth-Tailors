import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

const client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017/database");
const db = client.db("Colother-Tailor");

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    // Optional: if you don't provide a client, database transactions won't be enabled.
    client
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false, // 👈 এটাই মূল কথা — client কে role set করতে দেবে না
      },
      country: {
        type: "string",
        required: false,
        input: true, // এটা client থেকে নিতে চাইলে true রাখুন
      },
      location: {
        type: "string",
        required: false,
        input: true,
      },
    },
  },
});