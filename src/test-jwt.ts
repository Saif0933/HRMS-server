import { signToken, verifyToken } from "./utils/jwt.util";
import env from "./config/env.config";

const secret = env.jwt.secret || "modarappid-backend-default-secret-key-9999";
console.log("JWT Secret:", secret);

const payload = {
  id: "1",
  phoneNumber: "+919876543210",
  role: "CUSTOMER",
};

try {
  const token = signToken(payload, secret);
  console.log("Generated Token:", token);

  const decoded = verifyToken(token, secret);
  console.log("Decoded Payload:", decoded);
  
  console.log("TEST SUCCESSFUL!");
} catch (error: any) {
  console.error("TEST FAILED:", error.message || error);
}
