import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const js = readFileSync(new URL('../assets/site.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../assets/refinements.css', import.meta.url), 'utf8');
const root = new URL('../', import.meta.url).pathname;
test('script parses without dependencies', () => { new vm.Script(js); });
test('one main, H1 and live enquiry destination; no preview test code', () => {
  assert.equal((html.match(/<main\b/g) || []).length, 1);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.equal((html.match(/<form\b/g) || []).length, 1);
  assert.match(html, /action="https:\/\/formspree.io\/f\/xyknjkbk"/);
  assert.doesNotMatch(html, /__qa|window\.fetch\s*=|analytics_error/);
});
test('all element IDs unique and internal links resolve', () => {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  assert.equal(ids.length, new Set(ids).size);
  for (const match of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(match[1]), match[1]);
});
test('production local assets exist', () => {
  for (const match of html.matchAll(/(?:src|href)="((?:\.\/|\/)assets\/[^"?]+)"/g)) assert.ok(existsSync(resolve(root, match[1].replace(/^\.?\//, ''))), match[1]);
});
test('unit selections, form options and full floorplans match', () => {
  const selections = [...html.matchAll(/data-unit="([^"]+)"/g)].map(m => m[1]);
  assert.equal(selections.length, 10);
  assert.equal(new Set(selections).size, 10);
  selections.forEach(value => assert.ok(html.includes(`<option>${value}</option>`)));
  assert.equal((html.match(/class="floorplan-link"/g) || []).length, 10);
  assert.doesNotMatch(html.slice(html.indexOf('<!-- UNITS -->')), /Capital Value|Projected Value|Capital Gain/);
});
test('three required first-step fields; optional second-step preferences', () => {
  const step1 = html.split('<fieldset id="enquiryStep1"')[1].split('</fieldset>')[0];
  const step2 = html.split('<fieldset id="enquiryStep2"')[1].split('</fieldset>')[0];
  assert.equal((step1.match(/\srequired(?:\s|\/>)/g) || []).length, 3);
  assert.doesNotMatch(step2, /\srequired(?:\s|\/>)/);
  const form = html.split('<form ')[1].split('</form>')[0];
  for (const match of form.matchAll(/<(input|select|textarea)\b([^>]+)>/g)) {
    if (match[2].includes('type="hidden"')) continue;
    const id = match[2].match(/id="([^"]+)"/)[1];
    assert.ok(form.includes(`for="${id}"`), `Unlabelled field ${id}`);
  }
});
test('payment amounts use the same stated calculation', () => {
  const prices = [1750000,3500000,7000000,12000000,16500000];
  const table = html.split('<table class="capital-table"')[1].split('</table>')[0];
  for (const price of prices) {
    const monthly = Math.round(price * .8 / 24).toLocaleString('en-KE');
    assert.ok(table.includes(`KES ${monthly}`), monthly);
  }
});
test('structured data and canonical domain remain present', () => {
  const ld = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.equal(ld['@type'], 'ApartmentComplex');
  assert.match(html, /rel="canonical" href="https:\/\/www.prestigiousresidence.co.ke\/"/);
});
test('visible by default, accessible hiding and reduced-motion rules', () => {
  assert.match(css, /\[hidden\] \{ display: none !important;/);
  assert.match(css, /\.fade-up, \.fade-up.visible \{ opacity: 1/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(html, /<dialog class="mobile-nav"/);
  assert.doesNotMatch(html, /onclick=/);
});
