import { KentobotDomainEvent } from '@core/events/domain-event';

export type UserSubscribedEventPayload = {
  userLogin: string;
  username: string;
  isGift: boolean;
};

export type UserSubscribedEvent =
  KentobotDomainEvent<UserSubscribedEventPayload> & {
    type: 'user-subscribed';
    source: 'twitch';
    version: 1;
  };
