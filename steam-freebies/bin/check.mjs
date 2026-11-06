#!/usr/bin/env node
// Steam free-to-keep offers and third-party Steam key giveaways.
// Usage: node check.mjs [--state <dir>] [--cc tw] [--lang tchinese] [--commit]
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
const locale = new URLSearchParams({ cc: values.cc, l: values.lang }).toString();
const steamUrl = (path) => `https://store.steampowered.com${path}${path.includes('?') ? '&' : '?'}${locale}`;
const seenPath = resolve(dir, 'seen.json');
const pendingPath = resolve(dir, 'pending.json');
const PRUNE_DAYS = 30; // 連續 30 天沒再出現就忘掉，之後再限免會當新的推
const load = (p, d) => (existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : d);
const save = (p, v) => writeFileSync(p, JSON.stringify(v, null, 2) + '\n');
const UA = { 'User-Agent': 'Mozilla/5.0 steam-freebies', Cookie: 'birthtime=0; wants_mature_content=1; lastagecheckage=1-0-1990' };
const tw = (sec) => new Date(sec * 1000).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei', month: 'numeric', day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false });

async function get(url, json = true) {
  const r = await fetch(url, { headers: UA, signal: AbortSignal.timeout(20000) });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return json ? r.json() : r.text();
}

async function steamStore() {
  const out = [];
  const d = await get(steamUrl('/search/results/?query&start=0&count=100&maxprice=free&specials=1&infinite=1'));
  const ids = [...d.results_html.matchAll(/data-ds-appid="(\d+)"/g)].map((m) => m[1]);
  for (const id of [...new Set(ids)]) {
    try {
      const { data: det } = (await get(steamUrl(`/api/appdetails?appids=${id}`)))[id] ?? {};
      if (!det || det.price_overview?.discount_percent !== 100) continue;
      const page = await get(steamUrl(`/app/${id}/`), false);
      const ends = page.match(/free_to_keep_ends&quot;:(\d+)/)?.[1];
      out.push({
        key: `steam:${id}`, source: 'Steam 商店', type: det.type === 'dlc' ? 'DLC' : det.type === 'game' ? '遊戲' : det.type,
        title: det.name, base_game: det.fullgame?.name ?? null, worth: det.price_overview.initial_formatted,
        ends: ends ? tw(+ends) : null, url: steamUrl(`/app/${id}/`),
        genres: (det.genres ?? []).map((g) => g.description).slice(0, 3), intro: clean(det.short_description),
      });
    } catch (e) { out.push({ key: `steam:${id}`, error: String(e.message ?? e) }); }
  }
  return out;
}

const clean = (t) => (t ?? '').replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

// 用名稱在 Steam 商店找同款，補上中文介紹與類型
async function steamInfoByTitle(title) {
  const s = await get(steamUrl(`/api/storesearch/?term=${encodeURIComponent(title)}`));
  const norm = (t) => t.toLowerCase().replace(/[^a-z0-9]/g, '');
  const hit = s.items?.find((i) => norm(i.name) === norm(title)) ?? s.items?.[0];
  if (!hit) return {};
  const { data: det } = (await get(steamUrl(`/api/appdetails?appids=${hit.id}`)))[hit.id] ?? {};
  if (!det) return {};
  return { intro: clean(det.short_description), genres: (det.genres ?? []).map((g) => g.description).slice(0, 3), steam_url: steamUrl(`/app/${hit.id}/`), steam_name: det.name };
}

async function gamerPower() {
  const r = await fetch('https://www.gamerpower.com/api/giveaways?platform=steam&type=game', { signal: AbortSignal.timeout(20000) });
  if (r.status === 201) return []; // 目前沒有
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const list = await r.json();
  const items = list.map((g) => ({
    key: `gp:${g.id}`, source: '第三方序號贈送', type: '遊戲', title: g.title.replace(/\s*\((Steam)\)|\s*Steam Key Giveaway|\s*Key Giveaway/gi, '').trim(),
    worth: g.worth === 'N/A' ? null : g.worth,
    ends: g.end_date === 'N/A' ? null : tw(Date.parse(g.end_date.replace(' ', 'T') + 'Z') / 1000),
    url: g.open_giveaway_url, how_to_claim: clean(g.instructions).slice(0, 300), gp_description: clean(g.description).slice(0, 300),
  }));
  for (const it of items) { try { Object.assign(it, await steamInfoByTitle(it.title)); } catch {} }
  return items;
}

const now = new Date().toISOString();
if (values.commit) {
  const seen = load(seenPath, {}), pending = load(pendingPath, { items: [] });
  for (const it of pending.items) seen[it.key] = { title: it.title, first: now, last: now };
  save(seenPath, seen); save(pendingPath, { items: [] });
  console.log(JSON.stringify({ committed: pending.items.length }));
} else {
  const errors = [];
  const results = (await Promise.all([steamStore().catch((e) => (errors.push(`steam: ${e.message}`), [])), gamerPower().catch((e) => (errors.push(`gamerpower: ${e.message}`), []))])).flat();
  for (const r of results.filter((x) => x.error)) errors.push(`${r.key}: ${r.error}`);
  const active = results.filter((x) => !x.error);
  const seen = load(seenPath, {});
  for (const it of active) if (seen[it.key]) seen[it.key].last = now; // 還在送的舊項目
  for (const [k, v] of Object.entries(seen)) if (Date.now() - Date.parse(v.last) > PRUNE_DAYS * 864e5) delete seen[k];
  save(seenPath, seen);
  // 第三方序號跟 Steam 商店同一款時只留商店那筆
  const storeTitles = new Set(active.filter((x) => x.key.startsWith('steam:')).map((x) => x.title.toLowerCase()));
  const fresh = active.filter((x) => !seen[x.key] && !(x.key.startsWith('gp:') && storeTitles.has(x.title.toLowerCase())));
  save(pendingPath, { at: now, items: fresh });
  console.log(JSON.stringify({ new: fresh, already_pushed_still_active: active.length - fresh.length, errors }, null, 1));
}
