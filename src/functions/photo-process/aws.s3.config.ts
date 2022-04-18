import { Endpoint, S3 } from 'aws-sdk';
import { AppConfigService, S3ConfigType } from 'src/config';
import { IS3UploadResponse } from './interface';

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

  public upload = async (base64Image: string): Promise<IS3UploadResponse> => {
    const randomId = Math.round(Math.random() * 10000000000000);

    const { Location, Key } = await this.#S3
      .upload({
        Bucket: this.#s3Config.bucketName,
        Key: `${randomId}.jpg`,
        Body: Buffer.from(
          base64Image.replace(/^data:image\/\w+;base64,/, ''),
          'base64'
        ),
        ACL: 'public-read',
        ContentEncoding: 'base64',
        ContentType: 'image/jpeg',
      })
      .promise();

    return {
      link: Location,
      fileName: Key,
    };
  };
}
