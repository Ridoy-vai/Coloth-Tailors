import { auth } from "@/lib/auth"; // আপনার auth.ts এর path অনুযায়ী
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(auth);