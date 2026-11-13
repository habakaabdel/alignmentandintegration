import { test } from 'node:test';
import assert from 'node:assert/strict';
import handler, { inQuebec, markQuebec } from '../../../netlify/edge-functions/visitor-region.js';

const PAGE = '<!DOCTYPE html>\n<html lang="en-CA">\n<head><title>t</title></head>\n<body>x</body>\n</html>\n';

function context(geo, body, type) {
  return {
    geo: geo,
    next: async function () {
      return new Response(body, { status: 200, headers: { 'content-type': type, 'content-length': String(body.length) } });
    }
  };
}

test('inQuebec is true only for Canada and the QC subdivision', function () {
  assert.equal(inQuebec({ country: { code: 'CA' }, subdivision: { code: 'QC' } }), true);
  assert.equal(inQuebec({ country: { code: 'CA' }, subdivision: { code: 'ON' } }), false);
  assert.equal(inQuebec({ country: { code: 'US' }, subdivision: { code: 'QC' } }), false);
  assert.equal(inQuebec({ country: { code: 'CA' } }), false);
  assert.equal(inQuebec(undefined), false);
});

test('markQuebec adds one attribute to the html tag and nothing else', function () {
  const out = markQuebec(PAGE);
  assert.equal(out, PAGE.replace('<html lang="en-CA">', '<html lang="en-CA" data-region="QC">'));
  assert.equal(markQuebec('<html>'), '<html data-region="QC">');
  assert.equal(markQuebec('<HTML LANG="fr">'), '<html LANG="fr" data-region="QC">');
});

test('markQuebec does not mark twice and leaves pages without an html tag alone', function () {
  const once = markQuebec(PAGE);
  assert.equal(markQuebec(once), once);
  assert.equal(markQuebec('plain text'), 'plain text');
});

test('a visitor outside Quebec gets the response untouched', async function () {
  const res = await handler(new Request('https://example.test/'), context({ country: { code: 'CA' }, subdivision: { code: 'ON' } }, PAGE, 'text/html; charset=utf-8'));
  assert.equal(await res.text(), PAGE);
  assert.equal(res.headers.get('content-length'), String(PAGE.length));
});

test('a visitor in Quebec gets the marked page with the length header dropped', async function () {
  const res = await handler(new Request('https://example.test/'), context({ country: { code: 'CA' }, subdivision: { code: 'QC' } }, PAGE, 'text/html; charset=utf-8'));
  const text = await res.text();
  assert.match(text, /<html lang="en-CA" data-region="QC">/);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('content-length'), null);
  assert.match(res.headers.get('content-type'), /text\/html/);
});

test('a non-HTML response is passed through even for Quebec', async function () {
  const css = 'body{color:red}';
  const res = await handler(new Request('https://example.test/styles.css'), context({ country: { code: 'CA' }, subdivision: { code: 'QC' } }, css, 'text/css'));
  assert.equal(await res.text(), css);
});
