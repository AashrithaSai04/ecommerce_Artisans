import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getArtisans } from '../services/api';
import './Sellers.css';

const Sellers = () => {
  const [artisans, setArtisans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArtisans = async () => {
      try {
        const { data } = await getArtisans();
        setArtisans(data.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch artisans. Please try again later.');
        setLoading(false);
      }
    };

    fetchArtisans();
  }, []);

  if (loading) {
    return <div className="loading-state">Loading artisans...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="sellers-page">
      <div className="container">
        <h1 className="page-title">Our Talented Artisans</h1>
        <p className="page-subtitle">
          Discover the skilled creators behind our unique handcrafted products.
        </p>

        <div className="artisan-grid">
          {artisans.length > 0 ? (
            artisans.map((artisan) => (
              <div key={artisan._id} className="artisan-card">
                <Link to={`/sellers/${artisan._id}`} className="artisan-link">
                  <div className="artisan-avatar">
                    {artisan.artisanInfo?.shopLogo ? (
                      <img
                        src={artisan.artisanInfo.shopLogo}
                        alt={`${artisan.name}'s shop logo`}
                      />
                    ) : (
                      <span className="avatar-placeholder">
                        {artisan.name?.charAt(0)?.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="artisan-info">
                    <h3 className="artisan-name">{artisan.name}</h3>
                    <p className="artisan-specialty">
                      {artisan.artisanInfo?.craftSpecialties?.join(', ') ||
                        'Handcraft Artisan'}
                    </p>
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <h3>No artisans found.</h3>
              <p>Check back later to see our growing community of creators.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sellers;
