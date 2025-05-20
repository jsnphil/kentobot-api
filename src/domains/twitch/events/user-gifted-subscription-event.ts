import { KentobotDomainEvent } from '@core/events/domain-event';

export type UserGiftedSubscriptionEventPayload = {
  username: string;
  total: number;
  tier: string;
};

export type UserGiftedSubscriptionEvent =
  KentobotDomainEvent<UserGiftedSubscriptionEventPayload> & {
    type: 'user-gifted-subscription';
    source: 'twitch';
    version: 1;
  };
