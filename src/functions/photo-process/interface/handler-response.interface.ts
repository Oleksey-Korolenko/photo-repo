export interface IS3DeleteResponse {
  isCorrect: boolean;
  message: string;
}

export interface IS3GetResponse {
  ContentLength: number;
  ContentEncoding: string;
  ContentType: string;
  Body: string;
  Location: string;
}

export interface IS3GetListResponse {
  KeyCount: number;
  Objects: IS3ObjectResponse[];
}

export interface IS3ObjectResponse {
  Location: string;
  Key: string;
}

interface IS3PresignedPostFieldsResponse {
  key: string;
  acl: string;
  bucket: string;
  'X-Amz-Algorithm': string;
  'X-Amz-Credential': string;
  'X-Amz-Date': string;
  Policy: string;
  'X-Amz-Signature': string;
}

export interface IS3PresignedPostResponse {
  url: string;
  fields: IS3PresignedPostFieldsResponse;
}
