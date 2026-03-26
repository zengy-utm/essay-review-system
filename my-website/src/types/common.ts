// 学位等级
export type EducationLevel = 'foundation' | 'undergraduate' | 'master' | 'phd';

// 专业分类
export type Major = 'business' | 'education' | 'media' | 'computer';

// 文件类型
export type FileCategory = 'essay' | 'report' | 'ppt' | 'video' | 'podcast' | 'news';

// 历史要求文件
export interface HistoryRequirement {
  id: string;
  name: string;
  content: string;
  fileType: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// 评审请求
export interface ReviewRequest {
  essay: string;
  essayFileName: string;
  requirements: string;
  requirementsFileName: string;
  educationLevel: EducationLevel;
  major: Major;
  historyRequirementId?: string; // 如果使用历史要求
}

// 评审结果
export interface ReviewResult {
  id: string;
  essayName: string;
  requirementsName: string;
  historyRequirementName?: string;
  educationLevel: EducationLevel;
  major: Major;
  totalScore: number;
  grade: 'excellent' | 'good' | 'pass' | 'fail';
  breakdown: {
    personalityMatchScore: number;
    personalityMatchDetails: {
      requirement: string;
      status: 'satisfied' | 'partial' | 'unsatisfied';
      deductionPoints: number;
      issue: string;
    }[];
    universalStandardScore: number;
    universalStandardDetails: {
      category: string;
      status: 'pass' | 'fail';
      deductionPoints: number;
      issue: string;
    }[];
    basicComplianceDetails: {
      category: string;
      status: string;
      note: string;
    }[];
  };
  suggestions: {
    priority: 'high' | 'medium' | 'low';
    category: string;
    suggestion: string;
    relatedRequirement?: string;
  }[];
  reviewTime: string;
  reviewDuration: number; // 毫秒
  reviewedAt: string;
}

// 历史评审记录
export interface HistoryRecord {
  id: string;
  essayName: string;
  requirementsName: string;
  historyRequirementName?: string;
  educationLevel: EducationLevel;
  major: Major;
  totalScore: number;
  grade: 'excellent' | 'good' | 'pass' | 'fail';
  reviewedAt: string;
}

// 应用全局状态
export interface AppState {
  essay: File | null;
  requirements: File | null;
  educationLevel: EducationLevel;
  major: Major;
  historyRequirementId?: string;
  isReviewing: boolean;
  reviewResult?: ReviewResult;
}
