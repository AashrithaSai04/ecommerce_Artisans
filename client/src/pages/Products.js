import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { getProducts, getCategories } from '../services/products';
import './Products.css';

const Products = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter and search state
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    inStock: searchParams.get('inStock') === 'true',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc'
  });
  
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [filters]);

  useEffect(() => {
    // Update URL params when filters change
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '' && value !== false) {
        params.set(key, value.toString());
      }
    });
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getProducts(filters);
      setProducts(response.data.products || []);
      setError('');
    } catch (err) {
      setError('Failed to load products. Please try again.');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setFilters(prev => ({
      ...prev,
      search: value
    }));
  };

  const handleSortChange = (e) => {
    const [sortBy, sortOrder] = e.target.value.split('-');
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      inStock: false,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  };

  const sortOptions = [
    { value: 'createdAt-desc', label: 'Newest First' },
    { value: 'createdAt-asc', label: 'Oldest First' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'name-asc', label: 'Name: A to Z' },
    { value: 'name-desc', label: 'Name: Z to A' },
    { value: 'rating-desc', label: 'Highest Rated' }
  ];

  return (
    <div className="products-page">
      <div className="container">
        {/* Page Header */}
        <div className="products-header">
          <h1 className="products-title">{t('products.title')}</h1>
          <p className="products-subtitle">
            Discover fresh food, handmade crafts, and local art from rural producers
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="products-toolbar">
          <div className="search-section">
            <div className="search-input-wrapper">
              <input
                type="text"
                placeholder={t('products.search')}
                value={filters.search}
                onChange={handleSearchChange}
                className="search-input"
              />
              <span className="search-icon">🔍</span>
            </div>
          </div>

          <div className="toolbar-actions">
            <button
              className="filter-toggle"
              onClick={() => setShowFilters(!showFilters)}
            >
              <span className="filter-icon">🔧</span>
              {t('products.filter')}
            </button>

            <div className="sort-section">
              <label htmlFor="sort-select" className="sort-label">
                {t('products.sort')}:
              </label>
              <select
                id="sort-select"
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={handleSortChange}
                className="sort-select"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="filters-panel">
            <div className="filters-content">
              <div className="filter-group">
                <label className="filter-label">{t('products.category')}</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="filter-select"
                >
                  <option value="">{t('common.all')}</option>
                  {categories.map(category => (
                    <option key={category._id} value={category._id}>
                      {category.name.en || category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">{t('products.priceRange')}</label>
                <div className="price-range">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="price-input"
                    min="0"
                  />
                  <span className="price-separator">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="price-input"
                    min="0"
                  />
                </div>
              </div>

              <div className="filter-group">
                <label className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={filters.inStock}
                    onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                  />
                  <span className="checkbox-text">{t('products.inStock')}</span>
                </label>
              </div>

              <div className="filter-actions">
                <button onClick={clearFilters} className="btn btn-outline btn-sm">
                  {t('common.clear')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="products-content">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner">
                <span className="spinner"></span>
              </div>
              <p>{t('common.loading')}</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <div className="error-icon">⚠️</div>
              <h3>Oops! Something went wrong</h3>
              <p>{error}</p>
              <button onClick={fetchProducts} className="btn btn-primary">
                Try Again
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <h3>{t('products.noProducts')}</h3>
              <p>Try adjusting your search or filters to find what you're looking for.</p>
              <button onClick={clearFilters} className="btn btn-primary">
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="products-meta">
                <p className="results-count">
                  {products.length} {products.length === 1 ? 'product' : 'products'} found
                </p>
              </div>
              
              <div className="products-grid">
                {products.map(product => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;