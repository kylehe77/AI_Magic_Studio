import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import html2canvas from 'html2canvas';
import './ImageProcessor.css';

interface Position {
  x: number;
  y: number;
}

enum ProcessingStage {
  Initial,
  Uploaded,
  BackgroundRemoved,
  Processing
}

const ImageProcessor: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [selectedBackgroundImage, setSelectedBackgroundImage] = useState<string | null>(null);
  const [processingStage, setProcessingStage] = useState<ProcessingStage>(ProcessingStage.Initial);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unsplashImages, setUnsplashImages] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('background');
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });
  
  const foregroundRef = useRef<HTMLDivElement>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file || !file.type.startsWith('image/')) {
      setError('Please upload a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    setSelectedFile(file);
    setProcessingStage(ProcessingStage.Uploaded);
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.png', '.jpg', '.webp']
    },
    multiple: false
  });

  const handleRemoveBackground = async () => {
    if (!selectedFile) return;
    
    setIsProcessing(true);
    setProcessingStage(ProcessingStage.Processing);
    
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await fetch('http://localhost:3001/api/remove-background', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to remove background');
      }

      const blob = await response.blob();
      const processedImageUrl = URL.createObjectURL(blob);
      setProcessedImage(processedImageUrl);
      setProcessingStage(ProcessingStage.BackgroundRemoved);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!foregroundRef.current) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !foregroundRef.current) return;

    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleUnsplashSearch();
    }
  };

  const handleUnsplashSearch = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/unsplash/search?query=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error('Failed to fetch images');
      const data = await response.json();
      setUnsplashImages(data.results);
    } catch (error) {
      console.error('Error fetching Unsplash images:', error);
    }
  };

  const handleBackgroundSelect = (imageUrl: string) => {
    setSelectedBackgroundImage(imageUrl);
    setPosition({ x: 0, y: 0 }); // Reset position when new background is selected
  };

  const handleDownload = (imageUrl: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = 'processed-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCapture = () => {
    const container = document.querySelector('.composite-container');
    if (!container) return;

    html2canvas(container as HTMLElement).then((canvas: HTMLCanvasElement) => {
      const link = document.createElement('a');
      link.download = 'composite-image.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  };

  const renderCompositePreview = () => {
    if (!selectedBackgroundImage || !processedImage) return null;

    return (
      <div className="composite-preview">
        <h3>Preview</h3>
        <div 
          className="composite-container"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <img
            src={selectedBackgroundImage}
            alt="Background"
            className="background-image"
          />
          <div
            ref={foregroundRef}
            className="draggable-foreground"
            onMouseDown={handleMouseDown}
            style={{
              transform: `translate(${position.x}px, ${position.y}px)`
            }}
          >
            <img
              src={processedImage}
              alt="Foreground"
            />
          </div>
        </div>
        <button
          onClick={handleCapture}
          className="button"
        >
          Download Composite Image
        </button>
      </div>
    );
  };

  return (
    <div className="image-processor-container">
      {error && <div className="error-message">{error}</div>}
      <div className="image-upload-section">
        {processingStage === ProcessingStage.Initial ? (
          <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
            <input {...getInputProps()} />
            <p>Drag & drop an image here, or click to select</p>
          </div>
        ) : (
          <div className="preview-container">
            <img 
              src={processedImage || previewUrl || ''} 
              alt="Preview" 
              className="preview-image" 
            />
            <div className="action-buttons">
              <button 
                onClick={() => setProcessingStage(ProcessingStage.Initial)}
                className="button secondary"
              >
                Remove Image
              </button>
              {processingStage === ProcessingStage.Uploaded && (
                <button 
                  onClick={handleRemoveBackground}
                  className="button"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Remove Background'}
                </button>
              )}
            </div>
            {processedImage && (
              <button 
                onClick={() => handleDownload(processedImage)}
                className="button"
              >
                Download Image without Background
              </button>
            )}
          </div>
        )}
      </div>

      <div className="background-selection-section">
        <div className="search-container">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleSearchKeyPress}
            placeholder="Search backgrounds..."
            className="search-input"
          />
          <button onClick={handleUnsplashSearch} className="button">
            Search
          </button>
        </div>

        <div className="background-grid">
          {unsplashImages.map((image) => (
            <div 
              key={image.id}
              className={`background-item ${selectedBackgroundImage === image.urls.regular ? 'selected' : ''}`}
              onClick={() => handleBackgroundSelect(image.urls.regular)}
            >
              <img src={image.urls.thumb} alt={image.alt_description || 'Background option'} />
            </div>
          ))}
        </div>

        {renderCompositePreview()}
      </div>
    </div>
  );
};

export default ImageProcessor;