export interface TwitchTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}
export interface TwitchSubscription {
  id: string;
  status: string;
  type: string;
  version: string;
  condition: {
    broadcaster_user_id: string;
  };
  transport: {
    method: string;
    callback: string;
  };
  created_at: string;
  cost: number;
}

export interface TwitchEvent {
  id: string;
  broadcaster_user_id: string;
  broadcaster_user_login: string;
  broadcaster_user_name: string;
  type: string;
  started_at: string;
  user_id: string;
  user_login: string;
  user_name: string;
  tier: string;
  is_gift: boolean;
  total?: number;
  cumulative_total?: number;
  is_anonymous?: boolean;
  message?: TwitchMessage;
  cumulative_months?: number;
  duration_months?: number;
  streak_months?: number;
  bits?: number;
  reward?: ChannelPointsReward;
  redeemed_at: string;
  from_broadcaster_user_id?: string;
  from_broadcaster_user_name?: string;
  from_broadcaster_user_login?: string;
  to_broadcaster_user_id?: string;
  to_broadcaster_user_name?: string;
  to_broadcaster_user_login?: string;
  viewers?: number;
}

export interface TwitchMessage {
  text: string;
  emotes: {
    begin: number;
    end: number;
    id: string;
  }[];
}

export interface ChannelPointsReward {
  id: string;
  title: string;
  cost: number;
  prompt: string;
}

export interface TwitchEventNotification {
  challenge: string;
  subscription: TwitchSubscription;
  event: TwitchEvent;
}

export enum TwitchEventType {
  CHANNEL_SUBSCRIBE = 'channel.subscribe',
  CHANNEL_SUBSCRIPTION_GIFT = 'channel.subscription.gift',
  CHANNEL_SUBSCRIPTION_MESSAGE = 'channel.subscription.message',
  CHANNEL_CHEER = 'channel.cheer',
  CHANNEL_RAID = 'channel.raid',
  CHANNEL_POINTS_CUSTOM_REWARD_ADD = 'channel.channel_points_custom_reward.add',
  CHANNEL_POINTS_CUSTOM_REWARD_REDEMPTION_ADD = 'channel.channel_points_custom_reward_redemption.add',
  STREAM_ONLINE = 'stream.online',
  STREAM_OFFLINE = 'stream.offline'
}
