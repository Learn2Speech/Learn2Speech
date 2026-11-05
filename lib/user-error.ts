// Errors whose message is safe to show the user. Anything else (a TypeError, a network error with a
// hostname) is replaced with a generic message before it leaves the server.
export class UserFacingError extends Error {}
