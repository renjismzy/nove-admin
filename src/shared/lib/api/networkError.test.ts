import { describe, expect, it } from 'vitest';
import { isNetworkError } from './networkError';

function axiosError(overrides: Record<string, unknown> = {}) {
  return Object.assign(new Error('request failed'), {
    isAxiosError: true,
    name: 'AxiosError',
    ...overrides,
  });
}

describe('isNetworkError', () => {
  it('treats a request without any HTTP response as a network error', () => {
    expect(isNetworkError(axiosError({ code: 'ERR_NETWORK' }))).toBe(true);
    expect(isNetworkError(axiosError())).toBe(true);
  });

  it('treats axios timeout codes as network errors', () => {
    expect(isNetworkError(axiosError({ code: 'ECONNABORTED' }))).toBe(true);
    expect(isNetworkError(axiosError({ code: 'ETIMEDOUT' }))).toBe(true);
  });

  it('does not treat HTTP responses as network errors', () => {
    expect(isNetworkError(axiosError({ response: { status: 302 } }))).toBe(false);
    expect(isNetworkError(axiosError({ response: { status: 304 } }))).toBe(false);
    expect(isNetworkError(axiosError({ response: { status: 401 } }))).toBe(false);
    expect(isNetworkError(axiosError({ response: { status: 403 } }))).toBe(false);
    expect(isNetworkError(axiosError({ response: { status: 500 } }))).toBe(false);
  });

  it('does not treat non-axios failures as network errors', () => {
    expect(isNetworkError(new TypeError('crypto.randomUUID is not a function'))).toBe(false);
    expect(isNetworkError(new Error('刷新令牌响应缺少 accessToken'))).toBe(false);
    expect(isNetworkError('Network Error')).toBe(false);
    expect(isNetworkError(undefined)).toBe(false);
  });
});
