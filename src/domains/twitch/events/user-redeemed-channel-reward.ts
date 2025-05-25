import { KentobotDomainEvent } from '@core/events/domain-event';

export type UserRedeemedChannelRewardEventPayload = {
  userLogin: string;
  username: string;
  rewardId: string;
  rewardTitle: string;
  redeemedAt: string;
};

export type UserRedeemedChannelRewardEvent =
  KentobotDomainEvent<UserRedeemedChannelRewardEventPayload> & {
    type: 'user-redeemed-channel-reward';
    source: 'twitch';
    version: 1;
  };
