import { IAWSError } from '@interface/aws-error.interface';
import { Endpoint, S3 } from 'aws-sdk';
import { AppConfigService, S3ConfigType } from 'src/config';
import {
  IS3GetListResponse,
  IS3GetResponse,
  IS3ObjectResponse,
  IS3UploadResponse,
} from './interface';

export class AWSS3Config {
  #s3Config: S3ConfigType;
  #endpoint: Endpoint;
  #S3: S3;

  constructor() {
    this.#s3Config = new AppConfigService().get('s3');
    this.#endpoint = new Endpoint(`s3.us-east-1.amazonaws.com`);
    this.#S3 = new S3({
      endpoint: this.#endpoint,
      apiVersion: '2012-10-17',
      accessKeyId: this.#s3Config.accessKeyID,
      secretAccessKey: this.#s3Config.secretAccessKey,
      region: 'us-east-1',
    });
  }

  public upload = async (
    base64Image: string,
    userKey: string
  ): Promise<IS3UploadResponse> => {
    const randomId = Math.round(Math.random() * 10000000000000);

    /* const { Location, Key }  [
            'starts-with',
            '$body',
            Buffer.from(
              base64Image.replace(/^data:image\/\w+;base64,/, ''),
              'base64'
            ),
          ],*/
    const result = await this.#S3.createPresignedPost({
      Bucket: this.#s3Config.bucketName,
      Conditions: [
        ['$Content-Type', 'image/jpeg'],
        ['content-length-range', 0, 1000000],
        { acl: 'public-read' },
      ],
      Fields: {
        key: `${userKey}/${randomId}.jpg`,
        success_action_redirect:
          'http://localhost:3000/dev/s3/upload-photo-form',
      },
      Expires: 300,
    });

    console.log(result);

    return {
      link: 'Location',
      fileName: 'Key',
    };
  };

  public delete = async (
    userKey: string,
    photoId: string
  ): Promise<boolean> => {
    const result = await this.#S3
      .deleteObject({
        Bucket: this.#s3Config.bucketName,
        Key: `${userKey}/${photoId}.jpg`,
      })
      .promise();

    return result.DeleteMarker;
  };

  public getObject = async (
    userKey: string,
    photoId: string
  ): Promise<string | IS3GetResponse> => {
    try {
      const result = await this.#S3
        .getObject({
          Bucket: this.#s3Config.bucketName,
          Key: `${userKey}/${photoId}.jpg`,
        })
        .promise();

      const { ContentLength, ContentEncoding, ContentType, Body } = result;

      return {
        ContentLength,
        ContentEncoding,
        ContentType,
        Body: Body.toString('base64'),
        Location: `https://${
          this.#s3Config.bucketName
        }.s3.amazonaws.com/${userKey}/${photoId}.jpg`,
      } as IS3GetResponse;
    } catch (e) {
      return this.#checkError(e as IAWSError);
    }
  };

  public getListObjects = async (
    userKey: string,
    limit: number,
    startAfter?: string
  ): Promise<IS3GetListResponse> => {
    const result = await this.#S3
      .listObjectsV2({
        Bucket: this.#s3Config.bucketName,
        Prefix: `${userKey}/`,
        MaxKeys: limit,
        StartAfter:
          startAfter === undefined ? undefined : `${userKey}/${startAfter}.jpg`,
      })
      .promise();

    if (result.KeyCount === 0) {
      return {
        Objects: [],
        KeyCount: 0,
      };
    }

    const objects = result.Contents.map(
      (it) =>
        ({
          Location: `https://${this.#s3Config.bucketName}.s3.amazonaws.com/${
            it.Key
          }`,
          Key: it.Key.split('/')[1].split('.')[0],
        } as IS3ObjectResponse)
    );

    return {
      KeyCount: result.KeyCount,
      Objects: objects,
    };
  };

  #checkError = (e: IAWSError): string => {
    if (e.code === 'NoSuchKey') {
      return e.message;
    }

    return 'Something went wrong!';
  };
}
