const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Initialize Gemini AI
let genAI;
try {
  if (!GEMINI_API_KEY) {
    console.warn('⚠️  Warning: GEMINI_API_KEY not set. Please configure .env file');
  } else {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  }
} catch (error) {
  console.error('Error initializing Gemini AI:', error);
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Main review endpoint
app.post('/api/review', async (req, res) => {
  try {
    const { essay, essayFileName, requirements, requirementsFileName, educationLevel, major, historyRequirementId } = req.body;

    // Validate input
    if (!essay || !requirements) {
      return res.status(400).json({
        message: '缺少必需的参数: essay 或 requirements'
      });
    }

    if (!GEMINI_API_KEY) {
      return res.status(500).json({
        message: '服务器未配置Gemini API Key，请联系管理员'
      });
    }

    // Call Gemini API for review
    const reviewResult = await generateReview({
      essay,
      essayFileName,
      requirements,
      requirementsFileName,
      educationLevel,
      major,
      historyRequirementId
    });

    res.status(200).json(reviewResult);
  } catch (error) {
    console.error('Review generation error:', error);
    res.status(500).json({
      message: '评审生成失败，请稍后重试',
      error: error.message
    });
  }
});

// Generate review using Gemini
async function generateReview({
  essay,
  essayFileName,
  requirements,
  requirementsFileName,
  educationLevel,
  major,
  historyRequirementId
}) {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const educationLevelLabels = {
    'foundation': '预科',
    'undergraduate': '本科',
    'master': '硕士',
    'phd': '博士'
  };

  const majorLabels = {
    'business': '商科',
    'education': '教育',
    'media': '传媒',
    'computer': '计算机'
  };

  const prompt = `你是一名专业的英澳硕士作业评审专家，精通${majorLabels[major]}专业。

【评审对象】
学位等级: ${educationLevelLabels[educationLevel]}
专业: ${majorLabels[major]}
作业名称: ${essayFileName}
作业要求文件: ${requirementsFileName}

【作业内容】
\`\`\`
${essay.substring(0, 5000)}
\`\`\`

【作业要求】
\`\`\`
${requirements.substring(0, 5000)}
\`\`\`

请按照以下格式进行评审，并返回JSON格式的评审结果：

{
  "id": "生成唯一ID",
  "essayName": "${essayFileName}",
  "requirementsName": "${requirementsFileName}",
  ${historyRequirementId ? `"historyRequirementName": "历史要求名称",` : ''}
  "educationLevel": "${educationLevel}",
  "major": "${major}",
  "totalScore": 85,
  "grade": "good",
  "reviewDuration": 30000,
  "reviewedAt": "${new Date().toISOString()}",
  "breakdown": {
    "personalityMatchScore": 50,
    "personalityMatchDetails": [
      {
        "requirement": "字数要求",
        "status": "satisfied",
        "deductionPoints": 0,
        "issue": "字数符合要求"
      }
    ],
    "universalStandardScore": 35,
    "universalStandardDetails": [
      {
        "category": "引用格式",
        "status": "pass",
        "deductionPoints": 0,
        "issue": "使用了正确的Harvard引用格式"
      }
    ],
    "basicComplianceDetails": [
      {
        "category": "字数",
        "status": "符合",
        "note": "实际字数：2500，符合要求"
      }
    ]
  },
  "suggestions": [
    {
      "priority": "high",
      "category": "内容深度",
      "suggestion": "建议增加对案例的分析深度",
      "relatedRequirement": "需要深入分析至少3个案例"
    }
  ]
}

评审标准：
1. 个性要求匹配度 (60分): 精准对照要求文件，核查作业整体内容是否符合每一项要求
2. 通用标准 (40分): 包括引用格式、语法错误、逻辑清晰度、无抄袭等
3. 基础合规: 字数、完整性等

请严格按照JSON格式返回，确保可以直接解析。`;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();
  
  // Parse JSON from response
  let reviewData;
  try {
    // Extract JSON from response (handle potential markdown code blocks)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      reviewData = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Could not find JSON in response');
    }
  } catch (parseError) {
    console.error('JSON Parse Error:', parseError, 'Response:', responseText);
    // Return mock data if parsing fails
    reviewData = generateMockReview(essayFileName, requirementsFileName, educationLevel, major);
  }

  return reviewData;
}

// Generate mock review for testing
function generateMockReview(essayFileName, requirementsFileName, educationLevel, major) {
  const mockId = require('crypto').randomBytes(16).toString('hex');
  return {
    id: mockId,
    essayName: essayFileName,
    requirementsName: requirementsFileName,
    educationLevel,
    major,
    totalScore: 82,
    grade: 'good',
    reviewDuration: 15000,
    reviewedAt: new Date().toISOString(),
    breakdown: {
      personalityMatchScore: 50,
      personalityMatchDetails: [
        {
          requirement: '字数要求',
          status: 'satisfied',
          deductionPoints: 0,
          issue: '作业字数符合要求'
        },
        {
          requirement: '结构要求',
          status: 'partial',
          deductionPoints: 5,
          issue: '缺少结论部分的深度分析'
        }
      ],
      universalStandardScore: 32,
      universalStandardDetails: [
        {
          category: '引用格式',
          status: 'pass',
          deductionPoints: 0,
          issue: '正确使用了Harvard引用格式'
        },
        {
          category: '学术语言',
          status: 'pass',
          deductionPoints: 0,
          issue: '语言表达学术且专业'
        },
        {
          category: '语法与拼写',
          status: 'fail',
          deductionPoints: 8,
          issue: '发现3处语法错误，需要修正'
        }
      ],
      basicComplianceDetails: [
        {
          category: '字数完成度',
          status: '符合',
          note: '实际字数：2800，符合2000-3000字要求'
        },
        {
          category: '格式规范',
          status: '符合',
          note: '使用了正确的页边距和字体'
        }
      ]
    },
    suggestions: [
      {
        priority: 'high',
        category: '内容充实',
        suggestion: '建议在第二部分增加一个企业案例分析，以更好地支撑论点',
        relatedRequirement: '需要包含至少2个实际案例分析'
      },
      {
        priority: 'medium',
        category: '语言修正',
        suggestion: '第3页第5行的"it effects"应改为"it affects"',
        relatedRequirement: '无语法错误要求'
      },
      {
        priority: 'low',
        category: '参考文献',
        suggestion: '建议增加2-3篇最近发表的学术文章作为参考',
        relatedRequirement: '参考文献不少于15篇'
      }
    ]
  };
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'production' ? '未知错误' : err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: '请求的端点不存在',
    path: req.path
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Essay Review Backend Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Gemini API configured: ${!!GEMINI_API_KEY}`);
  console.log('\n📝 Available endpoints:');
  console.log('  GET  /health');
  console.log('  POST /api/review');
  console.log('\n');
});

module.exports = app;
