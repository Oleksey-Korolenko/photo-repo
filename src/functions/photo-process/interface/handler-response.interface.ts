export interface IS3UploadResponse {
  link: string;
  fileName: string;
}

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
