export const RouteNames = Object.freeze({
  BATTLES_WS: "/ws/battles",
  DATA_ENDPOINT: "/v1/data",
});

export enum StatusCode {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}
