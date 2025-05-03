import { KentobotDomainEvent, createDomainEvent } from '@domains/domain-event';

export class TwitchEventMapper {
  static toDomainEvent(body: any): KentobotDomainEvent | null {
    const type = body.subscription?.type;
    const event = body.event;

    switch (type) {
      case 'channel.subscribe':
        return createDomainEvent('viewer-subscribed', 'twitch', {
          userId: event.user_id,
          username: event.user_login,
          tier: event.tier,
          isGift: event.is_gift
        });

      case 'channel.subscription.gift':
        return createDomainEvent('viewer-gifted-subscription', 'twitch', {
          gifterId: event.user_id,
          gifterUsername: event.user_login,
          total: event.total,
          tier: event.tier
        });

      case 'channel.subscription.message':
        return createDomainEvent('viewer-subscription-message', 'twitch', {
          userId: event.user_id,
          username: event.user_login,
          cumulativeMonths: event.cumulative_months,
          message: event.message.text
        });

      case 'channel.cheer':
        return createDomainEvent('viewer-cheered', 'twitch', {
          userId: event.user_id,
          username: event.user_login,
          bits: event.bits
        });

      case 'channel.channel_points_custom_reward_redemption.add':
        return createDomainEvent('custom-reward-redeemed', 'twitch', {
          userId: event.user_id,
          username: event.user_login,
          rewardId: event.reward.id,
          rewardTitle: event.reward.title,
          input: event.user_input
        });

      case 'stream.online':
        return createDomainEvent('stream-went-online', 'twitch', {
          startedAt: event.started_at
        });

      case 'stream.offline':
        return createDomainEvent('stream-went-offline', 'twitch', {});

      case 'channel.raid':
        return createDomainEvent('viewer-raided', 'twitch', {
          fromStreamerId: event.from_broadcaster_user_id,
          fromStreamerName: event.from_broadcaster_user_login,
          viewerCount: event.viewers
        });

      default:
        return null;
    }
  }
}
