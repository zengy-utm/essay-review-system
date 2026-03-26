import { v4 as uuidv4 } from 'uuid';
import { HistoryRequirement } from '../types/common';

const HISTORY_REQUIREMENTS_KEY = 'history_requirements';
const HISTORY_RECORDS_KEY = 'history_records';

// ========== 历史要求库管理 ==========

/**
 * 获取所有历史要求文件
 */
export const getHistoryRequirements = (): HistoryRequirement[] => {
  const data = localStorage.getItem(HISTORY_REQUIREMENTS_KEY);
  return data ? JSON.parse(data) : [];
};

/**
 * 添加历史要求文件
 */
export const addHistoryRequirement = (
  name: string,
  content: string,
  fileType: string,
  description?: string
): HistoryRequirement => {
  const requirements = getHistoryRequirements();
  const newRequirement: HistoryRequirement = {
    id: uuidv4(),
    name,
    content,
    fileType,
    description,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  requirements.push(newRequirement);
  localStorage.setItem(HISTORY_REQUIREMENTS_KEY, JSON.stringify(requirements));
  return newRequirement;
};

/**
 * 更新历史要求文件名称
 */
export const updateHistoryRequirementName = (
  id: string,
  newName: string
): boolean => {
  const requirements = getHistoryRequirements();
  const index = requirements.findIndex((r) => r.id === id);
  if (index !== -1) {
    requirements[index].name = newName;
    requirements[index].updatedAt = new Date().toISOString();
    localStorage.setItem(HISTORY_REQUIREMENTS_KEY, JSON.stringify(requirements));
    return true;
  }
  return false;
};

/**
 * 删除历史要求文件
 */
export const deleteHistoryRequirement = (id: string): boolean => {
  const requirements = getHistoryRequirements();
  const filtered = requirements.filter((r) => r.id !== id);
  localStorage.setItem(HISTORY_REQUIREMENTS_KEY, JSON.stringify(filtered));
  return filtered.length < requirements.length;
};

/**
 * 搜索历史要求文件
 */
export const searchHistoryRequirements = (keyword: string): HistoryRequirement[] => {
  const requirements = getHistoryRequirements();
  const lowerKeyword = keyword.toLowerCase();
  return requirements.filter(
    (r) =>
      r.name.toLowerCase().includes(lowerKeyword) ||
      r.description?.toLowerCase().includes(lowerKeyword)
  );
};

/**
 * 获取单个历史要求文件
 */
export const getHistoryRequirementById = (id: string): HistoryRequirement | null => {
  const requirements = getHistoryRequirements();
  return requirements.find((r) => r.id === id) || null;
};

// ========== 历史评审记录管理 ==========

/**
 * 获取所有评审历史记录
 */
export const getHistoryRecords = () => {
  const data = localStorage.getItem(HISTORY_RECORDS_KEY);
  return data ? JSON.parse(data) : [];
};

/**
 * 保存评审记录
 */
export const saveHistoryRecord = (record: any) => {
  const records = getHistoryRecords();
  records.push({
    id: uuidv4(),
    ...record,
    savedAt: new Date().toISOString(),
  });
  localStorage.setItem(HISTORY_RECORDS_KEY, JSON.stringify(records));
};

/**
 * 清空历史记录
 */
export const clearHistoryRecords = () => {
  localStorage.removeItem(HISTORY_RECORDS_KEY);
};

// ========== 文件处理工具 ==========

/**
 * 读取文件内容（支持txt, doc, docx, pdf等）
 */
export const readFileContent = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === 'string') {
        resolve(content);
      } else {
        // 对于二进制文件，返回base64编码
        resolve(btoa(new Uint8Array(content as ArrayBuffer).reduce((a, b) => a + String.fromCharCode(b), '')));
      }
    };
    reader.onerror = () => reject(reader.error);
    
    // 根据文件类型选择读取方式
    const fileType = file.type;
    if (fileType.includes('text') || fileType.includes('plain')) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  });
};

/**
 * 验证文件格式
 */
export const validateFileFormat = (
  file: File,
  allowedFormats: string[]
): boolean => {
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  return allowedFormats.includes(fileExtension || '');
};

/**
 * 验证文件大小
 */
export const validateFileSize = (file: File, maxSizeGB: number): boolean => {
  const maxSizeBytes = maxSizeGB * 1024 * 1024; // 转换为GB
  return file.size <= maxSizeBytes;
};

/**
 * 格式化文件大小显示
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * 获取文件类别（根据扩展名判断）
 */
export const getFileCategory = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase();
  
  if (['txt', 'doc', 'docx', 'pdf'].includes(ext || '')) {
    return 'document';
  } else if (['ppt', 'pptx'].includes(ext || '')) {
    return 'presentation';
  } else if (['mp4', 'mov', 'avi'].includes(ext || '')) {
    return 'video';
  } else if (['mp3', 'wav'].includes(ext || '')) {
    return 'audio';
  }
  return 'unknown';
};

// ========== 时间格式化 ==========

/**
 * 格式化日期为本地格式
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * 格式化耗时（毫秒 → "X分钟Y秒"）
 */
export const formatDuration = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes === 0) {
    return `${remainingSeconds}秒`;
  }
  return `${minutes}分钟${remainingSeconds}秒`;
};

// ========== 常量 ==========

export const EDUCATION_LEVELS = {
  foundation: '预科',
  undergraduate: '本科',
  master: '硕士',
  phd: '博士',
};

export const MAJORS = {
  business: '商科',
  education: '教育',
  media: '传媒',
  computer: '计算机',
};

export const GRADE_LABELS = {
  excellent: '优秀 (90+)',
  good: '良好 (80-89)',
  pass: '合格 (60-79)',
  fail: '不合格 (<60)',
};

export const SUPPORTED_FORMATS = {
  document: ['txt', 'doc', 'docx', 'pdf'],
  presentation: ['ppt', 'pptx'],
  video: ['mp4', 'mov', 'avi'],
  audio: ['mp3', 'wav'],
};

export const FILE_SIZE_LIMITS = {
  document: 20, // MB
  presentation: 20,
  video: 50,
  audio: 50,
};
