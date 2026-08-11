// One-time setup script: creates the platform's admin account if one doesn't
// already exist. Admin accounts are deliberately not creatable through the
// public register form (role picker only offers teacher/student) - this is
// the only way to get one, keeping it out of self-service signup.
//
// Usage:
//   node scripts/seedAdmin.js
// Configure via env vars (see backend/.env), falling back to documented
// defaults - change the password after first login either way.
import bcrypt from "bcryptjs";
import { connectDB, disconnectDB } from "../src/config/db.js";
import User from "../src/models/User.model.js";
import { ROLES } from "../src/constants.js";
import mongoose from "mongoose";

const SALT_ROUNDS = 10;

async function main() {
  await connectDB();

  const email = (process.env.ADMIN_EMAIL || "admin@edutrack.local").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "ChangeMe123!";
  const name = process.env.ADMIN_NAME || "Admin";

  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`Admin account already exists (${email}) - nothing to do.`);
    if (existing.role !== ROLES.ADMIN) {
      existing.role = ROLES.ADMIN;
      await existing.save();
      console.log("Promoted existing account to admin role.");
    }
  } else {
    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    await User.create({ name, email, password: hashed, role: ROLES.ADMIN });
    console.log(`Created admin account: ${email} / ${password}`);
    console.log("Log in with these credentials, then change the password from Profile.");
  }

  await disconnectDB();
}

main().catch((err) => {
  console.error("Failed to seed admin account:", err);
  process.exit(1);
});
