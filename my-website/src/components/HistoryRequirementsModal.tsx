import React, { useState, useEffect } from 'react';
import { HistoryRequirement } from '../types/common';
import { getHistoryRequirements, searchHistoryRequirements } from '../utils/storage';
import '../styles/HistoryRequirementsModal.css';

interface HistoryRequirementsModalProps {
  onSelect: (requirement: HistoryRequirement) => void;
  onClose: () => void;
}

const HistoryRequirementsModal: React.FC<HistoryRequirementsModalProps> = ({ onSelect, onClose }) => {
  const [requirements, setRequirements] = useState<HistoryRequirement[]>([]);
  const [filteredRequirements, setFilteredRequirements] = useState<HistoryRequirement[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedId, setSelectedId] = useState<string>('');

  useEffect(() => {
    const reqs = getHistoryRequirements();
    setRequirements(reqs);
    setFilteredRequirements(reqs);
  }, []);

  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
    if (keyword) {
      setFilteredRequirements(searchHistoryRequirements(keyword));
    } else {
      setFilteredRequirements(requirements);
    }
  };

  const handleSelect = () => {
    if (selectedId) {
      const requirement = requirements.find((r) => r.id === selectedId);
      if (requirement) {
        onSelect(requirement);
      }
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>选择历史要求</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        {requirements.length === 0 ? (
          <div className="modal-body empty-state">
            <p>📂 暂无保存的历史要求文件</p>
            <p className="hint">上传并命名要求文件后，可以在此快速选择</p>
          </div>
        ) : (
          <>
            <div className="modal-search">
              <input
                type="text"
                placeholder="搜索要求文件..."
                value={searchKeyword}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            <div className="modal-body">
              {filteredRequirements.length === 0 ? (
                <p className="no-results">未找到匹配的要求文件</p>
              ) : (
                <div className="requirements-list">
                  {filteredRequirements.map((req) => (
                    <div
                      key={req.id}
                      className={`requirement-item ${selectedId === req.id ? 'selected' : ''}`}
                      onClick={() => setSelectedId(req.id)}
                    >
                      <div className="requirement-checkbox">
                        {selectedId === req.id && <span className="checkbox-checked">✓</span>}
                      </div>
                      <div className="requirement-detail">
                        <p className="requirement-name">{req.name}</p>
                        {req.description && (
                          <p className="requirement-description">{req.description}</p>
                        )}
                        <p className="requirement-date">
                          创建于: {new Date(req.createdAt).toLocaleString('zh-CN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        <div className="modal-footer">
          <button className="cancel-button" onClick={onClose}>
            取消
          </button>
          <button
            className="confirm-button"
            onClick={handleSelect}
            disabled={!selectedId}
          >
            选择
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistoryRequirementsModal;
