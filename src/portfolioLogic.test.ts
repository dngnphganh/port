import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const portfolio = require('../script.js') as {
  TOTAL_PAGES: number;
  clampPageIndex: (index: unknown, totalPages?: number) => number;
  computeReadingProgress: (currentIndex: number, totalPages?: number) => number;
  getActiveChapterKey: (viewMode: string, pageIndex: number) => string;
  normalizeTheme: (theme: unknown) => string;
  isSafeExternalUrl: (url: unknown) => boolean;
};

test('clampPageIndex clamps out-of-range and invalid inputs safely', () => {
  assert.equal(portfolio.clampPageIndex(-3, 8), 0);
  assert.equal(portfolio.clampPageIndex(0, 8), 0);
  assert.equal(portfolio.clampPageIndex(4, 8), 4);
  assert.equal(portfolio.clampPageIndex(99, 8), 7);
  assert.equal(portfolio.clampPageIndex(Number.NaN, 8), 0);
});

test('computeReadingProgress returns accurate percentage across 8 pages', () => {
  assert.equal(portfolio.computeReadingProgress(0, 8), 13);
  assert.equal(portfolio.computeReadingProgress(3, 8), 50);
  assert.equal(portfolio.computeReadingProgress(7, 8), 100);
});

test('getActiveChapterKey maps cover, Ch1, Ch2 (6 exercises), and Ch3 correctly', () => {
  assert.equal(portfolio.getActiveChapterKey('cover', 0), 'cover');
  assert.equal(portfolio.getActiveChapterKey('magazine', 0), '0');
  assert.equal(portfolio.getActiveChapterKey('magazine', 1), '1');
  assert.equal(portfolio.getActiveChapterKey('magazine', 6), '1');
  assert.equal(portfolio.getActiveChapterKey('magazine', 7), '7');
});

test('normalizeTheme defaults safely to light unless dark is specified', () => {
  assert.equal(portfolio.normalizeTheme('dark'), 'dark');
  assert.equal(portfolio.normalizeTheme('light'), 'light');
  assert.equal(portfolio.normalizeTheme('unexpected'), 'light');
});

test('isSafeExternalUrl accepts http/https and rejects javascript: or empty URLs', () => {
  assert.equal(portfolio.isSafeExternalUrl('https://docs.google.com/document/d/123'), true);
  assert.equal(portfolio.isSafeExternalUrl('http://example.com'), true);
  assert.equal(portfolio.isSafeExternalUrl('javascript:alert(1)'), false);
  assert.equal(portfolio.isSafeExternalUrl('   '), false);
});
