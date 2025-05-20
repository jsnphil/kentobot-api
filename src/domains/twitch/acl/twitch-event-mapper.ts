import { KentobotDomainEvent } from '@core/events/domain-event';

import { TwitchSubscription, TwitchEvent } from '../../../types/twitch';
import { UserRedeemedChannelRewardEvent } from '../events/user-redeemed-channel-reward';
import { UserCheeredEvent } from '../events/user-cheered-event';
import { UserGiftedSubscriptionEvent } from '../events/user-gifted-subscription-event';
import { UserResubscriptionEvent } from '../events/user-resubscribed-event';
import { UserSubscribedEvent } from '../events/user-subscribed-event';
import { StreamOnlineEvent } from '../events/stream-online-event';
import { StreamOfflineEvent } from '../events/stream-offline-event';
import { ChannelRaidedEvent } from '../events/channel-raided-event';

export class TwitchEventMapper {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static toDomainEvent(body: any): KentobotDomainEvent<any> | null {
    const twitchSubscription = body.subscription as TwitchSubscription;
    const twitchEvent = body.event as TwitchEvent;

    let domainEvent: KentobotDomainEvent<unknown>;

    const type = twitchSubscription.type;
    switch (type) {
      case 'channel.subscribe': {
        domainEvent = {
          type: 'user-subscribed',
          source: 'twitch',
          version: 1,
          occurredAt: twitchSubscription.created_at ?? new Date().toISOString(),
          payload: {
            user: twitchEvent.user_id,
            isGift: twitchEvent.is_gift
          }
        } as UserSubscribedEvent;

        break;
      }
      case 'channel.subscription.gift': {
        domainEvent = {
          type: 'user-gifted-subscription',
          source: 'twitch',
          version: 1,
          occurredAt: twitchSubscription.created_at ?? new Date().toISOString(),
          payload: {
            username: twitchEvent.user_name,
            total: twitchEvent.total,
            tier: twitchEvent.tier
          }
        } as UserGiftedSubscriptionEvent;

        break;
      }
      case 'channel.subscription.message': {
        domainEvent = {
          type: 'user-resubscribed',
          source: 'twitch',
          version: 1,
          occurredAt: twitchSubscription.created_at ?? new Date().toISOString(),
          payload: {
            username: twitchEvent.user_id,
            totalMonths: twitchEvent.cumulative_months,
            streakMonths: twitchEvent.streak_months,
            durationMonths: twitchEvent.duration_months,
            tier: twitchEvent.tier
          }
        } as UserResubscriptionEvent;

        break;
      }
      case 'channel.cheer': {
        domainEvent = {
          type: 'user-cheered',
          source: 'twitch',
          version: 1,
          occurredAt: twitchSubscription.created_at ?? new Date().toISOString(),
          payload: {
            username: twitchEvent.user_login,
            bits: twitchEvent.bits
          }
        } as UserCheeredEvent;

        break;
      }
      case 'channel.channel_points_custom_reward_redemption.add': {
        domainEvent = {
          type: 'custom-reward-redeemed',
          source: 'twitch',
          version: 1,
          occurredAt: twitchEvent.redeemed_at ?? new Date().toISOString(),
          payload: {
            username: twitchEvent.user_login,
            rewardId: twitchEvent.reward?.id,
            rewardTitle: twitchEvent.reward?.title
          }
        } as UserRedeemedChannelRewardEvent;

        break;
      }
      case 'stream.online': {
        domainEvent = {
          type: 'stream-online',
          source: 'twitch',
          version: 1,
          occurredAt: twitchSubscription.created_at ?? new Date().toISOString(),
          payload: {
            type: twitchEvent.type,
            startedAt: twitchEvent.started_at
          }
        } as StreamOnlineEvent;

        break;
      }
      case 'stream.offline': {
        domainEvent = {
          type: 'stream-went-offline',
          source: 'twitch',
          version: 1,
          payload: {}
        } as StreamOfflineEvent;

        break;
      }
      case 'channel.raid': {
        domainEvent = {
          type: 'channel-raided',
          source: 'twitch',
          version: 1,
          occurredAt: twitchSubscription.created_at ?? new Date().toISOString(),
          payload: {
            raiderUsername: twitchEvent.from_broadcaster_user_name,
            viewerCount: twitchEvent.viewers
          }
        } as ChannelRaidedEvent;

        break;
      }
      case 'channel.channel_points_custom_reward.add': {
        domainEvent = {
          type: 'user-redeemed-channel-reward',
          source: 'twitch',
          version: 1,
          occurredAt: twitchSubscription.created_at ?? new Date().toISOString(),
          payload: {
            username: twitchEvent.user_login,
            rewardId: twitchEvent.reward?.id,
            rewardTitle: twitchEvent.reward?.title,
            rewardCost: twitchEvent.reward?.cost,
            redeemedAt: twitchEvent.redeemed_at,
            message: twitchEvent.message?.text
          }
        } as UserRedeemedChannelRewardEvent;
        break;
      }
      default:
        return null;
    }

    if (domainEvent) {
      return domainEvent;
    }
    return null;
  }
}
