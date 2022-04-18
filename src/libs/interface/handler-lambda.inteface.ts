export interface ILambdaEvent {
  headers: ILambdaEventHaders;
  userKey: string;
}

interface ILambdaEventHaders {
  Authorization: string;
}
