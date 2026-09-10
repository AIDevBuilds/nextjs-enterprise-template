import { decodeJwtPayload, isJwtExpired } from '@/shared/lib/auth/jwt';

function b64url(value: object): string {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function makeJwt(payload: object): string {
  return `${b64url({ alg: 'HS256', typ: 'JWT' })}.${b64url(payload)}.signature`;
}

const HOUR = 60 * 60;
const nowSeconds = () => Math.floor(Date.now() / 1000);

describe('decodeJwtPayload', () => {
  it('decodes the payload segment', () => {
    expect(decodeJwtPayload(makeJwt({ sub: 'user-1', role: 'admin' }))).toEqual({
      sub: 'user-1',
      role: 'admin',
    });
  });

  it('returns null for a non-JWT string', () => {
    expect(decodeJwtPayload('not-a-jwt')).toBeNull();
    expect(decodeJwtPayload('only.two')).toBeNull();
  });

  it('returns null when the payload is not valid base64 JSON', () => {
    expect(decodeJwtPayload('header.!!!not-base64!!!.sig')).toBeNull();
  });
});

describe('isJwtExpired', () => {
  it('is false for a token expiring in the future', () => {
    expect(isJwtExpired(makeJwt({ exp: nowSeconds() + HOUR }))).toBe(false);
  });

  it('is true for a token that already expired', () => {
    expect(isJwtExpired(makeJwt({ exp: nowSeconds() - HOUR }))).toBe(true);
  });

  it('is false when there is no exp claim (opaque token — API is the authority)', () => {
    expect(isJwtExpired(makeJwt({ sub: 'user-1' }))).toBe(false);
  });

  it('is false for an unparseable token rather than locking the user out', () => {
    expect(isJwtExpired('opaque-session-token')).toBe(false);
  });
});
