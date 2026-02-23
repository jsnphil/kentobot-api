import { server } from './src/mocks/msw/server';

beforeAll(() => {
  // Enable API mocking before all the tests.
  server.listen();
});

afterEach(() => {
  // Reset the request handlers between each test.
  // This way the handlers we add on a per-test basis
  // do not leak to other, irrelevant tests.
  server.resetHandlers();
});

afterAll(() => {
  // Finally, disable API mocking after the tests are done.
  server.close();
});

process.env.POWERTOOLS_DEV = 'true';
// process.env.POWERTOOLS_LOG_LEVEL = 'SILENT';
process.env.STREAM_DATA_TABLE = 'stream-data-table';
process.env.AWS_REGION = 'us-east-1';
