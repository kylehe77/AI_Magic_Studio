# AI Magic Studio

AI Magic Studio is a cutting-edge web application that leverages AI technologies to transform and process images and text with powerful, user-friendly tools.
You are welcome to explore this website through:  https://ai-magic-studio.onrender.com/

## 🚀 Project Overview

AI Magic Studio provides two primary AI-powered features:
- **Image Processing**: Remove backgrounds, edit, and transform images
- **Text Processing**: Generate, edit, and enhance text using advanced AI capabilities

## 📂 Project Structure

```
AI_Magic_Studio/
├── backend/
│   ├── src/
│   │   ├── server.js         # Main Express server file
│   │   └── uploads/          # Temporary storage for uploaded files during processing
│   ├── .env                  # Environment configuration
│   └── package.json          # Backend dependencies
│
└── frontend/
    ├── public/               # Static assets
    └── src/
        ├── components/       # Reusable React components
        │   ├── Header.tsx    # Navigation header
        │   ├── Footer.tsx    # Page footer
        │   ├── ImageProcessor.tsx  # Image processing component
        │   └── ...
        ├── pages/            # Page-level components
        │   ├── HomePage.tsx  # Landing page
        │   ├── TextProcessor.tsx  # Text processing page
        │   └── ...
        ├── App.tsx           # Main application component
        └── index.tsx         # React entry point
        └── .env                  # Environment configuration    
```

### 📁 Uploads Directory
The `uploads/` directory in the backend is a temporary storage location for files uploaded during image processing. Files are temporarily stored here before being processed (e.g., background removal) and are typically deleted after processing.

## ✨ Features

### Image Processing
- Background removal
- Image transformation
- AI-powered editing tools

### Text Processing
- Text generation
- Content enhancement
- Multi-purpose text tools

## 🛠 Technologies

### Frontend
- React
- TypeScript
- React Router
- CSS3 with modern styling

### Backend
- Node.js
- Express.js
- AI Integration APIs

## 🔧 Setup and Installation

### Prerequisites
- Node.js (v14+ recommended)
- npm or Yarn

### Installation Steps

1. Clone the repository
   ```bash
   git clone https://github.com/kylehe77/AI_Magic_Studio.git
   cd AI_Magic_Studio
   ```

2. Install backend dependencies
   ```bash
   cd backend
   npm install
   ```

3. Install frontend dependencies
   ```bash
   cd ../frontend
   npm install
   ```

4. Configure environment variables
   - Create `.env` files in both `backend` and `frontend` directories
   - Add necessary API keys for:
     * Unsplash
     * Remove.bg
     * OpenAI/OpenRouter

5. Run the application
   ```bash
   # In backend directory
   npm start

   # In another terminal, in frontend directory
   npm start
   ```

## 🌐 Access the Application
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:3001`

## 🤝 Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.

## 📧 Contact
Kyle He - kyleh77@gmail.com
Project Link: [https://github.com/kylehe77/AI_Magic_Studio](https://github.com/kylehe77/AI_Magic_Studio)
