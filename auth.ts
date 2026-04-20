import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/config";

export function auth() {
  return getServerSession(authOptions);
}
