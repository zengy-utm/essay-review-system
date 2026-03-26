import React, { useState } from 'react';
import '../styles/Help.css';

const Help: React.FC = () => {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const faqs = [
    {
      question: '支持哪些文件格式？',
      answer:
        '作业文件支持: txt、doc、docx、pdf、ppt、pptx、mp4、mov、avi、mp3、wav 等格式。要求文件支持: txt、doc、docx、pdf、ppt、pptx。所有文件大小限制: 普通文件不超过20MB，视频/音频文件不超过50MB。',
    },
    {
      question: '什么是历史要求库？',
      answer:
        '历史要求库是存储已上传要求文件的库。当你上传一个新的作业要求文件时，可以给它自定义命名（如"商科Essay-财务分析"）。后续如果有类似作业需要评审，可以直接从历史要求库中选择，无需重复上传，节省时间。',
    },
    {
      question: '文件上传失败怎么办？',
      answer:
        '请检查: 1. 文件格式是否被支持 2. 文件大小是否超过限制 3. 网络连接是否正常。如果还有问题，请清除浏览器缓存后重试，或联系我们的支持团队。',
    },
    {
      question: '评审的准确性如何？',
      answer:
        '我们的评审系统采用Gemini AI引擎，基于你上传的具体要求文件进行智能评审。评审精度取决于要求文件的清晰度。建议你上传尽可能详细、具体的要求文件，以获得更准确的评审结果。',
    },
    {
      question: '我的数据安全吗？',
      answer:
        '你的所有数据都存储在你的浏览器本地，不会上传到我们的服务器（除了进行AI评审时的评审内容）。评审完成后，你可以随时删除文件。请注意，清除浏览器缓存会导致历史记录丢失。',
    },
    {
      question: '可以删除历史记录吗？',
      answer:
        '可以。在"历史评审记录"页面，你可以查看所有过往评审。在"历史要求库"页面，可以删除不需要的要求文件。删除后无法恢复，请谨慎操作。',
    },
    {
      question: '下载的报告格式有哪些？',
      answer:
        '目前支持下载为 txt 格式。PDF格式正在开发中。下载的报告文件名称为"作业名称_评审报告_日期"，方便你保存和查找。',
    },
    {
      question: '如何重新评审同一份作业？',
      answer:
        '上传修改后的作业文件（可以使用之前的要求或选择其他要求），点击"启动评审"即可。历史记录会自动保存。',
    },
    {
      question: '评审需要多长时间？',
      answer:
        '通常评审需要30-60秒。如果你使用历史要求库中的要求文件，评审速度会更快（30%以上的加速）。评审时会显示进度条，请耐心等待。',
    },
    {
      question: '如何联系技术支持？',
      answer:
        '如遇到问题，请点击页面下方的"反馈"按钮提交反馈。我们会尽快回复并帮助解决。常见问题的解决方案也可以在本页面找到。',
    },
  ];

  const guides = [
    {
      step: 1,
      title: '选择学位等级和专业',
      description: '从下拉菜单中清楚选择你的作业对应的学位等级（预科/本科/硕士/博士）和专业（商科/教育/传媒/计算机）',
      imageEmoji: '📚',
    },
    {
      step: 2,
      title: '上传作业文件',
      description: '点击"作业文件"上传区域，选择或拖拽你的论文/作业文件。支持多种格式，包括文档、PPT、视频等。',
      imageEmoji: '📤',
    },
    {
      step: 3,
      title: '上传要求文件或选择历史要求',
      description:
        '上传该份作业的具体要求文件（如课程大纲、作业说明），或从历史要求库中快速选择。上传后可以自定义命名。',
      imageEmoji: '📋',
    },
    {
      step: 4,
      title: '启动评审',
      description: '点击"启动评审"按钮，系统会自动调用AI进行智能评审。你可以看到实时进度条。',
      imageEmoji: '⚙️',
    },
    {
      step: 5,
      title: '查看评审报告',
      description:
        '评审完成后，系统会自动跳转至评审报告页面。你可以在线查看详细的评审结果、扣分点和改进建议。',
      imageEmoji: '📊',
    },
    {
      step: 6,
      title: '下载和保存',
      description: '如需保存，点击"下载报告"按钮，选择txt格式下载到电脑。报告文件名会自动包含日期。',
      imageEmoji: '💾',
    },
  ];

  return (
    <div className="help-container">
      <div className="help-header">
        <h1>❓ 帮助中心</h1>
        <p>了解如何使用我们的评审系统，快速解决常见问题</p>
      </div>

      {/* 操作指南 */}
      <section className="help-section">
        <h2>📖 操作指南</h2>
        <div className="guides-grid">
          {guides.map((guide) => (
            <div key={guide.step} className="guide-card">
              <div className="guide-number">{guide.step}</div>
              <div className="guide-emoji">{guide.imageEmoji}</div>
              <h3>{guide.title}</h3>
              <p>{guide.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 常见问题 */}
      <section className="help-section">
        <h2>💬 常见问题 (FAQ)</h2>
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`faq-item ${expandedFAQ === index ? 'expanded' : ''}`}
              onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
            >
              <div className="faq-question">
                <span className="faq-icon">{expandedFAQ === index ? '▼' : '▶'}</span>
                <span>{faq.question}</span>
              </div>
              {expandedFAQ === index && (
                <div className="faq-answer">{faq.answer}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 隐私和安全 */}
      <section className="help-section info-section">
        <h2>🔒 隐私和安全</h2>
        <div className="info-box">
          <h3>我们如何保护你的数据</h3>
          <ul>
            <li>✓ 所有用户数据默认存储在浏览器本地</li>
            <li>✓ 作业文件和要求文件仅用于本次评审，可随时删除</li>
            <li>✓ 评审完成后自动清理临时数据</li>
            <li>✓ 历史记录仅保存在你的设备上</li>
            <li>✓ 无需注册登录，完全匿名使用</li>
          </ul>
        </div>
      </section>

      {/* 意见反馈 */}
      <section className="help-section">
        <h2>💌 意见反馈</h2>
        <div className="feedback-box">
          <p>
            如果你有任何建议、问题或遇到bug，欢迎告诉我们。你的反馈将帮助我们持续改进系统，提升服务质量。
          </p>
          <button className="feedback-button">提交反馈</button>
        </div>
      </section>

      {/* 关于我们 */}
      <section className="help-section">
        <h2>ℹ️ 关于本系统</h2>
        <div className="info-box">
          <p>
            英澳硕士作业个性化评审系统是一个专为英澳硕士学生设计的AI评审工具。
            系统基于学生上传的具体作业要求，使用先进的AI技术（Gemini）进行精准评审，
            帮助学生了解作业是否符合课程要求，并提供针对性的改进建议。
          </p>
          <p style={{ marginTop: '1rem' }}>
            <strong>系统版本:</strong> 1.0.0<br />
            <strong>最后更新:</strong> 2026年3月27日<br />
            <strong>技术支持:</strong> 工作时间内7*24小时响应
          </p>
        </div>
      </section>
    </div>
  );
};

export default Help;
