import { KentobotDomainEvent } from '@core/events/domain-event';

export type ChannelRaidedEventPayload = {
  raiderUsername: string;
  viewerCount: number;
};

export type ChannelRaidedEvent =
  KentobotDomainEvent<ChannelRaidedEventPayload> & {
    type: 'channel-raided';
    source: 'twitch';
    version: 1;
  };
