import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HistoryRecord, ReviewResult } from '../types/common';
import { getHistoryRecords } from '../utils/storage';
import { formatDate, EDUCATION_LEVELS, MAJORS, GRADE_LABELS } from '../utils/storage';
import '../styles/History.css';

const History: React.FC = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(null);
  const [selectedResultDetails, setSelectedResultDetails] = useState<ReviewResult | null>(null);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = () => {
    const savedRecords = getHistoryRecords();
    setRecords(Array.isArray(savedRecords) ? savedRecords : []);
  };

  const handleViewDetails = (record: HistoryRecord, index: number) => {
    // 尝试从localStorage获取详细结果
    const allResults = localStorage.getItem('allReviewResults');
    if (allResults) {
      const results = JSON.parse(allResults);
      if (results[index]) {
        setSelectedRecord(record);
        setSelectedResultDetails(results[index]);
      }
    } else {
      alert('无法找到详细评审结果');
    }
  };

  const handleCloseDetails = () => {
    setSelectedRecord(null);
    setSelectedResultDetails(null);
  };

  return (
    <div className="history-container">
      <div className="history-header">
        <h1>📜 评审历史</h1>
        <p>查看过去的评审记录和详细报告</p>
      </div>

      {records.length === 0 ? (
        <div className="empty-state">
          <p>📭 暂无评审历史</p>
          <p className="hint">开始评审你的作业，历史记录将在这里显示</p>
          <button className="start-button" onClick={() => navigate('/')}>
            开始评审
          </button>
        </div>
      ) : (
        <div className="history-content">
          <div className="history-stats">
            <div className="stat-card">
              <span className="stat-label">总评审次数</span>
              <span className="stat-value">{records.length}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">平均分</span>
              <span className="stat-value">
                {Math.round(records.reduce((sum, r) => sum + r.totalScore, 0) / records.length)}
              </span>
            </div>
            <div className="stat-card">
              <span className="stat-label">最高分</span>
              <span className="stat-value">
                {Math.max(...records.map((r) => r.totalScore))}
              </span>
            </div>
          </div>

          <div className="history-list">
            <table className="history-table">
              <thead>
                <tr>
                  <th>作业名称</th>
                  <th>要求名称</th>
                  <th>专业</th>
                  <th>学位等级</th>
                  <th>评分</th>
                  <th>评级</th>
                  <th>评审时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record, index) => (
                  <tr key={index} className={`record-row grade-${record.grade}`}>
                    <td className="essay-name" title={record.essayName}>
                      {record.essayName}
                    </td>
                    <td className="requirements-name" title={record.requirementsName}>
                      {record.historyRequirementName || record.requirementsName}
                    </td>
                    <td>{MAJORS[record.major as keyof typeof MAJORS]}</td>
                    <td>{EDUCATION_LEVELS[record.educationLevel as keyof typeof EDUCATION_LEVELS]}</td>
                    <td className="score">{record.totalScore}/100</td>
                    <td>
                      <span className={`grade-badge grade-${record.grade}`}>
                        {GRADE_LABELS[record.grade]}
                      </span>
                    </td>
                    <td className="date">{formatDate(record.reviewedAt)}</td>
                    <td className="actions">
                      <button
                        className="view-button"
                        onClick={() => handleViewDetails(record, index)}
                      >
                        查看详情
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 详情模态框 */}
      {selectedRecord && selectedResultDetails && (
        <div className="details-modal" onClick={handleCloseDetails}>
          <div className="details-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={handleCloseDetails}>✕</button>
            <h2>{selectedRecord.essayName}</h2>
            
            <div className="details-score">
              <div className="score-main">{selectedRecord.totalScore}/100</div>
              <span className={`grade-badge grade-${selectedRecord.grade}`}>
                {GRADE_LABELS[selectedRecord.grade]}
              </span>
            </div>

            <div className="details-sections">
              <section>
                <h3>个性要求匹配度</h3>
                <p>得分: {selectedResultDetails.breakdown.personalityMatchScore}/60</p>
              </section>
              <section>
                <h3>通用标准</h3>
                <p>得分: {selectedResultDetails.breakdown.universalStandardScore}/40</p>
              </section>
              <section>
                <h3>修改建议数</h3>
                <p>{selectedResultDetails.suggestions.length} 条</p>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
