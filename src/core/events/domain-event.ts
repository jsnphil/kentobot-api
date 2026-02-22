// Base type
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type KentobotDomainEvent<TPayload> = {
  id: string;
  type: string;
  occurredAt: string;
  source: string;
  version: number;
  payload: TPayload;
};
