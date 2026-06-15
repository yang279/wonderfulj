#!/usr/bin/env node
'use strict';

const BASE_URL = process.env.ICON_API_URL || 'http://localhost:3104';

const args = process.argv.slice(2);
const command = args[0];

function parseOptions(args) {
  const opts = {};
  for (let i = 1; i < args.length; i++) {
    if (args[i].startsWith('--') && i + 1 < args.length) {
      opts[args[i].slice(2)] = args[i + 1];
      i++;
    }
  }
  return opts;
}

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`请求失败(${res.status}): ${body}`);
  }
  return res.json();
}

async function getConfig() {
  const data = await fetchJSON(`${BASE_URL}/getConfig`);
  console.log(JSON.stringify(data, null, 2));
}

async function getColorList(opts) {
  if (!opts.style) {
    console.error('缺少 --style 参数');
    process.exit(1);
  }
  const params = new URLSearchParams({ style: opts.style });
  if (opts.domain) params.set('domain', opts.domain);
  const data = await fetchJSON(`${BASE_URL}/getColorList?${params}`);
  console.log(JSON.stringify(data, null, 2));
}

async function getSvg(opts) {
  if (!opts.keyword) {
    console.error('缺少 --keyword 参数');
    process.exit(1);
  }
  if (!opts.size) {
    console.error('缺少 --size 参数');
    process.exit(1);
  }
  if (!opts.style) {
    console.error('缺少 --style 参数');
    process.exit(1);
  }
  if (!opts.color) {
    console.error('缺少 --color 参数');
    process.exit(1);
  }

  const keywords = opts.keyword.split(',');
  const results = [];

  for (const kw of keywords) {
    const params = new URLSearchParams({
      keyword: kw.trim(),
      size: opts.size,
      style: opts.style,
      color: opts.color,
    });
    const svg = await fetchJSON(`${BASE_URL}/getSvg?${params}`);
    results.push({ keyword: kw.trim(), svg });
  }

  if (results.length === 1) {
    console.log(results[0].svg);
  } else {
    console.log(JSON.stringify(results, null, 2));
  }
}

async function main() {
  switch (command) {
    case 'config':
      await getConfig();
      break;
    case 'colors':
      await getColorList(parseOptions(args));
      break;
    case 'svg':
      await getSvg(parseOptions(args));
      break;
    default:
      console.error('用法: get-icon.js <config|colors|svg> [选项]');
      console.error('');
      console.error('  config                         获取配置枚举');
      console.error('  colors --style <风格> [--domain <领域>]  获取颜色列表');
      console.error('  svg --keyword <关键词> --size <尺寸> --style <风格> --color <色值>  获取SVG');
      process.exit(1);
  }
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
