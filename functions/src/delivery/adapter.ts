export interface SendInput {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export type DeliveryFailureKind = 'rejected' | 'provider' | 'network' | 'invalid-input';

export type DeliveryResult =
  { ok: true; messageId: string } | { ok: false; kind: DeliveryFailureKind; message: string };

/**
 * Narrow transactional-email delivery contract. Provider credentials and
 * sender identity stay out of source control and are supplied at runtime.
 */
export interface DeliveryAdapter {
  send(input: SendInput): Promise<DeliveryResult>;
}
