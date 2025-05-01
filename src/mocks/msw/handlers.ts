/* eslint-disable @typescript-eslint/no-unused-vars */
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('https://www.googleapis.com/youtube/v3/videos', ({ request }) => {
    const url = new URL(request.url);

    const youtubeId = url.searchParams.get('id');

    if (youtubeId === 'test1') {
      return HttpResponse.json({
        kind: 'youtube#videoListResponse',
        etag: 'etag',
        items: [
          {
            kind: 'youtube#video',
            etag: 'etag',
            id: 'test1',
            snippet: {
              publishedAt: 'publishedAt',
              channelId: 'channelId',
              title: 'Video title',
              description: 'description',
              thumbnails: {
                default: {
                  url: 'url',
                  width: 120,
                  height: 90
                },
                medium: {
                  url: 'url',
                  width: 320,
                  height: 180
                },
                high: {
                  url: 'url',
                  width: 480,
                  height: 360
                }
              },
              channelTitle: 'channelTitle',
              tags: ['tag1', 'tag2'],
              categoryId: 'categoryId',
              liveBroadcastContent: 'none',
              localized: {
                title: 'title',
                description: 'description'
              },
              defaultAudioLanguage: 'en'
            },
            contentDetails: {
              duration: 'PT2M30S',
              dimension: '2d',
              definition: 'hd',
              caption: 'false',
              licensedContent: false,
              regionRestriction: {
                allowed: ['US']
              },
              contentRating: {
                mpaaRating: 'mpaaRating'
              },
              projection: 'rectangular'
            },
            status: {
              uploadStatus: 'status',
              privacyStatus: 'public',
              license: 'status',
              embeddable: true,
              publicStatsViewable: true
            }
          }
        ]
      });
    } else if (youtubeId === 'test2') {
      return HttpResponse.json({
        kind: 'youtube#videoListResponse',
        etag: 'YIUPVpqNjppyCWOZfL-19bLb7uk',
        items: [],
        pageInfo: {
          totalResults: 0,
          resultsPerPage: 0
        }
      });
    } else if (youtubeId === 'test3') {
      return HttpResponse.json({
        kind: 'youtube#videoListResponse',
        etag: 'etag',
        items: [
          {
            kind: 'youtube#video',
            etag: 'etag',
            id: 'test3',
            snippet: {
              publishedAt: 'publishedAt',
              channelId: 'channelId',
              title: 'Video title',
              description: 'description',
              thumbnails: {
                default: {
                  url: 'url',
                  width: 120,
                  height: 90
                },
                medium: {
                  url: 'url',
                  width: 320,
                  height: 180
                },
                high: {
                  url: 'url',
                  width: 480,
                  height: 360
                }
              },
              channelTitle: 'channelTitle',
              tags: ['tag1', 'tag2'],
              categoryId: 'categoryId',
              liveBroadcastContent: 'none',
              localized: {
                title: 'title',
                description: 'description'
              },
              defaultAudioLanguage: 'en'
            },
            contentDetails: {
              duration: 'PT2M30S',
              dimension: '2d',
              definition: 'hd',
              caption: 'false',
              licensedContent: false,
              regionRestriction: {},
              contentRating: {
                mpaaRating: 'mpaaRating'
              },
              projection: 'rectangular'
            },
            status: {
              uploadStatus: 'status',
              privacyStatus: 'public',
              license: 'status',
              embeddable: true,
              publicStatsViewable: true
            }
          }
        ]
      });
    } else if (youtubeId === 'test4') {
      return HttpResponse.json({
        kind: 'youtube#videoListResponse',
        etag: 'YIUPVpqNjppyCWOZfL-19bLb7uk',
        items: [
          {
            kind: 'youtube#video',
            etag: 'etag1',
            id: 'video1',
            snippet: {
              publishedAt: 'publishedAt1',
              channelId: 'channelId1',
              title: 'Video title 1',
              description: 'description 1',
              thumbnails: {
                default: {
                  url: 'url1',
                  width: 120,
                  height: 90
                },
                medium: {
                  url: 'url1',
                  width: 320,
                  height: 180
                },
                high: {
                  url: 'url1',
                  width: 480,
                  height: 360
                }
              },
              channelTitle: 'channelTitle1',
              tags: ['tag1', 'tag2'],
              categoryId: 'categoryId1',
              liveBroadcastContent: 'none',
              localized: {
                title: 'title1',
                description: 'description1'
              },
              defaultAudioLanguage: 'en'
            },
            contentDetails: {
              duration: 'PT2M30S',
              dimension: '2d',
              definition: 'hd',
              caption: 'false',
              licensedContent: false,
              regionRestriction: {},
              contentRating: {
                mpaaRating: 'mpaaRating1'
              },
              projection: 'rectangular'
            },
            status: {
              uploadStatus: 'status1',
              privacyStatus: 'public',
              license: 'status1',
              embeddable: true,
              publicStatsViewable: true
            }
          },
          {
            kind: 'youtube#video',
            etag: 'etag2',
            id: 'video2',
            snippet: {
              publishedAt: 'publishedAt2',
              channelId: 'channelId2',
              title: 'Video title 2',
              description: 'description 2',
              thumbnails: {
                default: {
                  url: 'url2',
                  width: 120,
                  height: 90
                },
                medium: {
                  url: 'url2',
                  width: 320,
                  height: 180
                },
                high: {
                  url: 'url2',
                  width: 480,
                  height: 360
                }
              },
              channelTitle: 'channelTitle2',
              tags: ['tag3', 'tag4'],
              categoryId: 'categoryId2',
              liveBroadcastContent: 'none',
              localized: {
                title: 'title2',
                description: 'description2'
              },
              defaultAudioLanguage: 'en'
            },
            contentDetails: {
              duration: 'PT3M30S',
              dimension: '2d',
              definition: 'hd',
              caption: 'false',
              licensedContent: false,
              regionRestriction: {},
              contentRating: {
                mpaaRating: 'mpaaRating2'
              },
              projection: 'rectangular'
            },
            status: {
              uploadStatus: 'status2',
              privacyStatus: 'public',
              license: 'status2',
              embeddable: true,
              publicStatsViewable: true
            }
          },
          {
            kind: 'youtube#video',
            etag: 'etag3',
            id: 'video3',
            snippet: {
              publishedAt: 'publishedAt3',
              channelId: 'channelId3',
              title: 'Video title 3',
              description: 'description 3',
              thumbnails: {
                default: {
                  url: 'url3',
                  width: 120,
                  height: 90
                },
                medium: {
                  url: 'url3',
                  width: 320,
                  height: 180
                },
                high: {
                  url: 'url3',
                  width: 480,
                  height: 360
                }
              },
              channelTitle: 'channelTitle3',
              tags: ['tag5', 'tag6'],
              categoryId: 'categoryId3',
              liveBroadcastContent: 'none',
              localized: {
                title: 'title3',
                description: 'description3'
              },
              defaultAudioLanguage: 'en'
            },
            contentDetails: {
              duration: 'PT4M30S',
              dimension: '2d',
              definition: 'hd',
              caption: 'false',
              licensedContent: false,
              regionRestriction: {},
              contentRating: {
                mpaaRating: 'mpaaRating3'
              },
              projection: 'rectangular'
            },
            status: {
              uploadStatus: 'status3',
              privacyStatus: 'public',
              license: 'status3',
              embeddable: true,
              publicStatsViewable: true
            }
          },
          {
            kind: 'youtube#video',
            etag: 'etag4',
            id: 'video4',
            snippet: {
              publishedAt: 'publishedAt4',
              channelId: 'channelId4',
              title: 'Video title 4',
              description: 'description 4',
              thumbnails: {
                default: {
                  url: 'url4',
                  width: 120,
                  height: 90
                },
                medium: {
                  url: 'url4',
                  width: 320,
                  height: 180
                },
                high: {
                  url: 'url4',
                  width: 480,
                  height: 360
                }
              },
              channelTitle: 'channelTitle4',
              tags: ['tag7', 'tag8'],
              categoryId: 'categoryId4',
              liveBroadcastContent: 'none',
              localized: {
                title: 'title4',
                description: 'description4'
              },
              defaultAudioLanguage: 'en'
            },
            contentDetails: {
              duration: 'PT5M30S',
              dimension: '2d',
              definition: 'hd',
              caption: 'false',
              licensedContent: false,
              regionRestriction: {},
              contentRating: {
                mpaaRating: 'mpaaRating4'
              },
              projection: 'rectangular'
            },
            status: {
              uploadStatus: 'status4',
              privacyStatus: 'public',
              license: 'status4',
              embeddable: true,
              publicStatsViewable: true
            }
          }
        ],
        pageInfo: {
          totalResults: 0,
          resultsPerPage: 0
        }
      });
    }
    if (youtubeId === 'test5') {
      return HttpResponse.json({
        kind: 'youtube#videoListResponse',
        etag: 'etag',
        items: [
          {
            kind: 'youtube#video',
            etag: 'etag',
            id: 'test5',
            snippet: {
              publishedAt: 'publishedAt',
              channelId: 'channelId',
              title: 'Video title',
              description: 'description',
              thumbnails: {
                default: {
                  url: 'url',
                  width: 120,
                  height: 90
                },
                medium: {
                  url: 'url',
                  width: 320,
                  height: 180
                },
                high: {
                  url: 'url',
                  width: 480,
                  height: 360
                }
              },
              channelTitle: 'channelTitle',
              tags: ['tag1', 'tag2'],
              categoryId: 'categoryId',
              liveBroadcastContent: 'none',
              localized: {
                title: 'title',
                description: 'description'
              },
              defaultAudioLanguage: 'en'
            },
            contentDetails: {
              duration: 'INVALID_DURATION',
              dimension: '2d',
              definition: 'hd',
              caption: 'false',
              licensedContent: false,
              regionRestriction: {
                allowed: ['US']
              },
              contentRating: {
                mpaaRating: 'mpaaRating'
              },
              projection: 'rectangular'
            },
            status: {
              uploadStatus: 'status',
              privacyStatus: 'public',
              license: 'status',
              embeddable: true,
              publicStatsViewable: true
            }
          }
        ]
      });
    } else {
      return new HttpResponse(null, { status: 404 });
    }
  }),
  http.post('https://events.us-east-1.amazonaws.com/', ({ request }) => {
    return new HttpResponse(null, { status: 200 });
  }),
  http.post('https://dynamodb.us-east-1.amazonaws.com/', ({ request }) => {
    return new HttpResponse(null, { status: 200 });
  }),
  http.post('https://id.twitch.tv/oauth2/token', ({ request }) => {
    return HttpResponse.json({
      access_token: 'mockAccessToken',
      expires_in: 3600,
      token_type: 'bearer'
    });
  })
];
