#!/usr/bin/env node

import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 将 XLSX 文件转换为歌单 JSON 格式
 * 
 * XLSX 文件格式要求：
 * - 第一行为表头
 * - 必须包含列: 歌曲名, 歌手, 语种, 种类
 * - 可选列: 特殊歌曲 (值为 "是"/"否" 或 true/false)
 * 
 * 使用方法:
 * node xlsx2json.js <input.xlsx> [output.json]
 */

function getFirstLetter(str) {
  if (!str) return '#';
  
  const firstChar = str.charAt(0).toUpperCase();
  
  // 如果是英文字母
  if (/[A-Z]/.test(firstChar)) {
    return firstChar;
  }
  
  // 如果是数字
  if (/[0-9]/.test(firstChar)) {
    return '#';
  }
  
  // 中文拼音首字母映射（简化版本）
  const pinyinMap = {
    '啊': 'A', '八': 'B', '擦': 'C', '打': 'D', '额': 'E',
    '发': 'F', '噶': 'G', '哈': 'H', '击': 'J', '咖': 'K',
    '拉': 'L', '妈': 'M', '拿': 'N', '欧': 'O', '啪': 'P',
    '七': 'Q', '然': 'R', '撒': 'S', '他': 'T', '挖': 'W',
    '西': 'X', '压': 'Y', '杂': 'Z'
  };
  
  // 尝试从映射表获取
  for (const [char, letter] of Object.entries(pinyinMap)) {
    if (firstChar >= char) {
      return letter;
    }
  }
  
  return '#';
}

function convertXlsxToJson(xlsxPath, jsonPath) {
  try {
    console.log('📖 正在读取 XLSX 文件:', xlsxPath);
    
    // 读取 XLSX 文件
    const workbook = XLSX.readFile(xlsxPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // 转换为 JSON
    const rawData = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`✅ 读取到 ${rawData.length} 行数据`);
    
    // 转换为歌单格式
    const playlist = rawData.map((row, index) => {
      const songName = row['歌曲名'] || row['歌名'] || row['songName'] || '';
      const singer = row['歌手'] || row['singer'] || '';
      const language = row['语种'] || row['语言'] || row['language'] || '未知';
      const category = row['种类'] || row['分类'] || row['category'] || '其他';
      
      let special = false;
      if (row['特殊歌曲'] !== undefined) {
        special = row['特殊歌曲'] === '是' || row['特殊歌曲'] === true || row['特殊歌曲'] === 'true';
      } else if (row['special'] !== undefined) {
        special = row['special'] === true || row['special'] === 'true';
      }
      
      if (!songName) {
        console.warn(`⚠️  第 ${index + 2} 行缺少歌曲名，已跳过`);
        return null;
      }
      
      return {
        songName,
        singer,
        language,
        category,
        special,
        firstLetter: getFirstLetter(songName)
      };
    }).filter(Boolean); // 过滤掉 null 值
    
    console.log(`✨ 成功转换 ${playlist.length} 首歌曲`);
    
    // 写入 JSON 文件
    fs.writeFileSync(jsonPath, JSON.stringify(playlist, null, 2), 'utf8');
    console.log('💾 已保存到:', jsonPath);
    
    // 统计信息
    const stats = {
      总歌曲数: playlist.length,
      语种分布: {},
      特殊歌曲: playlist.filter(s => s.special).length
    };
    
    playlist.forEach(song => {
      stats.语种分布[song.language] = (stats.语种分布[song.language] || 0) + 1;
    });
    
    console.log('\n📊 统计信息:');
    console.log(JSON.stringify(stats, null, 2));
    
    return playlist;
  } catch (error) {
    console.error('❌ 转换失败:', error.message);
    process.exit(1);
  }
}

// 命令行调用
if (process.argv[1] === __filename) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
使用方法:
  node xlsx2json.js <input.xlsx> [output.json]

示例:
  node xlsx2json.js playlist.xlsx
  node xlsx2json.js playlist.xlsx output.json

XLSX 文件格式要求:
  - 第一行为表头
  - 必须包含列: 歌曲名, 歌手, 语种, 种类
  - 可选列: 特殊歌曲 (值为 "是"/"否" 或 true/false)
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

