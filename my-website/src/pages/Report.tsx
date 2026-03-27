import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReviewResult } from '../types/common';
import { formatDate, formatDuration, EDUCATION_LEVELS, MAJORS, GRADE_LABELS, saveHistoryRecord } from '../utils/storage';
import '../styles/Report.css';

const Report: React.FC = () => {
  const navigate = useNavigate();
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    // 从localStorage获取评审结果
    const savedResult = localStorage.getItem('lastReviewResult');
    if (savedResult) {
      const parsed = JSON.parse(savedResult);
      setResult(parsed);
      
      // 保存到历史记录
      saveHistoryRecord({
        essayName: parsed.essayName,
        requirementsName: parsed.requirementsName,
        historyRequirementName: parsed.historyRequirementName,
        educationLevel: parsed.educationLevel,
        major: parsed.major,
        totalScore: parsed.totalScore,
        grade: parsed.grade,
        reviewedAt: new Date().toISOString(),
      });
    } else {
      navigate('/');
    }
  }, [navigate]);

  const downloadReport = (format: 'txt' | 'pdf') => {
    if (!result) return;

    setIsDownloading(true);

    try {
      const filename = `${result.essayName}_评审报告_${new Date().toISOString().split('T')[0]}.${format === 'txt' ? 'txt' : 'pdf'}`;
      
      // 生成报告内容
      let content = generateReportContent();

      if (format === 'txt') {
        // 下载为txt
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      } else {
        // 下载为pdf - 简单实现（可以用pdf-lib库优化）
        alert('PDF下载功能开发中，请先下载txt版本');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const generateReportContent = (): string => {
    if (!result) return '';

    const lines = [
      '='.repeat(60),
      '英澳硕士作业评审报告',
      '='.repeat(60),
      '',
      '【基础信息】',
      `作业名称: ${result.essayName}`,
      `要求名称: ${result.requirementsName}`,
      result.historyRequirementName ? `历史要求: ${result.historyRequirementName}` : '',
      `评审专业: ${MAJORS[result.major as keyof typeof MAJORS]}`,
      `学位等级: ${EDUCATION_LEVELS[result.educationLevel as keyof typeof EDUCATION_LEVELS]}`,
      `评审时间: ${formatDate(result.reviewedAt)}`,
      `评审耗时: ${formatDuration(result.reviewDuration)}`,
      '',
      '【评分与评级】',
      `总分: ${result.totalScore}/100`,
      `评级: ${GRADE_LABELS[result.grade]}`,
      '',
      '【评审明细】',
      '',
      '1. 个性要求匹配度评审 (满分60分)',
      `得分: ${result.breakdown.personalityMatchScore}/60`,
      '',
      ...result.breakdown.personalityMatchDetails.map((detail, i) => [
        `要求 ${i + 1}: ${detail.requirement}`,
        `状态: ${getStatusLabel(detail.status)}`,
        `问题: ${detail.issue}`,
        `扣分: -${detail.deductionPoints}分`,
        '',
      ].flat()),
      '',
      '2. 通用标准评审 (满分40分)',
      `得分: ${result.breakdown.universalStandardScore}/40`,
      '',
      ...result.breakdown.universalStandardDetails.map((detail, i) => [
        `${detail.category}`,
        `状态: ${detail.status === 'pass' ? '通过' : '未通过'}`,
        `问题: ${detail.issue}`,
        `扣分: -${detail.deductionPoints}分`,
        '',
      ].flat()),
      '',
      '3. 基础合规检查',
      ...result.breakdown.basicComplianceDetails.map((detail) => [
        `${detail.category}: ${detail.status}`,
        detail.note,
        '',
      ].flat()),
      '',
      '【针对性修改建议】',
      ...result.suggestions.map((s, i) => [
        `${i + 1}. [${s.priority === 'high' ? '高优先' : s.priority === 'medium' ? '中优先' : '低优先'}] ${s.category}`,
        `建议: ${s.suggestion}`,
        s.relatedRequirement ? `相关要求: ${s.relatedRequirement}` : '',
        '',
      ].flat()),
      '',
      '='.repeat(60),
      `报告生成时间: ${new Date().toLocaleString('zh-CN')}`,
      '='.repeat(60),
    ];

    return lines.filter(Boolean).join('\n');
  };

  const getStatusLabel = (status: string): string => {
    const labels = {
      'satisfied': '✓ 满足',
      'partial': '◐ 部分满足',
      'unsatisfied': '✗ 未满足',
    };
    return labels[status as keyof typeof labels] || status;
  };

  if (!result) {
    return (
      <div className="report-container">
        <div className="loading">加载中...</div>
      </div>
    );
  }

  return (
    <div className="report-container">
      {/* 报告头部 */}
      <div className="report-header">
        <h1>📊 评审报告</h1>
        <div className="basic-info">
          <div className="info-row">
            <span className="label">作业:</span>
            <span className="value">{result.essayName}</span>
          </div>
          <div className="info-row">
            <span className="label">要求:</span>
            <span className="value">
              {result.historyRequirementName || result.requirementsName}
            </span>
          </div>
          <div className="info-row">
            <span className="label">专业:</span>
            <span className="value">{MAJORS[result.major as keyof typeof MAJORS]}</span>
          </div>
          <div className="info-row">
            <span className="label">学位等级:</span>
            <span className="value">{EDUCATION_LEVELS[result.educationLevel as keyof typeof EDUCATION_LEVELS]}</span>
          </div>
          <div className="info-row">
            <span className="label">评审时间:</span>
            <span className="value">{formatDate(result.reviewedAt)}</span>
          </div>
          <div className="info-row">
            <span className="label">耗时:</span>
            <span className="value">{formatDuration(result.reviewDuration)}</span>
          </div>
        </div>
      </div>

      {/* 评分卡片 */}
      <div className="score-card">
        <div className="score-main">
          <div className="score-number">{result.totalScore}</div>
          <div className="score-text">/100</div>
        </div>
        <div className="score-grade">
          <div className={`grade-badge grade-${result.grade}`}>
            {GRADE_LABELS[result.grade]}
          </div>
        </div>
      </div>

      {/* 评审明细 */}
      <div className="review-sections">
        {/* 个性要求匹配度 */}
        <section className="review-section">
          <h2>1️⃣ 个性要求匹配度 (满分60分)</h2>
          <div className="score-display">
            得分: <span className="score-highlight">{result.breakdown.personalityMatchScore}/60</span>
          </div>
          
          {result.breakdown.personalityMatchDetails.length > 0 ? (
            <div className="details-list">
              {result.breakdown.personalityMatchDetails.map((detail, i) => (
                <div key={i} className="detail-item">
                  <div className="detail-header">
                    <span className={`status-badge status-${detail.status}`}>
                      {getStatusLabel(detail.status)}
                    </span>
                    <span className="detail-title">{detail.requirement}</span>
                  </div>
                  <div className="detail-content">
                    <p className="issue">问题: {detail.issue}</p>
                    <p className="deduction">扣分: <span className="negative">-{detail.deductionPoints}</span> 分</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-issues">✓ 所有要求均已满足</p>
          )}
        </section>

        {/* 通用标准 */}
        <section className="review-section">
          <h2>2️⃣ 通用标准评审 (满分40分)</h2>
          <div className="score-display">
            得分: <span className="score-highlight">{result.breakdown.universalStandardScore}/40</span>
          </div>
          
          {result.breakdown.universalStandardDetails.length > 0 ? (
            <div className="details-list">
              {result.breakdown.universalStandardDetails.map((detail, i) => (
                <div key={i} className="detail-item">
                  <div className="detail-header">
                    <span className={`status-badge status-${detail.status}`}>
                      {detail.status === 'pass' ? '✓ 通过' : '✗ 未通过'}
                    </span>
                    <span className="detail-title">{detail.category}</span>
                  </div>
                  <div className="detail-content">
                    <p className="issue">{detail.issue}</p>
                    {detail.deductionPoints > 0 && (
                      <p className="deduction">扣分: <span className="negative">-{detail.deductionPoints}</span> 分</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-issues">✓ 所有标准均已通过</p>
          )}
        </section>

        {/* 基础合规 */}
        <section className="review-section">
          <h2>3️⃣ 基础合规检查</h2>
          <div className="compliance-list">
            {result.breakdown.basicComplianceDetails.map((detail, i) => (
              <div key={i} className="compliance-item">
                <span className="compliance-category">{detail.category}</span>
                <span className="compliance-status">{detail.status}</span>
                <p className="compliance-note">{detail.note}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 修改建议 */}
      <section className="suggestions-section">
        <h2>💡 针对性修改建议</h2>
        {result.suggestions.length > 0 ? (
          <div className="suggestions-list">
            {result.suggestions
              .sort((a, b) => {
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
              })
              .map((suggestion, i) => (
                <div key={i} className={`suggestion-item priority-${suggestion.priority}`}>
                  <div className="suggestion-header">
                    <span className={`priority-badge priority-${suggestion.priority}`}>
                      {suggestion.priority === 'high' ? '高' : suggestion.priority === 'medium' ? '中' : '低'}
                    </span>
                    <span className="suggestion-category">{suggestion.category}</span>
                  </div>
                  <div className="suggestion-content">
                    <p className="suggestion-text">{suggestion.suggestion}</p>
                    {suggestion.relatedRequirement && (
                      <p className="related-requirement">
                        相关要求: <em>{suggestion.relatedRequirement}</em>
                      </p>
                    )}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <p className="no-suggestions">暂无修改建议</p>
        )}
      </section>

      {/* 操作按钮 */}
      <div className="action-buttons">
        <button
          className="download-button"
          onClick={() => downloadReport('txt')}
          disabled={isDownloading}
        >
          {isDownloading ? '下载中...' : '📥 下载报告 (TXT)'}
        </button>
        <button
          className="back-button"
          onClick={() => navigate('/')}
        >
          返回首页重新评审
        </button>
      </div>
    </div>
  );
};

export default Report;
