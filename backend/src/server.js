require('dotenv').config();

const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const multer = require('multer');
const FormData = require('form-data');
const { createApi } = require('unsplash-js');
const fetch = require('node-fetch');
const OpenAI = require('openai');
const axios = require('axios');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sequelize = require('../config/database');
const { sendVerificationEmail } = require('../services/emailService');
const crypto = require('crypto');
const { Op } = require('sequelize');
const serverless = require('serverless-http');

const BASE_URL = process.env.REACT_APP_URL;

const db = require('../models');
console.log('Loaded models:', db);
const User = db.User;

// Manually read and log .env file contents
const envPath = path.resolve(__dirname, '../.env');
console.log('Attempting to read .env file from:', envPath);

try {
  console.log('Raw .env file contents:');
  console.log(fs.readFileSync(envPath, 'utf8'));
} catch (error) {
  console.error('Error reading .env file:', error);
}

// Test database connection
sequelize.authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');
    // Sync all models
    return sequelize.sync({ force: false });
  })
  .then(() => {
    console.log('All models were synchronized successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

const app = express();

// Ensure global fetch is available
global.fetch = fetch;

// Configure Unsplash API
const unsplash = createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY,
  fetch: fetch
});

// Default backgrounds in case of API failure
const DEFAULT_BACKGROUNDS = [
  {
    id: 'default-1',
    url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809',
    thumbnail: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=200',
    description: 'Default background 1',
    author: 'System'
  },
  {
    id: 'default-2',
    url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc810',
    thumbnail: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc810?w=200',
    description: 'Default background 2',
    author: 'System'
  }
];

// Multer configuration for file uploads
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const imageFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, 
    files: 1 
  }
});

const multerErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    let errorMessage = 'File upload error';
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        errorMessage = 'File is too large. Maximum size is 50MB';
        break;
      case 'LIMIT_FILE_COUNT':
        errorMessage = 'Too many files uploaded. Only 1 file is allowed';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        errorMessage = 'Unexpected file field';
        break;
    }

    return res.status(400).json({
      error: 'Upload Error',
      message: errorMessage
    });
  } else if (err) {
    console.error('Upload middleware error:', err);
    return res.status(500).json({
      error: 'Server Error',
      message: err.message || 'An unexpected error occurred during file upload'
    });
  }
  next();
};

const port = process.env.PORT || 3001;

// Get API keys from environment variables
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const REMOVEBG_API_KEY = process.env.REMOVEBG_API_KEY;

// Validate environment variables with more detailed logging
if (!UNSPLASH_ACCESS_KEY) {
  console.error('❌ CRITICAL ERROR: UNSPLASH_ACCESS_KEY is not set in environment variables');
  console.error('Please check your .env file and ensure UNSPLASH_ACCESS_KEY is correctly configured');
  console.error('You can find the key in .env.example');
  process.exit(1);
}

if (!REMOVEBG_API_KEY) {
  console.error('❌ CRITICAL ERROR: REMOVEBG_API_KEY is not set in environment variables');
  console.error('Please check your .env file and ensure REMOVEBG_API_KEY is correctly configured');
  console.error('You can find the key in .env.example');
  process.exit(1);
}

console.log('✅ Environment variables successfully validated');

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(multerErrorHandler);

// Add global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 测试邮件路由
app.post('/api/register', async (req, res) => {
  try {
    console.log('Receive Email:', req.body);
    await sendVerificationEmail(req.body.email, 'test-token-' + Date.now());
    res.json({ 
      success: true,
      message: `Email has sent to ${req.body.email}，please check your inbox`
    });
  } catch (error) {
    console.error('failed to send email:', error);
    res.status(500).json({ 
      error: 'failed to send email',
      details: error.message,
      solution: 'Please try again later'
    });
  }
});

// Add a root route
app.get('/', (req, res) => {
  res.json({
    message: 'AI Magic Studio Backend is running!',
    routes: [
      '/api/unsplash/search',
      '/api/remove-background'
    ],
    timestamp: new Date().toISOString()
  });
});

