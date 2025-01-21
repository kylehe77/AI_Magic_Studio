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

1. Install dependencies:
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

2. Start the servers:
   ```bash
   # Start backend server (from backend directory)
   npm start

   # Start frontend development server (from frontend directory)
   npm start
   ```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:3001

## APIs Used

- remove.bg API for background removal
- Unsplash API for background images

## Environment Variables

Make sure to set up the following environment variables:
- `UNSPLASH_ACCESS_KEY`: Your Unsplash API access key
- `REMOVE_BG_API_KEY`: Your remove.bg API key
