import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/Home.css';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carousel images
  const carouselImages = [
    '/shirt.jpg',
    '/shirt2.jpg',
    'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2087&q=80',
    '/shirt1.jpg'
  ];

  // Fetch new arrivals from backend
  useEffect(() => {
    fetchNewArrivals();
  }, []);

  const fetchNewArrivals = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/new-arrivals`);
      setNewArrivals(response.data);
    } catch (error) {
      console.error('Error fetching new arrivals:', error);
      // Fallback to default new arrivals if API fails
      setNewArrivals([
        {
          _id: '1',
          title: 'Premium T-Shirts',
          price: 'From $49.99',
          image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
          subtitle: 'High-quality cotton t-shirts'
        },
        {
          _id: '2',
          title: 'Designer Jeans',
          price: 'From $89.99',
          image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
          subtitle: 'Premium denim collection'
        },
        {
          _id: '3',
          title: 'Accessories',
          price: 'From $29.99',
          image: 'https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
          subtitle: 'Complete your look'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="home">
      {/* Carousel Section */}
      <section className="carousel-section">
        <div className="carousel">
          <div className="carousel-inner">
            {carouselImages.map((image, index) => (
              <div
                key={index}
                className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
              >
                <img
                  src={image}
                  alt={`Fashion ${index + 1}`}
                  className="carousel-image"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjI1IiB5PSIyNSIgZG9taW5hbnQtYmFzZWxpbmU9Im1iZWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5Q0EzQUYiIGZvbnQtc2l6ZT0iMTIiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4=';
                  }}
                />
                <div className="carousel-overlay">
                  <div className="carousel-content">
                    <h1 className="carousel-title">Discover Your Style</h1>
                    <p className="carousel-subtitle">
                      Explore our curated collection of premium clothing and accessories. 
                      Quality fashion for every occasion, delivered to your doorstep.
                    </p>
                    <div className="carousel-buttons">
                      <Link to="/products" className="btn btn-primary">
                        Shop Now
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button className="carousel-prev" onClick={prevSlide}>
            ‹
          </button>
          <button className="carousel-next" onClick={nextSlide}>
            ›
          </button>

          {/* Indicators */}
          <div className="carousel-indicators">
            {carouselImages.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentSlide ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals Preview */}
      <section className="new-arrivals">
        <div className="container">
          <h2 className="section-title">New Arrivals</h2>
          <p className="section-subtitle">Discover our latest collection</p>
          
          {newArrivals.length > 0 ? (
            <>
              <div className="arrivals-grid">
                {newArrivals.slice(0, 3).map((arrival) => (
                  <div key={arrival._id} className="arrival-card">
                    <img 
                      src={arrival.image} 
                      alt={arrival.title}
                      className="arrival-image"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ0iNTAiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjI1IiB5PSIyNSIgZG9taW5hbnQtYmFzZWxpbmU9Im1iZWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5Q0EzQUYiIGZvbnQtc2l6ZT0iMTIiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4=';
                      }}
                    />
                    <div className="arrival-content">
                      <h3>{arrival.title}</h3>
                      {arrival.subtitle && <p className="arrival-subtitle">{arrival.subtitle}</p>}
                      <p className="arrival-price">{arrival.price}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center">
                <Link to="/products" className="btn btn-outline">
                  View All Products
                </Link>
              </div>
            </>
          ) : (
            <div className="no-arrivals">
              <p>No new arrivals available at the moment.</p>
              <Link to="/products" className="btn btn-primary">
                Browse All Products
              </Link>
            </div>
          )}
        </div>
      </section>

    </div>
  );
};

export default Home;