// Unsplash Search Route
app.get('/api/unsplash/search', async (req, res) => {
  console.log('=== Unsplash Search Request ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Search Query:', req.query);

  // Get API key from environment variable
  const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

  if (!UNSPLASH_ACCESS_KEY) {
    console.error('Error: UNSPLASH_ACCESS_KEY is not set in environment variables');
    return res.status(500).json({ error: 'Unsplash API key is missing' });
  }

  try {
    const { query, page = 1, perPage = 20 } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const apiUrl = new URL('https://api.unsplash.com/search/photos');
    apiUrl.searchParams.append('query', query.toString());
    apiUrl.searchParams.append('page', page.toString());
    apiUrl.searchParams.append('per_page', perPage.toString());

    console.log('Unsplash API Request URL:', apiUrl.toString());

    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
          'Accept-Version': 'v1'
        }
      });

      console.log('API Response Status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Unsplash API Error:', errorText);
        return res.status(response.status).json({ 
          error: 'Failed to fetch from Unsplash',
          details: errorText 
        });
      }

      const data = await response.json();

      console.log('Unsplash API Response:', {
        total: data.total,
        totalPages: Math.ceil(data.total / perPage),
        resultsCount: data.results?.length
      });

      // Log first few results for debugging
      if (data.results && data.results.length > 0) {
        console.log('First Result:', {
          id: data.results[0].id,
          urls: data.results[0].urls,
          description: data.results[0].description || data.results[0].alt_description
        });
      }

      res.json({
        results: data.results,
        total: data.total,
        totalPages: Math.ceil(data.total / perPage)
      });

    } catch (fetchError) {
      console.error('Fetch Error:', fetchError);
      res.status(500).json({ 
        error: 'Network error while fetching from Unsplash',
        details: fetchError.message 
      });
    }
  } catch (error) {
    console.error('Unexpected Error:', error);
    res.status(500).json({ 
      error: 'Unexpected error during Unsplash search',
      details: error.message 
    });
  }
});

// Direct Unsplash API Test Route
app.get('/api/unsplash/test', async (req, res) => {
  console.log('=== Unsplash Direct API Test ===');
  console.log('Timestamp:', new Date().toISOString());

  try {
    // Validate access key
    if (!process.env.UNSPLASH_ACCESS_KEY) {
      console.error('Unsplash Access Key is missing');
      return res.status(500).json({
        error: 'Unsplash Access Key is not configured'
      });
    }

    // Attempt direct fetch
    const apiUrl = new URL('https://api.unsplash.com/search/photos');
    apiUrl.searchParams.append('query', 'test');
    apiUrl.searchParams.append('page', '1');
    apiUrl.searchParams.append('per_page', '1');

    console.log('Test API URL:', apiUrl.toString());

    try {
      // Direct fetch using node-fetch
      const apiResponse = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
          'Accept-Version': 'v1'
        }
      });

      console.log('API Response Status:', apiResponse.status);
      
      // Check for successful response
      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        console.error('API Error Response:', errorText);
        return res.status(apiResponse.status).json({
          error: 'Failed to fetch images',
          details: errorText
        });
      }

      // Parse the response
      const responseData = await apiResponse.json();
      
      console.log('Raw API Response:', JSON.stringify({
        total: responseData.total,
        resultsCount: responseData.results?.length,
        firstResult: responseData.results?.[0]
      }, null, 2));

      // Return raw response for debugging
      res.json({
        message: 'Unsplash API Test Successful',
        total: responseData.total,
        resultsCount: responseData.results?.length,
        firstResult: responseData.results?.[0]
      });

    } catch (apiCallError) {
      console.error('Direct API Call Error:', {
        name: apiCallError.name,
        message: apiCallError.message,
        stack: apiCallError.stack
      });

      return res.status(500).json({
        error: 'Failed to call Unsplash API',
        details: apiCallError.message
      });
    }
  } catch (error) {
    console.error('Unexpected Unsplash Test Error:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      type: typeof error
    });

    // Return error details
    res.status(500).json({
      error: 'Unexpected error during Unsplash API test',
      details: error.message
    });
  }
});

