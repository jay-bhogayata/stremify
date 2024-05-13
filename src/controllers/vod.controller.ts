import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import { CreateMultipartUploadCommand, S3Client } from "@aws-sdk/client-s3";
import config from "../config";
import {
  UploadPartCommand,
  CompleteMultipartUploadCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: config.AWS_REGION,
});

export const init = asyncHandler(async (req: Request, res: Response) => {
  const { name } = req.body;

  if (!name) {
    res.status(400).json({ message: "Name is required" });
    return;
  }
  const multiPartParams = {
    Bucket: "stremify-master-vod-bucket",
    Key: name,
  };

  const cmd = new CreateMultipartUploadCommand(multiPartParams);

  const result = await s3.send(cmd);

  const response = {
    fileId: result.UploadId,
    fileKey: result.Key,
  };

  res.status(200).json(response);
});

export const getSignedUrls = asyncHandler(
  async (req: Request, res: Response) => {
    const list = await makePreSignedUrls(
      s3,
      "stremify-master-vod-bucket",
      "3600",
      req.body.fileKey,
      req.body.fileId,
      req.body.parts
    );

    const response = {
      parts: list,
    };

    res.status(200).json(response);
  }
);

async function makePreSignedUrls(
  s3: S3Client,
  bucket_name: string,
  url_expiration: string,
  fileKey: string,
  fileId: string,
  parts: number
) {
  const multipartParams = {
    Bucket: bucket_name,
    Key: fileKey,
    UploadId: fileId,
  };

  const promises = [];

  for (let index = 0; index < parts; index++) {
    const command = new UploadPartCommand({
      ...multipartParams,
      PartNumber: index + 1,
    });
    promises.push(
      getSignedUrl(s3, command, { expiresIn: parseInt(url_expiration) })
    );
  }

  const signedUrls = await Promise.all(promises);

  return signedUrls.map((signedUrl, index) => {
    return {
      signedUrl: signedUrl,
      PartNumber: index + 1,
    };
  });
}

export const completeUpload = async (req: Request, res: Response) => {
  const { fileKey, fileId, parts } = req.body;

  if (!fileKey || !fileId || !parts) {
    res.status(400).json({ message: "fileKey, fileId and parts are required" });
    return;
  }

  let sortedParts = parts.sort((p1: any, p2: any) =>
    p1.PartNumber < p2.PartNumber ? -1 : p1.price > p2.price ? 1 : 0
  );

  const multipartParams = {
    Bucket: "stremify-master-vod-bucket",
    Key: fileKey,
    UploadId: fileId,
    MultipartUpload: {
      Parts: sortedParts,
    },
  };

  const command = new CompleteMultipartUploadCommand(multipartParams);
  await s3.send(command);

  res.status(200).json({ message: "Upload completed successfully" });
};
