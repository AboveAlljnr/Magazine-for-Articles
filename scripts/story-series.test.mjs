import test from 'node:test';
import assert from 'node:assert/strict';
import { orderSeriesChapters, storySeries } from '../src/app/lib/story-series.ts';

test('chapters follow editorial order, not query order', () => {
  const rows = [{ slug: 'third' }, { slug: 'first' }, { slug: 'second' }];
  assert.deepEqual(orderSeriesChapters(['first', 'second', 'third'], rows).map(r => r.slug), ['first', 'second', 'third']);
});
test('missing or unpublished chapters do not create links or placeholders', () => {
  assert.deepEqual(orderSeriesChapters(['first', 'draft', 'last'], [{ slug: 'last' }, { slug: 'unrelated' }, { slug: 'first' }]).map(r => r.slug), ['first', 'last']);
  assert.deepEqual(orderSeriesChapters(['draft'], []), []);
});
test('series definitions have unique slugs and unambiguous chapter membership', () => {
  assert.equal(new Set(storySeries.map(s => s.slug)).size, storySeries.length);
  const chapters = storySeries.flatMap(s => s.articles);
  assert.equal(new Set(chapters).size, chapters.length);
});
