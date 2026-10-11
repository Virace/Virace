import { readFile, writeFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { XMLParser, XMLValidator } from 'fast-xml-parser';
import { escapeXml, renderLatest, renderNotebook, themes } from './cards.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const feedUrl = 'https://x-item.com/rss.xml';

export function parseFeed(xml) {
  if (Buffer.byteLength(xml) > 2 * 1024 * 1024 || /<!DOCTYPE|<!ENTITY/i.test(xml)) {
    throw new Error('RSS 超过大小限制，或包含不支持的自定义实体');
  }
  const valid = XMLValidator.validate(xml);
  if (valid !== true) throw new Error(`RSS XML 无效：${valid.err.msg}`);
  const parser = new XMLParser({ parseTagValue: false, trimValues: true, isArray: name => name === 'item' });
  const feed = parser.parse(xml);
  const items = feed.rss?.channel?.item;
  if (!Array.isArray(items)) throw new Error('RSS 中没有文章');
  const posts = items.flatMap(item => {
    if (typeof item.title !== 'string' || !item.title.trim()) return [];
    const published = Date.parse(item.pubDate);
    if (!Number.isFinite(published)) return [];
    let url;
    try { url = new URL(item.link); } catch { return []; }
    if (url.origin !== new URL(feedUrl).origin || url.username || url.password) return [];
    // 发布日沿用 RSS 的 GMT 日期，避免运行机器的时区改变博客日期。
    const date = new Date(published).toISOString().slice(0, 10);
    return [{ title: item.title.trim(), link: url.href, date, published }];
  });
  // RSS 会把置顶旧文放在前面，最新文章必须按发布日期选取。
  posts.sort((left, right) => right.published - left.published);
  if (!posts.length) throw new Error('RSS 中没有标题、发布日期和站内链接均有效的文章');
  return posts[0];
}

async function fetchText(url, options = {}) {
  const response = await fetch(url, { ...options, signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`${new URL(url).hostname} 返回 HTTP ${response.status}`);
  return response.text();
}

function latestLink(note) {
  return `  <a href="${escapeXml(note.link)}">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="assets/latest-note-dark.svg">
      <img src="assets/latest-note-light.svg" width="320" alt="${escapeXml(`最近一篇：${note.title}，${note.date}`)}">
    </picture>
  </a>`;
}

async function writeChanged(path, content) {
  let old = '';
  try { old = await readFile(path, 'utf8'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (old === content) return false;
  await writeFile(path, content);
  return true;
}

export async function updateProfile(options = {}) {
  const xml = options.feed ? await readFile(options.feed, 'utf8') : await fetchText(feedUrl);
  const note = parseFeed(xml);
  const readme = await readFile(resolve(root, 'README.md'), 'utf8');
  const marker = /(^[ \t]*<!-- latest-note:start -->)\r?\n[\s\S]*?\r?\n([ \t]*<!-- latest-note:end -->)/gm;
  if ([...readme.matchAll(marker)].length !== 1) throw new Error('README 的最新文章更新区域必须存在且唯一');
  const nextReadme = readme.replace(marker, (_match, start, end) => `${start}\n${latestLink(note)}\n${end}`);
  const outputs = new Map([['README.md', nextReadme]]);
  for (const [name, theme] of Object.entries(themes)) {
    outputs.set(`assets/notebook-${name}.svg`, renderNotebook(theme));
    outputs.set(`assets/latest-note-${name}.svg`, renderLatest(note, theme));
  }
  // 所有远端数据与更新区域均校验后才写文件，失败时保留上次的卡片。
  let changed = 0;
  for (const [path, content] of outputs) {
    if (await writeChanged(resolve(root, path), content)) changed++;
  }
  console.log(`最新文章：${note.title} (${note.date})`);
  console.log(`更新了 ${changed} 个文件`);
  return { note, changed };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { values } = parseArgs({ options: { feed: { type: 'string' } } });
  updateProfile(values).catch(error => {
    console.error(`主页更新失败：${error.message}`);
    process.exitCode = 1;
  });
}
