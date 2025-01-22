import React, { useState, useEffect } from 'react';
import './BackgroundPicker.css';

interface BackgroundPickerProps {
  onSelectBackground: (imageUrl: string) => void;
  onClose: () => void;
  selectedBackground?: string | null;
}

interface UnsplashImage {
  id: string;
  urls: {
    regular: string;
    thumb: string;
  };
  alt_description?: string;
  description?: string;
  user: {
    name: string;
  };
}

interface UnsplashSearchResponse {
  results: UnsplashImage[];
  total: number;
  totalPages: number;
}

const BackgroundPicker: React.FC<BackgroundPickerProps> = ({ 
  onSelectBackground, 
  onClose, 
  selectedBackground 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const handleSearch = async (currentPage: number = 1) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/unsplash/search?query=${encodeURIComponent(searchQuery)}&page=${currentPage}&perPage=20`);
      
      console.log('Fetch Response:', {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error Response Text:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data: UnsplashSearchResponse = await response.json();
      
      console.log('Parsed Response:', {
        resultsCount: data.results?.length,
        total: data.total,
        totalPages: data.totalPages
      });

      // Append images if loading more pages, otherwise replace
      setImages(currentPage === 1 ? data.results : [...images, ...data.results]);
      setPage(currentPage);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error('Complete Search Error:', {
        name: err instanceof Error ? err.name : 'Unknown Error',
        message: err instanceof Error ? err.message : String(err),
        type: typeof err
      });

      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to load images. Please try again.';
      
      setError(errorMessage);
      setImages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (page < totalPages) {
      handleSearch(page + 1);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Initial search when component loads
  useEffect(() => {
    handleSearch();
  }, []);

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
              onClick={() => handleSearch()}
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
              className={`image-item ${selectedBackground === image.urls.regular ? 'selected' : ''}`}
              onClick={() => onSelectBackground(image.urls.regular)}
            >
              <img 
                src={image.urls.thumb} 
                alt={image.alt_description || image.description || 'Unsplash image'} 
              />
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

        {page < totalPages && (
          <div className="load-more-section">
            <button 
              onClick={handleLoadMore}
              disabled={isLoading}
              className="load-more-button"
            >
              {isLoading ? 'Loading...' : 'Load More'}
            </button>
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
