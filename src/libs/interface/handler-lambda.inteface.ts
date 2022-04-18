export interface ILambdaEvent {
  headers: ILambdaEventHaders;
}

interface ILambdaEventHaders {
  Authorization: string;
}
