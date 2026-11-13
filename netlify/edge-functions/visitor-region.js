/* Alignment Integration
   Marks the page for a visitor Netlify places in Quebec, so the visitor
   identification loader in main.js stays off for them until they turn it on
   on the privacy page. The mark is one attribute on the <html> tag of this one
   response: nothing is stored, no cookie is set, and every other visitor gets
   the page exactly as published. Runs on the HTML pages only (see netlify.toml). */

export const QUEBEC_MARK = ' data-region="QC"';

export function inQuebec(geo) {
  return Boolean(
    geo &&
    geo.country && geo.country.code === 'CA' &&
    geo.subdivision && geo.subdivision.code === 'QC'
  );
}

export function markQuebec(html) {
  return html.replace(/<html(\s[^>]*)?>/i, function (tag, attrs) {
    if (/\sdata-region=/i.test(tag)) return tag;
    return '<html' + (attrs || '') + QUEBEC_MARK + '>';
  });
}

export default async function (request, context) {
  if (!inQuebec(context.geo)) return context.next();

  const response = await context.next();
  const type = response.headers.get('content-type') || '';
  if (!type.includes('text/html')) return response;

  const html = await response.text();
  const headers = new Headers(response.headers);
  headers.delete('content-length');
  headers.delete('content-encoding');
  return new Response(markQuebec(html), {
    status: response.status,
    statusText: response.statusText,
    headers: headers
  });
}
