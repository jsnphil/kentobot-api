import {
  channelRaidedEvent,
  customRewardRedemptionEvent,
  giftSubcriptionEvent,
  mockSubscriptionEvent,
  streamOfflineEvent,
  streamOnlineEvent,
  userCheeredEvent,
  userSubscriptionMessageEvent
} from '../../mocks/twitch-mocks';
import { TwitchEventMapper } from './twitch-event-mapper';
import type { UserSubscribedEvent } from '../../domains/twitch/events/user-subscribed-event';

describe('TwitchEventMapper', () => {
  it('should create a user-subscribed event', () => {
    const event = TwitchEventMapper.toDomainEvent(mockSubscriptionEvent);

    expect(event as UserSubscribedEvent).toBeDefined();
    expect(event).toEqual({
      type: 'user-subscribed',
      source: 'twitch',
      version: 1,
      occurredAt: '2019-11-16T10:11:12.634234626Z',
      payload: {
        userLogin: 'vin',
        username: 'Vin',
        isGift: false
      }
    });
  });

  it('should create a user-gifted-subscription event', () => {
    const event = TwitchEventMapper.toDomainEvent(giftSubcriptionEvent);

    expect(event).toEqual({
      type: 'user-gifted-subscription',
      source: 'twitch',
      version: 1,
      occurredAt: '2019-11-16T10:11:12.634234626Z',
      payload: {
        userLogin: 'kaladin',
        username: 'Kaladin',
        total: 2,
        tier: '1000'
      }
    });
  });

  it('should create a user-resubscription event', () => {
    const event = TwitchEventMapper.toDomainEvent(userSubscriptionMessageEvent);

    expect(event).toEqual({
      type: 'user-resubscribed',
      source: 'twitch',
      version: 1,
      occurredAt: '2019-11-16T10:11:12.634234626Z',
      payload: {
        userLogin: 'dalinar',
        username: 'Dalinar',
        totalMonths: 15,
        streakMonths: 1,
        durationMonths: 6,
        tier: '1000'
      }
    });
  });

  it('should create a user-cheered event', () => {
    const event = TwitchEventMapper.toDomainEvent(userCheeredEvent);

    expect(event).toEqual({
      type: 'user-cheered',
      source: 'twitch',
      version: 1,
      occurredAt: '2019-11-16T10:11:12.634234626Z',
      payload: {
        userLogin: 'shallan',
        username: 'Shallan',
        bits: 1000
      }
    });
  });

  it('should create a channel points redepemtion event', () => {
    const event = TwitchEventMapper.toDomainEvent(customRewardRedemptionEvent);

    expect(event).toEqual({
      type: 'user-redeemed-channel-reward',
      source: 'twitch',
      version: 1,
      occurredAt: '2019-11-16T10:11:12.634234626Z',
      payload: {
        userLogin: 'renarin',
        username: 'Renarin',
        rewardId: '92af127c-7326-4483-a52b-b0da0be61c01',
        rewardTitle: 'Song bump',
        redeemedAt: '2020-07-15T17:16:03.17106713Z'
      }
    });
  });

  it('should create a stream online event', () => {
    const event = TwitchEventMapper.toDomainEvent(streamOnlineEvent);

    expect(event).toEqual({
      type: 'stream-online',
      source: 'twitch',
      version: 1,
      occurredAt: '2019-11-16T10:11:12.634234626Z',
      payload: {
        type: 'live',
        startedAt: '2020-10-11T10:11:12.123Z'
      }
    });
  });

  it('should create a stream offline event', () => {
    const event = TwitchEventMapper.toDomainEvent(streamOfflineEvent);

    expect(event).toEqual({
      type: 'stream-offline',
      source: 'twitch',
      version: 1,
      occurredAt: '2019-11-16T10:11:12.634234626Z',
      payload: {}
    });
  });

  it('should create a channel raided event', () => {
    const event = TwitchEventMapper.toDomainEvent(channelRaidedEvent);

    expect(event).toEqual({
      type: 'channel-raided',
      source: 'twitch',
      version: 1,
      occurredAt: '2019-11-16T10:11:12.634234626Z',
      payload: {
        raiderUserLogin: 'kelsier',
        raiderUsername: 'Kelsier',
        viewerCount: 9001
      }
    });
  });

  it('should return null for an unknown event type', () => {
    const event = TwitchEventMapper.toDomainEvent({
      subscription: {
        type: 'unknown.event.type'
      }
    });

    expect(event).toBeNull();
  });
});
