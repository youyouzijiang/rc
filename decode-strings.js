// decode-strings.js — Roche 构建产物字符串解码工具
// 用途：该构建包对字符串做了 RC4+base64 混淆，且字符串表在启动时会先旋转
//       （完整性校验 IIFE：o.push(o.shift()) 直到校验和命中）。
// 本工具复现"旋转 + 解码"流程，可还原任意 (id, key) 组合对应的真实字符串。
//
// 用法：node decode-strings.js [id key ...]，例如：
//   node decode-strings.js 6687 qPjj
// 不带参数时输出登录/使用须知相关键名与后端地址。
const fs = require('fs');
const vm = require('vm');

const BUNDLE = 'D:\\Roche\\Roche-main\\assets\\index-Avemb3NY.js';
const text = fs.readFileSync(BUNDLE, 'utf8');

// 1. 提取字符串表（Gm 数组）
const gmStart = text.indexOf('function Gm(){const W=[');
const gmArrStart = gmStart + 'function Gm(){const W=['.length;
const gmEnd = text.indexOf('];return(Gm=function(){return W})()}', gmArrStart);
const gmArray = vm.runInNewContext('[' + text.slice(gmArrStart, gmEnd) + ']');

// 2. 提取解码函数 fs
const fsSrc = text.slice(text.indexOf('function fs(W,o){'), text.indexOf('function Os(o){'));
const sandbox = { Gm: function () { return gmArray; }, String: String, decodeURIComponent: decodeURIComponent };
vm.createContext(sandbox);
vm.runInContext(fsSrc, sandbox);
const decode = sandbox.fs;

// 3. 复现启动时的旋转，直到校验和 859985 命中
let rotations = 0;
for (;;) {
  try {
    const v =
      parseInt(decode(7113, 'yqEP')) / 1 +
      parseInt(decode(4177, '*ctK')) / 2 +
      -parseInt(decode(4998, 'ls1V')) / 3 +
      -parseInt(decode(7355, 'U8oB')) / 4 * (-parseInt(decode(7109, 'jt@P')) / 5) +
      -parseInt(decode(130, 'LQgG')) / 6 * (-parseInt(decode(7957, '1HSi')) / 7) +
      -parseInt(decode(4923, 'uBJL')) / 8 +
      -parseInt(decode(2016, 'i(n@')) / 9;
    if (859985 === v) break;
  } catch (e) { }
  gmArray.push(gmArray.shift());
  rotations++;
  if (rotations > 200000) { console.error('旋转次数超限，未找到校验和'); process.exit(1); }
}

const known = [
  ['登录状态键 email', 6687, 'qPjj'],
  ['登录状态键 sessionToken', 8149, 'gWAB'],
  ['登录状态键 status', 6800, 'fMf)'],
  ['登录状态键 trialExpiresAt', 8856, '*ctK'],
  ['登录状态键 approvedAt', 9765, '%)&Z'],
  ['登录状态键 lastVerifyTime', 4189, 'dpL('],
  ['设备ID键 deviceId', 10311, ']gQH'],
  ['使用须知同意键', 6665, '%)&Z'],
  ['supabase 地址', 10297, 'lfah'],
  ['supabase 匿名密钥', 9023, 'Ef9v'],
];

const args = process.argv.slice(2);
if (args.length >= 2) {
  const id = parseInt(args[0], 10), key = args[1];
  try { console.log(`${id} | ${key} -> ${JSON.stringify(decode(id, key))}`); }
  catch (e) { console.log(`${id} | ${key} -> ERROR ${e.message}`); }
} else {
  console.log(`（字符串表旋转 ${rotations} 次后命中校验和）\n`);
  for (const [label, id, key] of known) {
    try { console.log(`${label}: ${decode(id, key)}`); }
    catch (e) { console.log(`${label}: ERROR ${e.message}`); }
  }
}
