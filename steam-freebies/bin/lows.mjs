#!/usr/bin/env node
// Steam wishlist games and well-reviewed games in chosen tags that are at their all-time low.
// Usage: node lows.mjs [--state <dir>] [--cc tw] [--lang tchinese] [--commit]
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { resolve } from 'node:path';
import { parseArgs } from 'node:util';

const { values } = parseArgs({ options: {
  state: { type: 'string' }, cc: { type: 'string', default: 'tw' },
  lang: { type: 'string', default: 'tchinese' }, commit: { type: 'boolean', default: false },
} });
const dir = resolve(values.state ?? resolve(process.env.XDG_STATE_HOME || resolve(homedir(), '.local/state'), 'steam-freebies'));
mkdirSync(dir, { recursive: true });
const load = (p, d) => (existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : d);
const save = (p, v) => writeFileSync(p, JSON.stringify(v, null, 2) + '\n');
const seenPath = resolve(dir, 'lows-seen.json');
const pendingPath = resolve(dir, 'lows-pending.json');
const PRUNE_DAYS = 30; // an announced price is forgotten after 30 days, so a later sale is announced again
const seen = load(seenPath, {});
const today = new Date().toISOString().slice(0, 10);

if (values.commit) {
  const pending = load(pendingPath, []);
  const cutoff = new Date(Date.now() - PRUNE_DAYS * 864e5).toISOString().slice(0, 10);
  for (const [key, date] of Object.entries(seen)) if (date < cutoff) delete seen[key];
  for (const key of pending) seen[key] = today;
  save(seenPath, seen);
  save(pendingPath, []);
  console.log(JSON.stringify({ committed: pending.length }));
  process.exit(0);
}

const config = load(resolve(dir, 'lows-config.json'), null);
if (!config) throw new Error(`missing ${resolve(dir, 'lows-config.json')}`);
const owned = new Set((config.owned ?? []).map((g) => String(g.appid)));
const wished = new Set((config.wishlist ?? []).map((g) => String(g.appid)));
const PICKS = 8, CANDIDATES = 30; // only the 30 most-reviewed tag matches are priced on CheapShark
const MIN_PERCENT = 80, MIN_REVIEWS = 100; // Steam search reports reviews in the store language only
const MIN_TAGS = 2; // a pick must carry at least two of the configured tags, so one broad tag does not pull in unrelated games
const wanted = new Set(config.tags ?? []);
const errors = [];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const last = {};
async function get(host, path, params, gap) {
  await sleep(Math.max(0, gap - (Date.now() - (last[host] ?? 0))));
  last[host] = Date.now();
  const url = `https://${host}/${path}?${new URLSearchParams(params)}`;
  const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 steam-freebies' }, signal: AbortSignal.timeout(20000) });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.json();
}
const steam = (path, params) => get('store.steampowered.com', path, { ...params, cc: values.cc, l: values.lang }, 300);
// CheapShark rate-limits hard: one request per second, and a 429 blocks the client for about an hour.
const shark = (path, params) => get('www.cheapshark.com', `api/1.0/${path}`, params, 1000);

async function steamInfo(id) {
  const d = (await steam('api/appdetails', { appids: id }))[id];
  if (!d?.success) throw new Error(`no Steam store data for ${id}`);
  return d.data;
}
async function onSale(ids) {
  const deals = [];
  for (const id of ids) {
    const deal = (await shark('deals', { storeID: 1, steamAppID: id })).find((d) => d.steamAppID === String(id));
    if (deal?.isOnSale === '1') deals.push(deal);
  }
  return deals;
}
async function allTimeLows(deals) {
  const lows = {};
  for (let i = 0; i < deals.length; i += 25) {
    const res = await shark('games', { ids: deals.slice(i, i + 25).map((d) => d.gameID).join(',') });
    for (const [id, g] of Object.entries(res)) lows[id] = Number(g.cheapestPriceEver.price);
  }
  return lows;
}
function entry(info, deal, low) {
  const p = info.price_overview;
  return {
    appid: Number(deal.steamAppID), name: info.name,
    price: p?.final_formatted ?? null, original_price: p?.initial_formatted || null, discount_percent: p?.discount_percent ?? 0,
    usd_price: Number(deal.salePrice), usd_all_time_low: low,
    reviews: `${deal.steamRatingPercent}% of ${deal.steamRatingCount}`,
    genres: (info.genres ?? []).map((g) => g.description), intro: info.short_description ?? '',
    url: `https://store.steampowered.com/app/${deal.steamAppID}/`, key: `${deal.steamAppID}:${deal.salePrice}`,
  };
}

const wishlist_lows = [], wishlist_sales = [], picks = [];
try {
  const deals = await onSale([...wished]);
  const lows = await allTimeLows(deals);
  for (const deal of deals) {
    try {
      const e = entry(await steamInfo(deal.steamAppID), deal, lows[deal.gameID]);
      if (e.usd_price > e.usd_all_time_low) wishlist_sales.push(e);
      else if (!seen[e.key]) wishlist_lows.push(e);
    } catch (e) { errors.push({ source: 'wishlist', appid: Number(deal.steamAppID), error: e.message }); }
  }
} catch (e) { errors.push({ source: 'wishlist', error: e.message }); }

const candidates = new Map();
for (const tag of config.tags ?? []) {
  try {
    for (let start = 0; ; start += 100) {
      const page = await steam('search/results/', { specials: 1, tags: tag, infinite: 1, start, count: 100 });
      for (const row of page.results_html.split('data-ds-appid="').slice(1)) {
        const id = row.slice(0, row.indexOf('"'));
        const tags = JSON.parse(row.match(/data-ds-tagids="(\[[\d,]*\])"/)?.[1] ?? '[]');
        if (tags.filter((t) => wanted.has(t)).length < MIN_TAGS) continue;
        const tip = row.match(/search_review_summary[^>]*data-tooltip-html="([^"]*)"/)?.[1];
        const percent = tip?.match(/(\d+)%/)?.[1];
        const count = Number(tip?.replace(/\d+%/, '').match(/\d[\d,]*/)?.[0].replaceAll(',', ''));
        if (!percent || owned.has(id) || wished.has(id)) continue;
        if (Number(percent) >= MIN_PERCENT && count >= MIN_REVIEWS) candidates.set(id, count);
      }
      if (start + 100 >= page.total_count) break;
    }
  } catch (e) { errors.push({ source: `steam-tag-${tag}`, error: e.message }); }
}
try {
  const top = [...candidates].sort((a, b) => b[1] - a[1]).slice(0, CANDIDATES).map(([id]) => id);
  const deals = (await onSale(top)).filter((d) => !seen[`${d.steamAppID}:${d.salePrice}`]);
  const lows = await allTimeLows(deals);
  for (const deal of deals) {
    if (Number(deal.salePrice) > lows[deal.gameID]) continue;
    const info = await steamInfo(deal.steamAppID);
    if (info.type !== 'game') continue;
    picks.push(entry(info, deal, lows[deal.gameID]));
    if (picks.length === PICKS) break;
  }
} catch (e) { errors.push({ source: 'picks', error: e.message }); }

save(pendingPath, [...wishlist_lows, ...picks].map((e) => e.key));
console.log(JSON.stringify({ wishlist_lows, wishlist_sales, picks, errors }, null, 2));
