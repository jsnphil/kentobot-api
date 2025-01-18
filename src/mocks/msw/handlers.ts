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
            id: 'videoId',
            snippet: {
              publishedAt: 'publishedAt',
              channelId: 'channelId',
              title: 'title',
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
              duration: 'PT1H1M1S',
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
              privacyStatus: 'status',
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
        etag: 'etag'
      });
    } else {
      return new HttpResponse(null, { status: 404 });
    }
  })
];
