import axios from 'axios';

/** axios 因超时中断请求时使用的错误码。 */
const TIMEOUT_ERROR_CODES = new Set(['ECONNABORTED', 'ETIMEDOUT']);

/**
 * 判断失败是否属于「网络错误 / 超时」。
 *
 * 成立的情况只有两种：
 * 1. axios 因超时中断请求（ECONNABORTED / ETIMEDOUT）；
 * 2. 请求没拿到任何 HTTP 响应（离线、DNS 失败、TLS 失败、CORS 被拦、
 *    网关跳转无法完成等）。
 *
 * 只要拿到了响应，哪怕状态码是 3xx / 4xx / 5xx，也说明请求已经到达服务端，
 * 不算网络错误；非 axios 的失败（拦截器里的 TypeError、localStorage 的
 * SecurityError 等）同样返回 false。
 */
export function isNetworkError(error: unknown): boolean {
  if (!axios.isAxiosError(error)) {
    return false;
  }

  if (error.code && TIMEOUT_ERROR_CODES.has(error.code)) {
    return true;
  }

  return !error.response;
}
