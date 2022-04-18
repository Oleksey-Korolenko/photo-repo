import { default as auth } from './auth';
import { default as s3 } from './photo-process';

export default [...s3, ...auth];