app.post('/api/remove-background', upload.single('image'), async (req, res) => {
  console.log('=== Background Removal Request ===');
  console.log('Request received at:', new Date().toISOString());
  
  if (!req.file) {
    console.error('No file uploaded');
    return res.status(400).json({
      error: 'No image file uploaded',
      message: 'Please upload a valid image file'
    });
  }

  console.log('Uploaded File Details:', {
    originalName: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    path: req.file.path
  });

  try {
    const formData = new FormData();
    formData.append('image_file', fs.createReadStream(req.file.path), {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });
    formData.append('size', 'auto');

    console.log('Sending request to Remove.bg API');
    const removeBgResponse = await axios.post('https://api.remove.bg/v1.0/removebg', formData, {
      headers: {
        ...formData.getHeaders(),
        'X-Api-Key': process.env.REMOVEBG_API_KEY
      },
      responseType: 'arraybuffer'
    });

    console.log('Remove.bg API Response:', {
      status: removeBgResponse.status,
      contentType: removeBgResponse.headers['content-type'],
      dataSize: removeBgResponse.data.length
    });

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    // Validate response
    if (!removeBgResponse.data || removeBgResponse.data.length === 0) {
      throw new Error('Received empty image data from Remove.bg');
    }

    res.set('Content-Type', 'image/png');
    res.send(removeBgResponse.data);

  } catch (error) {
    console.error('Background Removal Error:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data ? error.response.data.toString() : 'No data'
      } : 'No response'
    });

    // Clean up uploaded file in case of error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    // Determine appropriate error response
    let statusCode = 500;
    let errorResponse = {
      error: 'Failed to remove background',
      message: 'An unexpected error occurred'
    };

    if (error.response) {
      switch (error.response.status) {
        case 400:
          statusCode = 400;
          errorResponse.message = 'Invalid request to Remove.bg';
          break;
        case 402:
          statusCode = 402;
          errorResponse.message = 'Remove.bg API usage limit reached';
          break;
        case 403:
          statusCode = 403;
          errorResponse.message = 'Remove.bg API authentication failed';
          break;
        case 429:
          statusCode = 429;
          errorResponse.message = 'Too many requests to Remove.bg';
          break;
      }

      try {
        const errorDetails = error.response.data ? error.response.data.toString() : '';
        errorResponse.details = errorDetails;
      } catch (parseError) {
        console.error('Error parsing error response:', parseError);
      }
    } else if (error.request) {
      errorResponse.message = 'No response received from Remove.bg API';
    } else {
      errorResponse.message = error.message || 'Error setting up background removal request';
    }

    res.status(statusCode).json(errorResponse);
  }
});

