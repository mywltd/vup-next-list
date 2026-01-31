#!/usr/bin/env node

import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pinyin } from 'pinyin-pro';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 获取歌曲首字母（高精度版）
 * 优先级：
 * 1. Excel 中已提供的首字母
 * 2. 英文首字母
 * 3. 中文拼音首字母（pinyin-pro）
 * 4. #
 */
function getFirstLetter(songName, row = {}) {
  // ① Excel 显式首字母（最高优先级）
  const excelLetter =
    row['首字母'] ||
    row['拼音首字母'] ||
    row['firstLetter'] ||
    row['initial'];

  if (excelLetter && /^[A-Z#]$/i.test(excelLetter)) {
    return excelLetter.toUpperCase();
  }

  if (!songName) return '#';

  // 去掉常见前置符号
  const cleanName = songName.replace(/^[《〈【\[\(（"'“‘]+/, '').trim();
  if (!cleanName) return '#';

  const firstChar = cleanName.charAt(0);

  // ② 英文字母
  if (/[A-Z]/i.test(firstChar)) {
    return firstChar.toUpperCase();
  }

  // ③ 数字
  if (/[0-9]/.test(firstChar)) {
    return '#';
  }

  // ④ 中文拼音首字母
  const py = pinyin(firstChar, {
    pattern: 'first',
    toneType: 'none'
  });

  if (py && /^[a-z]$/i.test(py)) {
    return py.toUpperCase();
  }

  return '#';
}

/**
 * XLSX → JSON 转换
 */
function convertXlsxToJson(xlsxPath, jsonPath) {
  try {
    console.log('📖 正在读取 XLSX 文件:', xlsxPath);

    const workbook = XLSX.readFile(xlsxPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const rawData = XLSX.utils.sheet_to_json(worksheet);
    console.log(`✅ 读取到 ${rawData.length} 行数据`);

    const playlist = rawData
      .map((row, index) => {
        const songName =
          row['歌曲名'] ||
          row['歌名'] ||
          row['songName'] ||
          '';

        if (!songName) {
          console.warn(`⚠️ 第 ${index + 2} 行缺少歌曲名，已跳过`);
          return null;
        }

        const singer =
          row['歌手'] ||
          row['singer'] ||
          '';

        const language =
          row['语种'] ||
          row['语言'] ||
          row['language'] ||
          '未知';

        // 解析分类标签（支持多标签，用 / 分隔）
        const categoryRaw =
          row['种类'] ||
          row['分类'] ||
          row['category'] ||
          '其他';
        
        // 支持多标签：古风/国风/戏腔 -> ['古风', '国风', '戏腔']
        const categories = categoryRaw
          .split(/[\/、,，]/) // 支持 / 、 , ，等分隔符
          .map(c => c.trim())
          .filter(c => c.length > 0);
        
        // 如果没有标签，默认为"其他"
        const category = categories.length > 0 ? categories : ['其他'];

        let special = false;
        if (row['特殊歌曲'] !== undefined) {
          special =
            row['特殊歌曲'] === '是' ||
            row['特殊歌曲'] === true ||
            row['特殊歌曲'] === 'true';
        } else if (row['special'] !== undefined) {
          special =
            row['special'] === true ||
            row['special'] === 'true';
        }

        const bilibiliClipUrl =
          row['B站切片'] ||
          row['切片链接'] ||
          row['bilibiliClipUrl'] ||
          row['bilibili_clip_url'] ||
          '';

        const result = {
          songName,
          singer,
          language,
          category,
          special,
          firstLetter: getFirstLetter(songName, row)
        };

        // 只在有切片链接时才添加该字段
        if (bilibiliClipUrl) {
          result.bilibiliClipUrl = bilibiliClipUrl;
        }

        return result;
      })
      .filter(Boolean);

    console.log(`✨ 成功转换 ${playlist.length} 首歌曲`);

    fs.writeFileSync(
      jsonPath,
      JSON.stringify(playlist, null, 2),
      'utf8'
    );

    console.log('💾 已保存到:', jsonPath);

    // 统计信息
    const stats = {
      总歌曲数: playlist.length,
      特殊歌曲: playlist.filter(s => s.special).length,
      语种分布: {},
      分类分布: {}
    };

    playlist.forEach(song => {
      stats.语种分布[song.language] =
        (stats.语种分布[song.language] || 0) + 1;
      
      // 统计所有分类标签
      if (Array.isArray(song.category)) {
        song.category.forEach(cat => {
          stats.分类分布[cat] = (stats.分类分布[cat] || 0) + 1;
        });
      }
    });

    console.log('\n📊 统计信息:');
    console.log(JSON.stringify(stats, null, 2));

    return playlist;
  } catch (error) {
    console.error('❌ 转换失败:', error);
    process.exit(1);
  }
}

/**
 * CLI 调用
 */
if (process.argv[1] === __filename) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
使用方法:
  node xlsx2json.js <input.xlsx> [output.json]

示例:
  node xlsx2json.js playlist.xlsx
  node xlsx2json.js playlist.xlsx output.json

Excel 推荐字段:
  歌曲名 | 歌手 | 语种 | 种类 | 首字母 | 特殊歌曲 | B站切片
`);
    process.exit(1);
  }

  const xlsxPath = path.resolve(args[0]);
  const jsonPath = args[1]
    ? path.resolve(args[1])
    : xlsxPath.replace(/\.xlsx?$/i, '.json');

  if (!fs.existsSync(xlsxPath)) {
    console.error('❌ 文件不存在:', xlsxPath);
    process.exit(1);
  }

  convertXlsxToJson(xlsxPath, jsonPath);
}

export { convertXlsxToJson, getFirstLetter };
