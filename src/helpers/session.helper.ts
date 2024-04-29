import session from "express-session";
import config from "../config";
import { v4 as uuid } from "uuid";
import sessionStore from "../database/kv";

// TODO: set secure to true in production , it is false for development, set domain to our domain , set ("trust proxy", 1) in production if we are behind a proxy

export const sessionConfig: session.SessionOptions = {
  cookie: {
    path: "/",
    httpOnly: true,
    secure: false,
    maxAge: 24 * 60 * 60 * 1000,
  },
  secret: config.SESSION_SECRET,
  genid: () => {
    return uuid();
  },
  name: "sessionId",
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
};

export const sessionConfigSecure: session.SessionOptions = {
  cookie: {
    path: "/",
    httpOnly: true,
    secure: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: "lax",
  },
  secret: config.SESSION_SECRET,
  proxy: true,
  genid: () => {
    return uuid();
  },
  name: "sessionId",
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
};
