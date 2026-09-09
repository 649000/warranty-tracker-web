export interface DigestLine {
  productId: string;
  productName: string;
  expiry: Date;
  daysAhead: number;
}

export interface RenderedDigest {
  subject: string;
  html: string;
  text: string;
}

const DATE_FORMATTER = new Intl.DateTimeFormat('en-SG', {
  timeZone: 'Asia/Singapore',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export function formatSingaporeDate(value: Date): string {
  return DATE_FORMATTER.format(value);
}

function remainingLabel(daysAhead: number): string {
  return daysAhead === 0 ? 'expires today' : `expires in ${daysAhead} days`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function link(productId: string, productName: string, origin: string): string {
  return `${origin}/warranties/${encodeURIComponent(productId)}`;
}

export function renderDigest(
  origin: string,
  dateLabel: string,
  lines: DigestLine[],
): RenderedDigest {
  const subject = `Warranty expiry reminder for ${dateLabel}`;

  const textLines = lines.map((line) => {
    const url = link(line.productId, line.productName, origin);
    const date = DATE_FORMATTER.format(line.expiry);
    return `- ${line.productName} (${remainingLabel(line.daysAhead)}, ${date}): ${url}`;
  });
  const text = `${subject}\n\n${textLines.join('\n')}`;

  const items = lines
    .map((line) => {
      const url = link(line.productId, line.productName, origin);
      const date = DATE_FORMATTER.format(line.expiry);
      return `<li><a href="${escapeHtml(url)}">${escapeHtml(line.productName)}</a> ${escapeHtml(remainingLabel(line.daysAhead))} (${escapeHtml(date)}).</li>`;
    })
    .join('');
  const html = `<h1>${escapeHtml(subject)}</h1><p>The following warranty coverage is expiring soon:</p><ul>${items}</ul><p>Sign in to your warranty tracker to review details.</p>`;

  return { subject, html, text };
}
