import jwt from "jsonwebtoken";
import config from "../config/config.js";

export function signAccessToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, config.jwt.secret);
}
