export interface TwitchSubscription {
  id: string;
  status: string;
  type: TwitchEventType;
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
}

export interface TwitchEventNotification {
  challenge: string;
  subscription: TwitchSubscription;
  event: TwitchEvent;
}

export enum TwitchEventType {
  CHANNEL_SUBSCRIBE = 'channel.subscribe',
  CHANNEL_SUBSCRIBER_GIFT = 'channel.subscribe.gift',
  CHANNEL_SUBSCRIBER_MESSAGE = 'channel.subscribe.message',
  CHANNEL_CHEER = 'channel.cheer',
  CHANNEL_RAID = 'channel.raid',
  CHANNEL_POINTS_CUSTOM_REWARD_ADD = 'channel.channel_points_custom_reward.add',
  CHANNEL_POINTS_CUSTOM_REWARD_REDEMPTION_ADD = 'channel.channel_points_custom_reward_redemption.add',
  STREAM_ONLINE = 'stream.online',
  STREAM_OFFLINE = 'stream.offline'
}
