# AI Background Remover

A web application that removes image backgrounds and allows you to set new backgrounds using Unsplash images.

## Project Structure

```
AI_web/
├── backend/               # Backend server code
│   ├── src/
│   │   └── server.js     # Express server with Unsplash API integration
│   └── package.json      # Backend dependencies
│
└── frontend/             # React frontend code
    ├── public/           # Static files
    └── src/
        ├── components/   # React components
        │   ├── BackgroundPicker.tsx    # Unsplash image picker
        │   ├── ImageProcessor.tsx      # Main image processing component
        │   └── Header.tsx             # Application header
        ├── App.tsx       # Root component
        └── index.tsx     # Entry point
```

## Features

- Upload images via drag & drop or file picker
- Remove image backgrounds using remove.bg API
- Search and select backgrounds from Unsplash
- Download processed images

## Setup and Running

1. Set up environment variables:
   ```bash
   # In backend directory
   cp .env.example .env
   # Edit .env and add your Unsplash API key
   
   # In frontend directory
   cp .env.example .env
   # Edit .env and add your Remove.bg API key
   ```

2. Install dependencies:
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. Start the servers:
   ```bash
   # Start backend server (from backend directory)
   npm start

   # Start frontend development server (from frontend directory)
   npm start
   ```

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:3001

## APIs Used

- remove.bg API for background removal
- Unsplash API for background images
- OpenRouter API for AI model integration

## Integrated APIs

Our project leverages several powerful APIs:
- remove.bg API for background removal
- Unsplash API for background images
- OpenRouter API for AI model integration

## OpenRouter AI Configuration

### API Key Setup

1. Register an account at [OpenRouter Platform](https://openrouter.ai/)
2. Obtain your API key from the developer console
3. Set the environment variable `OPENROUTER_API_KEY` with your actual API key

**Important Configuration Notes**:
- OpenRouter supports multiple AI models
- Default model is set to Anthropic Claude 2
- You can easily switch models in the service configuration
- Provides a unified API for different AI providers

**Recommended Models**:
- `anthropic/claude-2`: High-quality, versatile model
- `openai/gpt-3.5-turbo`: Cost-effective option
- `google/palm-2`: Alternative model

**Security Recommendations**:
- Never commit your API key to version control
- Use environment variables
- Protect your API key to prevent unauthorized usage

## Environment Variables

Backend (.env):
- `OPENROUTER_API_KEY`: Your OpenRouter API key

Frontend (.env):
- `REACT_APP_REMOVE_BG_API_KEY`: Your remove.bg API key

## Security Notes

- Never commit .env files to version control
- Keep your API keys private
- Use environment variables for all sensitive information
