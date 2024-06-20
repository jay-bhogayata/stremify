import session from "express-session";
import config from "../config";
import { v4 as uuid } from "uuid";
import { sessionStore } from "../database/kv";

// TODO: set secure to true in production , it is false for development, set domain to our domain , set ("trust proxy", 1) in production if we are behind a proxy

const sessionConfig: session.SessionOptions = {
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

const sessionConfigSecure: session.SessionOptions = {
  cookie: {
    path: "/",
    httpOnly: true,
    secure: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: "lax",
    domain: config.domain,
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

let session_config: session.SessionOptions;

if (config.APP_ENV === "production") {
  session_config = sessionConfigSecure;
} else {
  session_config = sessionConfig;
}

export { sessionConfig, sessionConfigSecure, session_config };
