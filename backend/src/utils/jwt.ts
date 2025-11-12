import jwt from "jsonwebtoken";
import config from "../config";

type TokenPayload = {
  sub: string;
};

export const signToken = (userId: string) =>
  jwt.sign(
    {
      sub: userId,
    },
    config.jwtSecret,
    {
      expiresIn: `${config.tokenTtlMinutes}m`,
    }
  );

export const verifyToken = (token: string): TokenPayload => {
  const decoded = jwt.verify(token, config.jwtSecret);
  return decoded as TokenPayload;
};

