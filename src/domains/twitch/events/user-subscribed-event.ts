import { KentobotDomainEvent } from '@core/events/domain-event';

export type UserSubscribedEventPayload = {
  user: string;
  isGift: boolean;
};

export type UserSubscribedEvent =
  KentobotDomainEvent<UserSubscribedEventPayload> & {
    type: 'user-subscribed';
    source: 'twitch';
    version: 1;
  };
