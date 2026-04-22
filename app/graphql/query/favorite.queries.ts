export const IS_FAVORITE = `
  query IsFavorite($playerId: ID!) {
    isFavorite(playerId: $playerId)
  }
`;

export const GET_FAVORITE_COUNT = `
  query FavoriteCount($playerId: ID!) {
    favoriteCount(playerId: $playerId)
  }
`;
