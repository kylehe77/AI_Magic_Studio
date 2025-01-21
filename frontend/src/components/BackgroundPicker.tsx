import React, { useState } from 'react';
import './BackgroundPicker.css';

interface BackgroundPickerProps {
  onSelectBackground: (imageUrl: string) => void;
  onClose: () => void;
}

interface UnsplashImage {
  id: string;
  urls: {
    regular: string;
    thumb: string;
  };
  alt_description: string;
  user: {
    name: string;
  };
}

const BackgroundPicker: React.FC<BackgroundPickerProps> = ({ onSelectBackground, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/unsplash/search?query=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }
      const data = await response.json();
      setImages(data.results);
    } catch (err) {
      setError('Failed to load images. Please try again.');
      console.error('Error fetching images:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="background-picker-overlay">
      <div className="background-picker">
        <div className="background-picker-header">
          <h2>Choose a Background</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="search-section">
          <div className="search-input-container">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search for backgrounds..."
              className="search-input"
            />
            <button 
              className="search-button"
              onClick={handleSearch}
              disabled={isLoading}
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="images-grid">
          {images.map((image) => (
            <div 
              key={image.id} 
              className="image-item"
              onClick={() => onSelectBackground(image.urls.regular)}
            >
              <img src={image.urls.thumb} alt={image.alt_description || 'Unsplash image'} />
              <div className="image-credit">
                Photo by {image.user.name}
              </div>
            </div>
          ))}
        </div>

        {!isLoading && images.length === 0 && (
          <div className="no-results">
            {searchQuery ? 'No images found. Try a different search.' : 'Search for background images above.'}
          </div>
        )}

        {isLoading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading images...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BackgroundPicker;
