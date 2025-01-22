const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const { createApi } = require('unsplash-js');
const nodeFetch = require('node-fetch');

// Manually read and log .env file contents
const envPath = path.resolve(__dirname, '../.env');
console.log('Attempting to read .env file from:', envPath);

try {
  const envFileContents = fs.readFileSync(envPath, 'utf8');
  console.log('Raw .env file contents:');
  console.log(envFileContents);
} catch (error) {
  console.error('Error reading .env file:', error);
}

// Load environment variables with manual parsing as a fallback
const result = dotenv.config({ 
  path: envPath 
});

if (result.error) {
  console.error('dotenv config error:', result.error);
}

// Manually parse environment variables
const parsedEnv = dotenv.parse(fs.readFileSync(envPath));
console.log('Parsed environment variables:');
Object.keys(parsedEnv).forEach(key => {
  process.env[key] = parsedEnv[key];
  console.log(`${key}: ${parsedEnv[key]}`);
});

dotenvExpand.expand(result);

console.log('Explicitly loading .env from:', envPath);
console.log('Current working directory:', process.cwd());
console.log('Environment variables loaded:');
console.log('UNSPLASH_ACCESS_KEY:', process.env.UNSPLASH_ACCESS_KEY ? 'SET' : 'NOT SET');
console.log('REMOVEBG_API_KEY:', process.env.REMOVEBG_API_KEY ? 'SET' : 'NOT SET');
console.log('Full process.env keys:', Object.keys(process.env));

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();

// Ensure global fetch is available
global.fetch = nodeFetch;

// Configure Unsplash API
const unsplash = createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY,
  fetch: nodeFetch
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

// Comprehensive CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',   
    'http://127.0.0.1:3000',   
    'http://localhost:3001',   
    'http://127.0.0.1:3001'    
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(multerErrorHandler);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error', 
    message: err.message,
    stack: err.stack 
  });
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
      const response = await nodeFetch(apiUrl, {
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
      const apiResponse = await nodeFetch(apiUrl, {
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

const server = app.listen(port, '0.0.0.0', () => {
  console.log('===========================================');
  console.log(`🚀 Server is running on:`);
  console.log(`   - Port: ${port}`);
  console.log(`   - Local: http://localhost:${port}`);
  console.log(`   - Network: http://0.0.0.0:${port}`);
  console.log('===========================================');
  console.log('Available Routes:');
  console.log('   - GET /');
  console.log('   - GET /api/unsplash/search');
  console.log('   - POST /api/remove-background');
  console.log('===========================================');
});

server.on('error', (error) => {
  console.error('❌ Server Startup Error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Is another server running?`);
  }
});

module.exports = app;
