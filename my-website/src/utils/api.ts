import axios from 'axios';
import { ReviewRequest, ReviewResult } from '../types/common';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 2分钟超时（评审可能需要时间）
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 调用后端API进行评审
 */
export const submitReview = async (
  request: ReviewRequest,
  onProgress?: (progress: number) => void
): Promise<ReviewResult> => {
  try {
    const response = await apiClient.post('/api/review', request);
    
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error(`服务器返回错误: ${response.status}`);
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 429) {
        throw new Error('请求过于频繁，请稍后再试');
      } else if (error.response?.status === 500) {
        throw new Error('服务器错误，请稍后再试');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('请求超时，请检查网络连接');
      }
      throw new Error(error.response?.data?.message || '评审失败，请重试');
    }
    throw error;
  }
};

/**
 * 健康检查 - 检查后端服务是否正常
 */
export const healthCheck = async (): Promise<boolean> => {
  try {
    const response = await apiClient.get('/health');
    return response.status === 200;
  } catch {
    return false;
  }
};

/**
 * 获取Gemini配额信息（可选）
 */
export const getQuotaInfo = async () => {
  try {
    const response = await apiClient.get('/api/quota');
    return response.data;
  } catch (error) {
    console.error('Failed to get quota info:', error);
    return null;
  }
};

export default apiClient;
