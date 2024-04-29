import nodemailer from "nodemailer";
import * as aws from "@aws-sdk/client-ses";
import config from "./index";

const ses: aws.SESClient = new aws.SESClient({
  apiVersion: "2010-12-01",
  region: config.AWS_REGION,
  credentials: {
    accessKeyId: config.AWS_ACCESS_KEY || "",
    secretAccessKey: config.AWS_SECRET_ACCESS_KEY || "",
  },
});

const transporter = nodemailer.createTransport({
  SES: { ses, aws },
});

export default transporter;
