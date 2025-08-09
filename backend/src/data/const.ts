export const RouteNames = Object.freeze({
  BATTLES_WS: "/ws/battles",
  BATTLES_API: "/v1/battles",
  DATA_API: "/v1/data",
  PATHFINDER_API: "/v1/pathfinder",
  DAILY_API: "/v1/daily",
});

export enum StatusCode {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}
