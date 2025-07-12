export type UserEnteredInShufflePayload = {
  userId: string;
  songId: string;
};

export type ShuffleWinnerSelectedPayload = {
  songId: string;
  shuffleWinner: string;
};
