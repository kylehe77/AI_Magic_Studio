import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import BackgroundPicker from './BackgroundPicker';
import './ImageProcessor.css';

const ImageProcessor: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);
  const [finalImage, setFinalImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    const file = acceptedFiles[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result as string);
      };
      fileReader.readAsDataURL(file);
      setProcessedImage(null);
    } else {
      setError('Please upload a valid image file');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    multiple: false
  });

  const handleRemoveBackground = async () => {
    if (!selectedImage) return;
    
    setError(null);
    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append("size", "auto");
      formData.append("image_file", selectedImage);

      const response = await fetch("https://api.remove.bg/v1.0/removebg", {
        method: "POST",
        headers: {
          "X-Api-Key": process.env.REACT_APP_REMOVE_BG_API_KEY || ''
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: 'image/png' });
      const processedImageUrl = URL.createObjectURL(blob);
      setProcessedImage(processedImageUrl);
      setShowBackgroundPicker(true);
      
    } catch (err) {
      console.error('Error removing background:', err);
      setError(err instanceof Error ? err.message : 'Failed to process image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectBackground = async (backgroundUrl: string) => {
    if (!processedImage) return;
    
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Load background image
      const bgImage = new Image();
      bgImage.crossOrigin = "anonymous";
      await new Promise((resolve, reject) => {
        bgImage.onload = resolve;
        bgImage.onerror = reject;
        bgImage.src = backgroundUrl;
      });

      // Load processed image
      const fgImage = new Image();
      fgImage.crossOrigin = "anonymous";
      await new Promise((resolve, reject) => {
        fgImage.onload = resolve;
        fgImage.onerror = reject;
        fgImage.src = processedImage;
      });

      // Set canvas size to match the processed image
      canvas.width = fgImage.width;
      canvas.height = fgImage.height;

      // Draw background image (scaled and centered)
      const scale = Math.max(canvas.width / bgImage.width, canvas.height / bgImage.height);
      const x = (canvas.width - bgImage.width * scale) / 2;
      const y = (canvas.height - bgImage.height * scale) / 2;
      
      ctx.drawImage(bgImage, x, y, bgImage.width * scale, bgImage.height * scale);
      
      // Draw the processed image
      ctx.drawImage(fgImage, 0, 0, canvas.width, canvas.height);

      // Convert canvas to image URL
      const finalImageUrl = canvas.toDataURL('image/png');
      setFinalImage(finalImageUrl);
      setShowBackgroundPicker(false);
    } catch (err) {
      console.error('Error compositing images:', err);
      setError('Failed to combine images. Please try again.');
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setProcessedImage(null);
    setFinalImage(null);
    setError(null);
  };

  const handleDownload = () => {
    const imageToDownload = finalImage || processedImage;
    if (imageToDownload) {
      const link = document.createElement('a');
      link.href = imageToDownload;
      link.download = 'processed-image.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="image-processor">
      <div className="header">
        <h1>AI Background Remover</h1>
        <p>Transform your images instantly with our AI-powered background removal tool</p>
      </div>

      <div className="upload-section">
        <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''} ${previewUrl ? 'has-image' : ''}`}>
          <input {...getInputProps()} />
          {!previewUrl ? (
            <div className="dropzone-content">
              <i className="upload-icon">📁</i>
              <p>{isDragActive ? 'Drop your image here' : 'Drag & drop an image, or click to select'}</p>
              <span className="dropzone-hint">Supports JPG, PNG, WEBP</span>
            </div>
          ) : (
            <div className="dropzone-content">
              <p>Drop a new image to replace</p>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="image-preview-container">
        {previewUrl && (
          <div className="image-preview">
            <div className="preview-header">
              <h3>Original Image</h3>
              <button className="reset-button" onClick={handleReset}>
                Remove
              </button>
            </div>
            <div className="image-wrapper">
              <img src={previewUrl} alt="Preview" />
            </div>
          </div>
        )}
        
        {(processedImage || finalImage) && (
          <div className="image-preview">
            <div className="preview-header">
              <h3>Processed Image</h3>
              <div className="preview-actions">
                {processedImage && !finalImage && (
                  <button 
                    className="change-bg-button"
                    onClick={() => setShowBackgroundPicker(true)}
                  >
                    Change Background
                  </button>
                )}
                <button className="download-button" onClick={handleDownload}>
                  Download
                </button>
              </div>
            </div>
            <div className="image-wrapper">
              <img 
                src={finalImage || processedImage || ''} 
                alt="Processed" 
                style={{ display: finalImage || processedImage ? 'block' : 'none' }}
              />
            </div>
          </div>
        )}
      </div>

      {showBackgroundPicker && (
        <BackgroundPicker
          onSelectBackground={handleSelectBackground}
          onClose={() => setShowBackgroundPicker(false)}
        />
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {previewUrl && (
        <div className="action-buttons">
          <button 
            className={`process-button ${isProcessing ? 'processing' : ''}`}
            onClick={handleRemoveBackground}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <span className="spinner"></span>
                Processing...
              </>
            ) : (
              'Remove Background'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageProcessor;
