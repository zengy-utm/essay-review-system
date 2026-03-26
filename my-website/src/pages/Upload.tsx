import React, { useState, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import {
  validateFileFormat,
  validateFileSize,
  readFileContent,
  formatFileSize,
  EDUCATION_LEVELS,
  MAJORS,
  SUPPORTED_FORMATS,
  FILE_SIZE_LIMITS,
  getFileCategory,
} from '../utils/storage';
import { submitReview } from '../utils/api';
import { HistoryRequirement } from '../types/common';
import HistoryRequirementsModal from '../components/HistoryRequirementsModal';
import '../styles/Upload.css';

const Upload: React.FC = () => {
  const history = useHistory();
  
  // 文件状态
  const [essayFile, setEssayFile] = useState<File | null>(null);
  const [essayPreview, setEssayPreview] = useState<string>('');
  
  const [requirementsFile, setRequirementsFile] = useState<File | null>(null);
  const [requirementsPreview, setRequirementsPreview] = useState<string>('');
  
  // 表单状态
  const [educationLevel, setEducationLevel] = useState<string>('master');
  const [major, setMajor] = useState<string>('business');
  const [selectedHistoryRequirement, setSelectedHistoryRequirement] = useState<HistoryRequirement | null>(null);
  
  // UI状态
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [reviewProgress, setReviewProgress] = useState(0);
  
  const fileInputRefs = {
    essay: useRef<HTMLInputElement>(null),
    requirements: useRef<HTMLInputElement>(null),
  };

  // 处理论文文件上传
  const handleEssayFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    
    // 验证格式
    const allowedFormats = [...SUPPORTED_FORMATS.document, ...SUPPORTED_FORMATS.presentation, ...SUPPORTED_FORMATS.video, ...SUPPORTED_FORMATS.audio];
    if (!validateFileFormat(file, allowedFormats)) {
      setError(`不支持的文件格式。支持: ${allowedFormats.join(', ')}`);
      return;
    }

    // 验证大小
    const fileCategory = getFileCategory(file.name);
    const maxSize = FILE_SIZE_LIMITS[fileCategory as keyof typeof FILE_SIZE_LIMITS] || 20;
    if (!validateFileSize(file, maxSize)) {
      setError(`文件过大。${fileCategory}文件限制: ${maxSize}MB，当前文件: ${formatFileSize(file.size)}`);
      return;
    }

    setEssayFile(file);
    
    // 生成预览
    try {
      const content = await readFileContent(file);
      const preview = content.substring(0, 500); // 只显示前500个字符
      setEssayPreview(preview);
    } catch (err) {
      console.error('Failed to read file:', err);
      setEssayPreview('[无法预览文件内容]');
    }
  };

  // 处理要求文件上传
  const handleRequirementsFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    
    const allowedFormats = [...SUPPORTED_FORMATS.document, ...SUPPORTED_FORMATS.presentation];
    if (!validateFileFormat(file, allowedFormats)) {
      setError(`不支持的文件格式。支持: ${allowedFormats.join(', ')}`);
      return;
    }

    if (!validateFileSize(file, 20)) {
      setError(`文件过大。要求文件限制: 20MB，当前文件: ${formatFileSize(file.size)}`);
      return;
    }

    setRequirementsFile(file);
    setSelectedHistoryRequirement(null); // 清除已选的历史要求
    
    try {
      const content = await readFileContent(file);
      const preview = content.substring(0, 500);
      setRequirementsPreview(preview);
    } catch (err) {
      console.error('Failed to read file:', err);
      setRequirementsPreview('[无法预览文件内容]');
    }
  };

  // 处理历史要求选择
  const handleSelectHistoryRequirement = (requirement: HistoryRequirement) => {
    setSelectedHistoryRequirement(requirement);
    setRequirementsFile(null);
    setRequirementsPreview(requirement.content.substring(0, 500));
    setShowHistoryModal(false);
  };

  // 替换文件
  const replaceFile = (type: 'essay' | 'requirements') => {
    if (type === 'essay') {
      fileInputRefs.essay.current?.click();
    } else {
      fileInputRefs.requirements.current?.click();
    }
  };

  // 启动评审
  const handleStartReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 验证必填项
    if (!essayFile) {
      setError('请上传论文文件');
      return;
    }
    if (!requirementsFile && !selectedHistoryRequirement) {
      setError('请上传要求文件或选择历史要求');
      return;
    }

    setIsLoading(true);
    setReviewProgress(0);

    try {
      // 读取文件内容
      const essayContent = await readFileContent(essayFile);
      const requirementsContent = selectedHistoryRequirement
        ? selectedHistoryRequirement.content
        : await readFileContent(requirementsFile!);

      // 模拟进度更新
      const progressInterval = setInterval(() => {
        setReviewProgress((prev) => Math.min(prev + Math.random() * 30, 90));
      }, 500);

      // 提交评审
      const result = await submitReview({
        essay: essayContent,
        essayFileName: essayFile.name,
        requirements: requirementsContent,
        requirementsFileName: requirementsFile?.name || selectedHistoryRequirement?.name || 'history_requirement',
        educationLevel: educationLevel as any,
        major: major as any,
        historyRequirementId: selectedHistoryRequirement?.id,
      });

      clearInterval(progressInterval);
      setReviewProgress(100);

      // 保存结果到localStorage供Report页面使用
      localStorage.setItem('lastReviewResult', JSON.stringify(result));

      // 跳转到结果页面
      setTimeout(() => {
        history.push('/review');
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : '评审失败，请重试');
      setIsLoading(false);
      setReviewProgress(0);
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-header">
        <h1>作业评审系统</h1>
        <p>上传您的作业和对应要求，获取专业级评审报告</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleStartReview} className="upload-form">
        {/* 学位等级和专业选择 */}
        <div className="form-section">
          <h2>1. 选择学位等级和专业</h2>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="educationLevel">学位等级*</label>
              <select
                id="educationLevel"
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value)}
              >
                {Object.entries(EDUCATION_LEVELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="major">专业*</label>
              <select
                id="major"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
              >
                {Object.entries(MAJORS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 论文上传 */}
        <div className="form-section">
          <h2>2. 上传作业文件</h2>
          <div className="file-upload-area">
            <input
              ref={fileInputRefs.essay}
              type="file"
              onChange={handleEssayFileChange}
              accept=".txt,.doc,.docx,.pdf,.ppt,.pptx,.mp4,.mov,.avi,.mp3,.wav"
              style={{ display: 'none' }}
            />
            <div
              className="upload-dropzone"
              onClick={() => fileInputRefs.essay.current?.click()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) {
                  const input = fileInputRefs.essay.current!;
                  const dataTransfer = new DataTransfer();
                  dataTransfer.items.add(file);
                  input.files = dataTransfer.files;
                  handleEssayFileChange({ target: input } as any);
                }
              }}
              onDragOver={(e) => e.preventDefault()}
            >
              {essayFile ? (
                <div className="file-info">
                  <div className="file-icon">📄</div>
                  <p>{essayFile.name}</p>
                  <p className="file-size">{formatFileSize(essayFile.size)}</p>
                  <button
                    type="button"
                    className="replace-button"
                    onClick={() => replaceFile('essay')}
                  >
                    替换文件
                  </button>
                </div>
              ) : (
                <div className="upload-prompt">
                  <p>📁 点击或拖拽文件上传</p>
                  <p className="file-types">支持: .txt, .doc, .docx, .pdf, .ppt, .pptx, .mp4, .mov, .avi, .mp3, .wav</p>
                </div>
              )}
            </div>
            {essayPreview && (
              <div className="preview-section">
                <h3>文件预览</h3>
                <div className="preview-content">{essayPreview}...</div>
              </div>
            )}
          </div>
        </div>

        {/* 要求上传或历史要求选择 */}
        <div className="form-section">
          <h2>3. 上传作业要求或选择历史要求</h2>
          
          {/* 选项卡切换 */}
          <div className="tabs">
            <button
              type="button"
              className={`tab-button ${!selectedHistoryRequirement ? 'active' : ''}`}
              onClick={() => {
                if (selectedHistoryRequirement) {
                  setSelectedHistoryRequirement(null);
                  setRequirementsFile(null);
                  setRequirementsPreview('');
                }
              }}
            >
              上传新要求
            </button>
            <button
              type="button"
              className={`tab-button ${selectedHistoryRequirement ? 'active' : ''}`}
              onClick={() => setShowHistoryModal(true)}
            >
              选择历史要求
            </button>
          </div>

          {/* 上传新要求 */}
          {!selectedHistoryRequirement && (
            <div className="file-upload-area">
              <input
                ref={fileInputRefs.requirements}
                type="file"
                onChange={handleRequirementsFileChange}
                accept=".txt,.doc,.docx,.pdf,.ppt,.pptx"
                style={{ display: 'none' }}
              />
              <div
                className="upload-dropzone"
                onClick={() => fileInputRefs.requirements.current?.click()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file) {
                    const input = fileInputRefs.requirements.current!;
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);
                    input.files = dataTransfer.files;
                    handleRequirementsFileChange({ target: input } as any);
                  }
                }}
                onDragOver={(e) => e.preventDefault()}
              >
                {requirementsFile ? (
                  <div className="file-info">
                    <div className="file-icon">📋</div>
                    <p>{requirementsFile.name}</p>
                    <p className="file-size">{formatFileSize(requirementsFile.size)}</p>
                    <button
                      type="button"
                      className="replace-button"
                      onClick={() => replaceFile('requirements')}
                    >
                      替换文件
                    </button>
                  </div>
                ) : (
                  <div className="upload-prompt">
                    <p>📋 点击或拖拽文件上传</p>
                    <p className="file-types">支持: .txt, .doc, .docx, .pdf, .ppt, .pptx</p>
                  </div>
                )}
              </div>
              {requirementsPreview && (
                <div className="preview-section">
                  <h3>文件预览</h3>
                  <div className="preview-content">{requirementsPreview}...</div>
                </div>
              )}
            </div>
          )}

          {/* 历史要求选择 */}
          {showHistoryModal && (
            <HistoryRequirementsModal
              onSelect={handleSelectHistoryRequirement}
              onClose={() => setShowHistoryModal(false)}
            />
          )}

          {/* 已选历史要求 */}
          {selectedHistoryRequirement && (
            <div className="selected-history-requirement">
              <div className="requirement-header">
                <h3>✓ 已选择历史要求</h3>
                <button
                  type="button"
                  className="clear-button"
                  onClick={() => setSelectedHistoryRequirement(null)}
                >
                  清除
                </button>
              </div>
              <p className="requirement-name">{selectedHistoryRequirement.name}</p>
              {selectedHistoryRequirement.description && (
                <p className="requirement-description">{selectedHistoryRequirement.description}</p>
              )}
              <div className="preview-section">
                <h3>要求预览</h3>
                <div className="preview-content">{requirementsPreview}...</div>
              </div>
            </div>
          )}
        </div>

        {/* 进度显示 */}
        {isLoading && (
          <div className="progress-section">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${reviewProgress}%` }}></div>
            </div>
            <p className="progress-text">评审进行中... {Math.round(reviewProgress)}%</p>
          </div>
        )}

        {/* 提交按钮 */}
        <button
          type="submit"
          className="submit-button"
          disabled={isLoading || (!essayFile && !requirementsFile && !selectedHistoryRequirement)}
        >
          {isLoading ? '评审中...' : '启动评审'}
        </button>
      </form>
    </div>
  );
};

export default Upload;
