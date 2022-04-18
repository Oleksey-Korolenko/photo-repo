export type S3ConfigType = {
  bucketName: string;
  accessKeyID: string;
  secretAccessKey: string;
};

const s3 = (): S3ConfigType => ({
  bucketName:
    process.env.AWS_S3_BUCKET_NAME === undefined
      ? ''
      : process.env.AWS_S3_BUCKET_NAME,
  accessKeyID:
    process.env.AWS_ACCESS_KEY_ID === undefined
      ? ''
      : process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey:
    process.env.AWS_SECRET_ACCESS_KEY === undefined
      ? ''
      : process.env.AWS_SECRET_ACCESS_KEY,
});

export default s3;
