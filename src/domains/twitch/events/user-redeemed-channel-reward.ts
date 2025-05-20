import { KentobotDomainEvent } from '@core/events/domain-event';

export type UserRedeemedChannelRewardEventPayload = {
  username: string;
  rewardId: string;
  rewardTitle: string;
  rewardCost: number;
  redeemedAt: string;
  message?: string;
};

export type UserRedeemedChannelRewardEvent =
  KentobotDomainEvent<UserRedeemedChannelRewardEventPayload> & {
    type: 'user-redeemed-channel-reward';
    source: 'twitch';
    version: 1;
  };
