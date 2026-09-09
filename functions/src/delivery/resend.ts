import { RESEND_API_ENDPOINT } from '../config.js';
import type { DeliveryAdapter, DeliveryFailureKind, DeliveryResult, SendInput } from './adapter.js';

type SendResponse = Pick<Response, 'ok' | 'status' | 'json' | 'text'>;

interface ResendAdapterOptions {
  apiKey: string;
  from: string;
  fetchImpl?: (input: RequestInfo | URL, init?: RequestInit) => Promise<SendResponse>;
}

export function createResendAdapter(options: ResendAdapterOptions): DeliveryAdapter {
  const request: (input: RequestInfo | URL, init?: RequestInit) => Promise<SendResponse> =
    options.fetchImpl ?? fetch;
  return {
    async send(input: SendInput): Promise<DeliveryResult> {
      let response: SendResponse;
      try {
        response = await request(RESEND_API_ENDPOINT, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${options.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: options.from,
            to: input.to,
            subject: input.subject,
            html: input.html,
            text: input.text,
          }),
        });
      } catch (error) {
        return {
          ok: false,
          kind: 'network',
          message: error instanceof Error ? error.message : 'Delivery request failed',
        };
      }

      if (response.ok) {
        const body = (await response.json().catch(() => null)) as { id?: string } | null;
        if (!body?.id) {
          return { ok: false, kind: 'provider', message: 'Provider returned no message id' };
        }
        return { ok: true, messageId: body.id };
      }

      const kind: DeliveryFailureKind = classifyStatus(response.status);
      const detail = await response.text().catch(() => '');
      return {
        ok: false,
        kind,
        message: `Email provider returned ${response.status}${detail ? `: ${detail}` : ''}`,
      };
    },
  };
}

function classifyStatus(status: number): DeliveryFailureKind {
  if (status === 422 || status === 400) {
    return 'invalid-input';
  }
  if (status >= 500) {
    return 'provider';
  }
  return 'rejected';
}
