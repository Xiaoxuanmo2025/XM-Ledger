/**
 * CSV Helper Utilities
 */

export interface CSVTransaction {
  日期: string;
  类型: string;
  一级分类: string;
  二级分类: string;
  描述: string;
  原始金额: string;
  币种: string;
  汇率: string;
  人民币金额: string;
  备注: string;
}

/**
 * 转换数据为 CSV 格式字符串
 */
export function convertToCSV(data: CSVTransaction[]): string {
  if (data.length === 0) {
    return '';
  }

  const headers = Object.keys(data[0]) as (keyof CSVTransaction)[];
  const headerRow = headers.join(',');

  const rows = data.map((row) => {
    return headers
      .map((header) => {
        const value = row[header] || '';
        // 如果包含逗号、引号或换行符，需要用引号包裹
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      })
      .join(',');
  });

  return [headerRow, ...rows].join('\n');
}

/**
 * 解析 CSV 字符串为数据数组
 */
export function parseCSV(csvContent: string): CSVTransaction[] {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV 文件格式错误：至少需要包含表头和一行数据');
  }

  const headers = parseCSVLine(lines[0]);
  const expectedHeaders = [
    '日期',
    '类型',
    '一级分类',
    '二级分类',
    '描述',
    '原始金额',
    '币种',
    '汇率',
    '备注',
  ];

  // 验证表头（忽略"人民币金额"列，因为是可选的）
  const requiredHeaders = expectedHeaders.slice(0, -1); // 备注也是可选的
  const hasAllRequired = requiredHeaders.every((h) => headers.includes(h));

  if (!hasAllRequired) {
    throw new Error(
      `CSV 表头格式错误。期望的表头：${expectedHeaders.join(', ')}\n实际的表头：${headers.join(', ')}`
    );
  }

  const data: CSVTransaction[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // 跳过空行

    const values = parseCSVLine(line);
    const row: Partial<CSVTransaction> = {};

    headers.forEach((header, index) => {
      (row as any)[header] = values[index] || '';
    });

    data.push(row as CSVTransaction);
  }

  return data;
}

/**
 * 解析 CSV 单行（处理引号包裹的字段）
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // 双引号转义
        current += '"';
        i++; // 跳过下一个引号
      } else {
        // 切换引号状态
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // 字段分隔符
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

/**
 * 下载 CSV 文件
 */
export function downloadCSV(csvContent: string, filename: string) {
  // 添加 BOM 以支持 Excel 正确显示中文
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
