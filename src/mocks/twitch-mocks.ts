export const mockSubscriptionEvent = {
  subscription: {
    id: 'f1c2a387-161a-49f9-a165-0f21d7a4e1c4',
    type: 'channel.subscribe',
    version: '1',
    status: 'enabled',
    cost: 0,
    condition: {
      broadcaster_user_id: '1337'
    },
    transport: {
      method: 'webhook',
      callback: 'https://example.com/webhooks/callback'
    },
    created_at: '2019-11-16T10:11:12.634234626Z'
  },
  event: {
    user_id: '1234',
    user_login: 'vin',
    user_name: 'Vin',
    broadcaster_user_id: '1337',
    broadcaster_user_login: 'kentobeans7',
    broadcaster_user_name: 'Kentobeans7',
    tier: '1000',
    is_gift: false
  }
};

export const giftSubcriptionEvent = {
  subscription: {
    id: 'f1c2a387-161a-49f9-a165-0f21d7a4e1c4',
    type: 'channel.subscription.gift',
    version: '1',
    status: 'enabled',
    cost: 0,
    condition: {
      broadcaster_user_id: '1337'
    },
    transport: {
      method: 'webhook',
      callback: 'https://example.com/webhooks/callback'
    },
    created_at: '2019-11-16T10:11:12.634234626Z'
  },
  event: {
    user_id: '1234',
    user_login: 'kaladin',
    user_name: 'Kaladin',
    broadcaster_user_id: '1337',
    broadcaster_user_login: 'kentobeans7',
    broadcaster_user_name: 'Kentobeans7',
    total: 2,
    tier: '1000',
    cumulative_total: 284, //null if anonymous or not shared by the user
    is_anonymous: false
  }
};

export const userSubscriptionMessageEvent = {
  subscription: {
    id: 'f1c2a387-161a-49f9-a165-0f21d7a4e1c4',
    type: 'channel.subscription.message',
    version: '1',
    status: 'enabled',
    cost: 0,
    condition: {
      broadcaster_user_id: '1337'
    },
    transport: {
      method: 'webhook',
      callback: 'https://example.com/webhooks/callback'
    },
    created_at: '2019-11-16T10:11:12.634234626Z'
  },
  event: {
    user_id: '1234',
    user_login: 'dalinar',
    user_name: 'Dalinar',
    broadcaster_user_id: '1337',
    broadcaster_user_login: 'kentobeans7',
    broadcaster_user_name: 'Kentobeans7',
    tier: '1000',
    message: {
      text: 'Love the stream! FevziGG',
      emotes: [
        {
          begin: 23,
          end: 30,
          id: '302976485'
        }
      ]
    },
    cumulative_months: 15,
    streak_months: 1, // null if not shared
    duration_months: 6
  }
};

export const userCheeredEvent = {
  subscription: {
    id: 'f1c2a387-161a-49f9-a165-0f21d7a4e1c4',
    type: 'channel.cheer',
    version: '1',
    status: 'enabled',
    cost: 0,
    condition: {
      broadcaster_user_id: '1337'
    },
    transport: {
      method: 'webhook',
      callback: 'https://example.com/webhooks/callback'
    },
    created_at: '2019-11-16T10:11:12.634234626Z'
  },
  event: {
    is_anonymous: false,
    user_id: '1234', // null if is_anonymous=true
    user_login: 'shallan', // null if is_anonymous=true
    user_name: 'Shallan', // null if is_anonymous=true
    broadcaster_user_id: '1337',
    broadcaster_user_login: 'kentobeans7',
    broadcaster_user_name: 'Kentobeans7',
    message: 'pogchamp',
    bits: 1000
  }
};

export const customRewardRedemptionEvent = {
  subscription: {
    id: 'f1c2a387-161a-49f9-a165-0f21d7a4e1c4',
    type: 'channel.channel_points_custom_reward_redemption.add',
    version: '1',
    status: 'enabled',
    cost: 0,
    condition: {
      broadcaster_user_id: '1337',
      reward_id: '92af127c-7326-4483-a52b-b0da0be61c01' // optional; gets notifications for a specific reward
    },
    transport: {
      method: 'webhook',
      callback: 'https://example.com/webhooks/callback'
    },
    created_at: '2019-11-16T10:11:12.634234626Z'
  },
  event: {
    id: '17fa2df1-ad76-4804-bfa5-a40ef63efe63',
    broadcaster_user_id: '1337',
    broadcaster_user_login: 'kentobeans7',
    broadcaster_user_name: 'Kentobeans7',
    user_id: '9001',
    user_login: 'renarin',
    user_name: 'Renarin',
    user_input: 'pogchamp',
    status: 'unfulfilled',
    reward: {
      id: '92af127c-7326-4483-a52b-b0da0be61c01',
      title: 'Song bump',
      cost: 100,
      prompt: 'reward prompt'
    },
    redeemed_at: '2020-07-15T17:16:03.17106713Z'
  }
};

export const streamOnlineEvent = {
  subscription: {
    id: 'f1c2a387-161a-49f9-a165-0f21d7a4e1c4',
    type: 'stream.online',
    version: '1',
    status: 'enabled',
    cost: 0,
    condition: {
      broadcaster_user_id: '1337'
    },
    transport: {
      method: 'webhook',
      callback: 'https://example.com/webhooks/callback'
    },
    created_at: '2019-11-16T10:11:12.634234626Z'
  },
  event: {
    id: '9001',
    broadcaster_user_id: '1337',
    broadcaster_user_login: 'kentobeans7',
    broadcaster_user_name: 'Kentobeans7',
    type: 'live',
    started_at: '2020-10-11T10:11:12.123Z'
  }
};

export const streamOfflineEvent = {
  subscription: {
    id: 'f1c2a387-161a-49f9-a165-0f21d7a4e1c4',
    type: 'stream.offline',
    version: '1',
    status: 'enabled',
    cost: 0,
    condition: {
      broadcaster_user_id: '1337'
    },
    created_at: '2019-11-16T10:11:12.634234626Z',
    transport: {
      method: 'webhook',
      callback: 'https://example.com/webhooks/callback'
    }
  },
  event: {
    broadcaster_user_id: '1337',
    broadcaster_user_login: 'kentobeans7',
    broadcaster_user_name: 'Kentobeans7'
  }
};

export const channelRaidedEvent = {
  subscription: {
    id: 'f1c2a387-161a-49f9-a165-0f21d7a4e1c4',
    type: 'channel.raid',
    version: '1',
    status: 'enabled',
    cost: 0,
    condition: {
      to_broadcaster_user_id: '1337'
    },
    transport: {
      method: 'webhook',
      callback: 'https://example.com/webhooks/callback'
    },
    created_at: '2019-11-16T10:11:12.634234626Z'
  },
  event: {
    from_broadcaster_user_id: '1234',
    from_broadcaster_user_login: 'kelsier',
    from_broadcaster_user_name: 'Kelsier',
    to_broadcaster_user_id: '1337',
    broadcaster_user_login: 'kentobeans7',
    broadcaster_user_name: 'Kentobeans7',
    viewers: 9001
  }
};
