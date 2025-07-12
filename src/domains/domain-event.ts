export type KentobotDomainEvent<TPayload> = {
  occurredAt: string; // ISO timestamp
  payload: TPayload;
};
