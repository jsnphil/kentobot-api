import { KentobotDomainEvent } from '@core/events/domain-event';

export type UserCheeredEventPayload = {
  userLogin: string;
  username: string;
  bits: number;
};

export type UserCheeredEvent = KentobotDomainEvent<UserCheeredEventPayload> & {
  type: 'user-cheered';
  source: 'twitch';
  version: 1;
};
