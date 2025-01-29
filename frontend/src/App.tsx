import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ImageProcessor from './components/ImageProcessor';
import HomePage from './pages/HomePage';
import TextProcessor from './pages/TextProcessor';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/image-processor" element={<ImageProcessor />} />
            <Route path="/text-processor" element={<TextProcessor />} />
          </Routes>
        </main>

        <Footer />

      </div>
    </Router>
  );
}

export default App;
