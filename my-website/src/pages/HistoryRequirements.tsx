import React, { useState, useEffect } from 'react';
import {
  getHistoryRequirements,
  updateHistoryRequirementName,
  deleteHistoryRequirement,
  searchHistoryRequirements,
} from '../utils/storage';
import { HistoryRequirement } from '../types/common';
import { formatDate } from '../utils/storage';
import '../styles/HistoryRequirements.css';

const HistoryRequirements: React.FC = () => {
  const [requirements, setRequirements] = useState<HistoryRequirement[]>([]);
  const [filteredRequirements, setFilteredRequirements] = useState<HistoryRequirement[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [selectedForDelete, setSelectedForDelete] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);

  useEffect(() => {
    loadRequirements();
  }, []);

  const loadRequirements = () => {
    const reqs = getHistoryRequirements();
    setRequirements(reqs);
    setFilteredRequirements(reqs);
  };

  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
    if (keyword) {
      setFilteredRequirements(searchHistoryRequirements(keyword));
    } else {
      setFilteredRequirements(requirements);
    }
  };

  const handleRename = (id: string) => {
    if (editingName.trim()) {
      if (updateHistoryRequirementName(id, editingName.trim())) {
        loadRequirements();
        setEditingId(null);
        setEditingName('');
      }
    }
  };

  const handleDelete = (id: string) => {
    if (deleteHistoryRequirement(id)) {
      loadRequirements();
      setSelectedForDelete(null);
    }
  };

  return (
    <div className="history-requirements-container">
      <div className="page-header">
        <h1>📁 历史要求库</h1>
        <p>管理已保存的作业要求文件，支持快速选择和个性化命名</p>
      </div>

      {requirements.length === 0 ? (
        <div className="empty-state">
          <p>📭 暂无保存的要求文件</p>
          <p className="hint">上传新的作业要求文件并命名后，将在此显示</p>
        </div>
      ) : (
        <div className="requirements-content">
          {/* 搜索栏 */}
          <div className="search-bar">
            <input
              type="text"
              placeholder="搜索要求文件..."
              value={searchKeyword}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>

          {/* 统计信息 */}
          <div className="stats-bar">
            <span>总数: {requirements.length}</span>
            {searchKeyword && <span className="search-results">搜索结果: {filteredRequirements.length}</span>}
          </div>

          {/* 要求文件列表 */}
          {filteredRequirements.length === 0 ? (
            <p className="no-results">未找到匹配的要求文件</p>
          ) : (
            <div className="requirements-grid">
              {filteredRequirements.map((req) => (
                <div key={req.id} className="requirement-card">
                  <div className="card-header">
                    <div className="card-title">
                      {editingId === req.id ? (
                        <input
                          autoFocus
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleRename(req.id);
                            }
                          }}
                          className="edit-input"
                        />
                      ) : (
                        <h3>{req.name}</h3>
                      )}
                    </div>
                    {editingId === req.id ? (
                      <div className="edit-buttons">
                        <button
                          className="save-button"
                          onClick={() => handleRename(req.id)}
                        >
                          ✓
                        </button>
                        <button
                          className="cancel-button"
                          onClick={() => {
                            setEditingId(null);
                            setEditingName('');
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        className="edit-button"
                        onClick={() => {
                          setEditingId(req.id);
                          setEditingName(req.name);
                        }}
                      >
                        ✏️
                      </button>
                    )}
                  </div>

                  {req.description && (
                    <p className="card-description">{req.description}</p>
                  )}

                  <div className="card-meta">
                    <span className="file-type">📄 {req.fileType.toUpperCase()}</span>
                    <span className="created-date">{formatDate(req.createdAt)}</span>
                  </div>

                  <div className="card-actions">
                    <button
                      className="preview-button"
                      onClick={() => setPreviewId(previewId === req.id ? null : req.id)}
                    >
                      {previewId === req.id ? '隐藏预览' : '预览'}
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => setSelectedForDelete(req.id)}
                    >
                      🗑️ 删除
                    </button>
                  </div>

                  {/* 预览内容 */}
                  {previewId === req.id && (
                    <div className="card-preview">
                      <p className="preview-label">内容预览:</p>
                      <div className="preview-content">
                        {req.content.substring(0, 300)}...
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 删除确认模态框 */}
      {selectedForDelete && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>确认删除</h2>
            <p>确定要删除此要求文件吗？此操作无法撤销。</p>
            <div className="modal-buttons">
              <button
                className="cancel-button"
                onClick={() => setSelectedForDelete(null)}
              >
                取消
              </button>
              <button
                className="delete-button"
                onClick={() => {
                  handleDelete(selectedForDelete);
                }}
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryRequirements;
