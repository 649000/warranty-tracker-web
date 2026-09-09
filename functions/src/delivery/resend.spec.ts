import { describe, expect, it, vi } from 'vitest';
import { createResendAdapter } from './resend.js';

interface FakeResponse {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
  text: () => Promise<string>;
}

function adapterFor(response: FakeResponse | Error) {
  const fetchImpl = vi.fn(async () => {
    if (response instanceof Error) {
      throw response;
    }
    return response;
  });
  const adapter = createResendAdapter({
    apiKey: 'secret',
    from: 'no-reply@example.com',
    fetchImpl,
  });
  return { adapter, fetchImpl };
}

function okResponse(id = 'msg-123'): FakeResponse {
  return { ok: true, status: 200, json: async () => ({ id }), text: async () => '' };
}

function errorResponse(status: number): FakeResponse {
  return { ok: false, status, json: async () => ({}), text: async () => 'nope' };
}

const input = { to: 'a@example.com', subject: 's', html: '<p>x</p>', text: 'x' };

describe('resend adapter', () => {
  it('returns a message id on success and sends the expected request', async () => {
    const { adapter, fetchImpl } = adapterFor(okResponse());
    const result = await adapter.send(input);
    expect(result).toEqual({ ok: true, messageId: 'msg-123' });
    const [url, options] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://api.resend.com/emails');
    expect(options.headers).toMatchObject({
      Authorization: 'Bearer secret',
      'Content-Type': 'application/json',
    });
    const body = JSON.parse(String(options.body));
    expect(body).toMatchObject({
      from: 'no-reply@example.com',
      to: 'a@example.com',
      subject: 's',
      html: '<p>x</p>',
      text: 'x',
    });
  });

  it('fails when the provider omits a message id', async () => {
    const { adapter } = adapterFor(okResponse(''));
    const result = await adapter.send(input);
    expect(result.ok).toBe(false);
  });

  it('classifies 4xx as rejected and 422 as invalid input', async () => {
    const rejected = await adapterFor(errorResponse(401)).adapter.send(input);
    expect(rejected).toMatchObject({ ok: false, kind: 'rejected' });

    const invalid = await adapterFor(errorResponse(422)).adapter.send(input);
    expect(invalid).toMatchObject({ ok: false, kind: 'invalid-input' });
  });

  it('classifies 5xx as provider errors', async () => {
    const result = await adapterFor(errorResponse(503)).adapter.send(input);
    expect(result).toMatchObject({ ok: false, kind: 'provider' });
  });

  it('classifies network failures', async () => {
    const { adapter } = adapterFor(new Error('socket hang up'));
    const result = await adapter.send(input);
    expect(result).toMatchObject({ ok: false, kind: 'network' });
  });
});