async function callOpenRouterAPI(prompt) {
  try {
    console.log('OpenRouter API Request:', {
      model: "anthropic/claude-3.5-haiku:beta",
      prompt: prompt
    });

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`, 
        "HTTP-Referer": process.env.SITE_URL || "https://default-site.com", 
        "X-Title": process.env.SITE_NAME || "AI Magic Studio",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "anthropic/claude-3.5-haiku:beta",
        "messages": [
          {
            "role": "user",
            "content": prompt
          }
        ],
        "max_tokens": 1000  // Maintain existing max tokens setting
      })
    });

    console.log('OpenRouter API Response Status:', response.status);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('OpenRouter API Error Body:', errorBody);
      throw new Error(`API call failed with status ${response.status}: ${errorBody}`);
    }

    const data = await response.json();
    console.log('OpenRouter API Full Response:', JSON.stringify(data, null, 2));

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response structure from OpenRouter API');
    }

    return data.choices[0].message.content; 
  } catch (error) {
    console.error("Detailed Error calling OpenRouter API:", {
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
}

// Enhanced translation route with more language support
app.post('/api/text/translate', async (req, res) => {
  try {
    const { text, sourceLanguage = 'auto', targetLanguage } = req.body;
    console.log('Translate Request:', req.body);
    
    // Validate languages
    const supportedLanguages = ['zh', 'en', 'ja', 'es', 'fr', 'de', 'ko', 'ru', 'ar'];
    if (!supportedLanguages.includes(targetLanguage)) {
      return res.status(400).json({ error: 'Unsupported target language' });
    }

    // Construct a more flexible translation prompt
    const prompt = `You are a professional translator. Translate the following text from ${sourceLanguage} to ${targetLanguage} with high accuracy and preserve the original tone and context:

Source Text: ${text}

Translation Guidelines:
- Maintain the original meaning
- Adapt cultural nuances
- Ensure natural-sounding translation in the target language`;

    const translation = await callOpenRouterAPI(prompt);
    res.json({ translation });
  } catch (error) {
    console.error('Translate Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// New Social Media Content Generation Route
app.post('/api/text/social-content', async (req, res) => {
  try {
    const { 
      topic, 
      platform = 'general', 
      tone = 'engaging', 
      keywords = [], 
      additionalContext = '' 
    } = req.body;

    console.log('Social Content Request:', req.body);

    // Construct a comprehensive prompt for content generation
    const prompt = `You are a professional social media content creator. Generate a compelling and viral-worthy post about the following topic:

Topic: ${topic}
Platform: ${platform}
Tone: ${tone}
Keywords: ${keywords.join(', ')}
Additional Context: ${additionalContext}

Content Generation Guidelines:
1. Create an attention-grabbing headline
2. Write a concise, engaging post (150-250 words)
3. Include relevant hashtags
4. Adapt the style to the specified platform
5. Incorporate the keywords naturally
6. Aim to provoke emotion, curiosity, or action

Your task is to craft content that maximizes engagement and shareability.`;

    const socialContent = await callOpenRouterAPI(prompt);
    
    // Optional: Add some post-processing or formatting
    const formattedContent = {
      headline: socialContent.split('\n')[0],
      body: socialContent.split('\n').slice(1).join('\n').trim(),
      hashtags: keywords.map(kw => `#${kw.replace(/\s+/g, '')}`)
    };

    res.json(formattedContent);
  } catch (error) {
    console.error('Social Content Generation Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add text processing routes directly in server.js
app.post('/api/text/summarize', async (req, res) => {
  try {
    const { text, language } = req.body;
    console.log('Summarize Request:', req.body);
    const prompt = `Summarize the following text in ${language}: ${text}`;
    const summary = await callOpenRouterAPI(prompt);
    res.json({ summary });
  } catch (error) {
    console.error('Summarize Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/text/grammar-check', async (req, res) => {
  try {
    const { text, language } = req.body;
    console.log('Grammar Check Request:', req.body);
    const prompt = `Check the grammar of the following text in ${language}: ${text}`;
    const grammarCheck = await callOpenRouterAPI(prompt);
    res.json({ grammarCheck });
  } catch (error) {
    console.error('Grammar Check Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 用户注册
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 检查邮箱是否已注册
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'this email is already registered' });
    }

    // 生成验证信息
    const verificationToken = crypto.randomBytes(20).toString('hex');
    const verificationExpires = new Date(Date.now() + 86400000); // 24小时有效

    // 生成验证链接
    const verificationLink = `${BASE_URL}/verify-email?token=${verificationToken}`;

    // 创建用户
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password: hashedPassword,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
      isVerified: false
    });

    // 发送验证邮件
    await sendVerificationEmail(email, verificationLink);

    res.status(201).json({
      success: true,
      message: '验证邮件已发送，请检查您的邮箱'
    });

  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ 
      error: '注册失败',
      details: error.message 
    });
  }
});

// 邮箱验证
app.get('/api/auth/verify-email', async (req, res) => {
  try {
    const { token } = req.query;
    
    const user = await User.findOne({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: { [Op.gt]: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ 
        error: '验证链接无效或已过期',
        solution: '请重新注册或申请新的验证链接' 
      });
    }

    await user.update({
      isVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null
    });

    res.json({ 
      success: true,
      message: '邮箱验证成功！现在可以登录' 
    });
    
  } catch (error) {
    res.status(500).json({ error: '验证失败' });
  }
});

// 登录功能
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ where: { email } });
    
    // 验证基础信息
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'emaill address or password is incorrect' });
    }

    // 验证邮箱状态
    if (!user.isVerified) {
      return res.status(403).json({ 
        error: '邮箱未验证',
        solution: {
          resendEmail: '/api/auth/resend-verification',
          contactSupport: 'support@aimagic.studio'
        }
      });
    }

    // 生成JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ 
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    res.status(500).json({ error: '登录失败' });
  }
});

const server = app.listen(port, '0.0.0.0', () => {
  console.log('===========================================');
  console.log(`🚀 Server is running on:`);
  console.log(`   - Port: ${port}`);
  console.log(`   - Local: http://localhost:${port}`);
  console.log(`   - Network: http://0.0.0.0:${port}`);
  console.log('===========================================');
  console.log('Available Routes:');
  app._router.stack.forEach((r) => {
    if (r.route && r.route.path) {
      console.log(`   - ${Object.keys(r.route.methods).join(', ').toUpperCase()} ${r.route.path}`);
    }
  });
  console.log('===========================================');
});

server.on('error', (error) => {
  console.error('❌ Server Startup Error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Is another server running?`);
    process.exit(1);
  }
});

module.exports = app;
module.exports.handler = serverless(app);
