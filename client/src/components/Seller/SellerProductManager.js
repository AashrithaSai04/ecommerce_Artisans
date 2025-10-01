import React, { useState, useEffect } from 'react';
import { productService, uploadService } from '../../services';
import './SellerProductManager.css';

const SellerProductManager = () => {
  const [products, setProducts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    subcategory: '',
    inventory: {
      quantity: '',
      unit: 'piece',
      minStockLevel: '5'
    },
    specifications: {
      materials: '',
      techniques: '',
      colors: '',
      dimensions: {
        length: '',
        width: '',
        height: ''
      },
      weight: '',
      origin: {
        village: '',
        district: '',
        state: ''
      },
      careInstructions: '',
      culturalSignificance: '',
      timeToMake: ''
    },
    customizable: false,
    customizationOptions: [],
    availability: 'in-stock',
    leadTime: '',
    tags: '',
    seoKeywords: ''
  });
  
  const [images, setImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const categories = [
    'pottery', 'weaving', 'woodwork', 'metalwork', 'jewelry',
    'textiles', 'embroidery', 'painting', 'sculpture', 'leather-work',
    'bamboo-craft', 'stone-carving', 'glass-work', 'paper-craft',
    'handloom', 'block-printing', 'organic-produce', 'processed-foods',
    'home-decor', 'traditional-wear', 'accessories'
  ];

  const units = ['piece', 'kg', 'g', 'pair', 'set', 'dozen', 'meter', 'cm', 'liter', 'ml'];

  const subcategories = {
    pottery: ['vases', 'bowls', 'decorative-items', 'kitchen-ware'],
    weaving: ['baskets', 'mats', 'wall-hangings', 'storage'],
    woodwork: ['furniture', 'decorative-items', 'kitchen-utensils', 'toys'],
    jewelry: ['necklaces', 'earrings', 'bracelets', 'rings', 'traditional'],
    textiles: ['sarees', 'scarves', 'bed-sheets', 'curtains', 'bags'],
    painting: ['canvas', 'wall-art', 'miniatures', 'folk-art'],
    'home-decor': ['lamps', 'mirrors', 'wall-hangings', 'showpieces']
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getProducts();
      setProducts(response.data.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Error loading products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const keys = name.split('.');
      setFormData(prev => {
        const newData = { ...prev };
        let current = newData;
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) current[keys[i]] = {};
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = type === 'checkbox' ? checked : value;
        return newData;
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingImages(true);
    try {
      const uploadPromises = files.map(file => uploadService.uploadImage(file, 'product'));
      const responses = await Promise.all(uploadPromises);
      const newImages = responses.map(response => ({
        url: response.data.url,
        alt: formData.name || 'Product image'
      }));
      setImages(prev => [...prev, ...newImages]);
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Error uploading images. Please try again.');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        inventory: {
          ...formData.inventory,
          quantity: parseInt(formData.inventory.quantity),
          minStockLevel: parseInt(formData.inventory.minStockLevel)
        },
        specifications: {
          ...formData.specifications,
          materials: formData.specifications.materials.split(',').map(s => s.trim()).filter(s => s),
          techniques: formData.specifications.techniques.split(',').map(s => s.trim()).filter(s => s),
          colors: formData.specifications.colors.split(',').map(s => s.trim()).filter(s => s)
        },
        tags: formData.tags.split(',').map(s => s.trim()).filter(s => s),
        seoKeywords: formData.seoKeywords.split(',').map(s => s.trim()).filter(s => s),
        images
      };

      if (editingProduct) {
        await productService.updateProduct(editingProduct._id, productData);
        alert('Product updated successfully!');
      } else {
        await productService.createProduct(productData);
        alert('Product added successfully!');
      }

      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product. Please check all fields and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      subcategory: product.subcategory || '',
      inventory: {
        quantity: product.inventory.quantity.toString(),
        unit: product.inventory.unit,
        minStockLevel: product.inventory.minStockLevel?.toString() || '5'
      },
      specifications: {
        materials: product.specifications?.materials?.join(', ') || '',
        techniques: product.specifications?.techniques?.join(', ') || '',
        colors: product.specifications?.colors?.join(', ') || '',
        dimensions: product.specifications?.dimensions || { length: '', width: '', height: '' },
        weight: product.specifications?.weight || '',
        origin: product.specifications?.origin || { village: '', district: '', state: '' },
        careInstructions: product.specifications?.careInstructions || '',
        culturalSignificance: product.specifications?.culturalSignificance || '',
        timeToMake: product.specifications?.timeToMake || ''
      },
      customizable: product.customizable || false,
      availability: product.availability || 'in-stock',
      leadTime: product.leadTime || '',
      tags: product.tags?.join(', ') || '',
      seoKeywords: product.seoKeywords?.join(', ') || ''
    });
    setImages(product.images || []);
    setShowAddForm(true);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      try {
        await productService.deleteProduct(productId);
        alert('Product deleted successfully!');
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product. Please try again.');
      }
    }
  };

  const updateStock = async (productId, newQuantity) => {
    try {
      await productService.updateProduct(productId, {
        inventory: { quantity: newQuantity }
      });
      fetchProducts();
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Error updating stock. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      subcategory: '',
      inventory: { quantity: '', unit: 'piece', minStockLevel: '5' },
      specifications: {
        materials: '',
        techniques: '',
        colors: '',
        dimensions: { length: '', width: '', height: '' },
        weight: '',
        origin: { village: '', district: '', state: '' },
        careInstructions: '',
        culturalSignificance: '',
        timeToMake: ''
      },
      customizable: false,
      availability: 'in-stock',
      leadTime: '',
      tags: '',
      seoKeywords: ''
    });
    setImages([]);
    setEditingProduct(null);
    setShowAddForm(false);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your products...</p>
      </div>
    );
  }

  return (
    <div className="seller-product-manager">
      <div className="manager-header">
        <div className="header-content">
          <h1>My Products</h1>
          <p>Manage your handicraft products and inventory</p>
        </div>
        <button 
          className="btn-add-product"
          onClick={() => setShowAddForm(true)}
        >
          <span>+</span> Add New Product
        </button>
      </div>

      <div className="products-overview">
        <div className="stat-card">
          <h3>{products.length}</h3>
          <p>Total Products</p>
        </div>
        <div className="stat-card">
          <h3>{products.filter(p => p.inventory?.inStock).length}</h3>
          <p>In Stock</p>
        </div>
        <div className="stat-card warning">
          <h3>{products.filter(p => p.inventory?.quantity <= (p.inventory?.minStockLevel || 5)).length}</h3>
          <p>Low Stock</p>
        </div>
        <div className="stat-card">
          <h3>{products.filter(p => !p.inventory?.inStock).length}</h3>
          <p>Out of Stock</p>
        </div>
      </div>

      <div className="products-grid">
        {products.length === 0 ? (
          <div className="no-products">
            <div className="no-products-icon">📦</div>
            <h3>No Products Yet</h3>
            <p>Start building your online store by adding your first handicraft product!</p>
            <button className="btn-primary" onClick={() => setShowAddForm(true)}>
              Add Your First Product
            </button>
          </div>
        ) : (
          products.map(product => (
            <div key={product._id} className="product-card">
              <div className="product-image">
                {product.images && product.images.length > 0 ? (
                  <img src={product.images[0].url} alt={product.name} />
                ) : (
                  <div className="no-image">
                    <span>📷</span>
                    <p>No Image</p>
                  </div>
                )}
                <div className="product-badges">
                  {product.customizable && <span className="badge customizable">Customizable</span>}
                  {product.featured && <span className="badge featured">Featured</span>}
                </div>
              </div>
              
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-category">{product.category.replace('-', ' ')}</p>
                <div className="product-price">₹{product.price?.toLocaleString()}</div>
                
                <div className="inventory-info">
                  <div className="stock-level">
                    <span className={`stock-indicator ${
                      !product.inventory?.inStock ? 'out-of-stock' :
                      product.inventory?.quantity <= (product.inventory?.minStockLevel || 5) ? 'low-stock' : 'in-stock'
                    }`}></span>
                    <span className="stock-text">
                      {product.inventory?.quantity || 0} {product.inventory?.unit} 
                      {!product.inventory?.inStock && ' - Out of Stock'}
                      {product.inventory?.inStock && product.inventory?.quantity <= (product.inventory?.minStockLevel || 5) && ' - Low Stock'}
                    </span>
                  </div>
                  
                  <div className="stock-update">
                    <input
                      type="number"
                      min="0"
                      defaultValue={product.inventory?.quantity || 0}
                      onBlur={(e) => {
                        const newQty = parseInt(e.target.value);
                        if (newQty !== product.inventory?.quantity) {
                          updateStock(product._id, newQty);
                        }
                      }}
                      className="stock-input"
                    />
                    <span className="unit-label">{product.inventory?.unit}</span>
                  </div>
                </div>

                <div className="product-actions">
                  <button 
                    className="btn-edit"
                    onClick={() => handleEdit(product)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn-delete"
                    onClick={() => handleDelete(product._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button className="close-button" onClick={resetForm}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="product-form">
              {/* Basic Information */}
              <section className="form-section">
                <h3>Basic Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Product Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Handwoven Cotton Saree"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>
                          {cat.replace('-', ' ').toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {formData.category && subcategories[formData.category] && (
                  <div className="form-group">
                    <label>Subcategory</label>
                    <select
                      name="subcategory"
                      value={formData.subcategory}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Subcategory</option>
                      {subcategories[formData.category].map(sub => (
                        <option key={sub} value={sub}>
                          {sub.replace('-', ' ').toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Describe your product, its unique features, and craftsmanship..."
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Price (₹) *</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Availability</label>
                    <select
                      name="availability"
                      value={formData.availability}
                      onChange={handleInputChange}
                    >
                      <option value="in-stock">Ready to Ship</option>
                      <option value="made-to-order">Made to Order</option>
                      <option value="pre-order">Pre-order</option>
                    </select>
                  </div>
                </div>

                {formData.availability === 'made-to-order' && (
                  <div className="form-group">
                    <label>Lead Time</label>
                    <input
                      type="text"
                      name="leadTime"
                      value={formData.leadTime}
                      onChange={handleInputChange}
                      placeholder="e.g., 2-3 weeks, 10-15 days"
                    />
                  </div>
                )}
              </section>

              {/* Inventory Management */}
              <section className="form-section">
                <h3>Inventory & Stock</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Quantity *</label>
                    <input
                      type="number"
                      name="inventory.quantity"
                      value={formData.inventory.quantity}
                      onChange={handleInputChange}
                      min="0"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Unit</label>
                    <select
                      name="inventory.unit"
                      value={formData.inventory.unit}
                      onChange={handleInputChange}
                    >
                      {units.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Low Stock Alert Level</label>
                    <input
                      type="number"
                      name="inventory.minStockLevel"
                      value={formData.inventory.minStockLevel}
                      onChange={handleInputChange}
                      min="0"
                      placeholder="5"
                    />
                  </div>
                </div>
              </section>

              {/* Product Specifications */}
              <section className="form-section">
                <h3>Product Specifications</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Materials Used</label>
                    <input
                      type="text"
                      name="specifications.materials"
                      value={formData.specifications.materials}
                      onChange={handleInputChange}
                      placeholder="cotton, silk, wool, wood, metal (comma separated)"
                    />
                  </div>
                  <div className="form-group">
                    <label>Techniques</label>
                    <input
                      type="text"
                      name="specifications.techniques"
                      value={formData.specifications.techniques}
                      onChange={handleInputChange}
                      placeholder="hand-woven, carved, painted, embroidered"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Available Colors</label>
                    <input
                      type="text"
                      name="specifications.colors"
                      value={formData.specifications.colors}
                      onChange={handleInputChange}
                      placeholder="red, blue, green, natural"
                    />
                  </div>
                  <div className="form-group">
                    <label>Weight</label>
                    <input
                      type="text"
                      name="specifications.weight"
                      value={formData.specifications.weight}
                      onChange={handleInputChange}
                      placeholder="e.g., 500g, 2kg"
                    />
                  </div>
                </div>

                <div className="dimensions-section">
                  <label>Dimensions</label>
                  <div className="form-row">
                    <input
                      type="text"
                      name="specifications.dimensions.length"
                      value={formData.specifications.dimensions.length}
                      onChange={handleInputChange}
                      placeholder="Length (cm)"
                    />
                    <input
                      type="text"
                      name="specifications.dimensions.width"
                      value={formData.specifications.dimensions.width}
                      onChange={handleInputChange}
                      placeholder="Width (cm)"
                    />
                    <input
                      type="text"
                      name="specifications.dimensions.height"
                      value={formData.specifications.dimensions.height}
                      onChange={handleInputChange}
                      placeholder="Height (cm)"
                    />
                  </div>
                </div>

                <div className="origin-section">
                  <label>Origin</label>
                  <div className="form-row">
                    <input
                      type="text"
                      name="specifications.origin.village"
                      value={formData.specifications.origin.village}
                      onChange={handleInputChange}
                      placeholder="Village"
                    />
                    <input
                      type="text"
                      name="specifications.origin.district"
                      value={formData.specifications.origin.district}
                      onChange={handleInputChange}
                      placeholder="District"
                    />
                    <input
                      type="text"
                      name="specifications.origin.state"
                      value={formData.specifications.origin.state}
                      onChange={handleInputChange}
                      placeholder="State"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Care Instructions</label>
                    <input
                      type="text"
                      name="specifications.careInstructions"
                      value={formData.specifications.careInstructions}
                      onChange={handleInputChange}
                      placeholder="Hand wash only, dry in shade, etc."
                    />
                  </div>
                  <div className="form-group">
                    <label>Time to Make</label>
                    <input
                      type="text"
                      name="specifications.timeToMake"
                      value={formData.specifications.timeToMake}
                      onChange={handleInputChange}
                      placeholder="e.g., 3 days, 1 week"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Cultural Significance</label>
                  <textarea
                    name="specifications.culturalSignificance"
                    value={formData.specifications.culturalSignificance}
                    onChange={handleInputChange}
                    rows="2"
                    placeholder="Describe the cultural or traditional significance of this product..."
                  />
                </div>
              </section>

              {/* Customization Options */}
              <section className="form-section">
                <h3>Customization & Options</h3>
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="customizable"
                      checked={formData.customizable}
                      onChange={handleInputChange}
                    />
                    <span className="checkmark"></span>
                    This product can be customized (colors, size, design, etc.)
                  </label>
                </div>
              </section>

              {/* SEO & Tags */}
              <section className="form-section">
                <h3>Tags & Search Keywords</h3>
                <div className="form-group">
                  <label>Product Tags</label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="handmade, traditional, gift, home-decor, eco-friendly (comma separated)"
                  />
                </div>
                <div className="form-group">
                  <label>Search Keywords</label>
                  <input
                    type="text"
                    name="seoKeywords"
                    value={formData.seoKeywords}
                    onChange={handleInputChange}
                    placeholder="handicraft, artisan, traditional craft (comma separated)"
                  />
                </div>
              </section>

              {/* Product Images */}
              <section className="form-section">
                <h3>Product Images</h3>
                <div className="image-upload-section">
                  <div className="upload-area">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      disabled={uploadingImages}
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="upload-label">
                      <div className="upload-icon">📷</div>
                      <p>{uploadingImages ? 'Uploading...' : 'Click to upload images'}</p>
                      <span>Supports: JPG, PNG, WEBP (Max: 5MB each)</span>
                    </label>
                  </div>

                  <div className="image-preview-grid">
                    {images.map((image, index) => (
                      <div key={index} className="image-preview-item">
                        <img src={image.url} alt={`Product ${index + 1}`} />
                        <button
                          type="button"
                          className="remove-image-btn"
                          onClick={() => removeImage(index)}
                        >
                          ×
                        </button>
                        {index === 0 && <span className="primary-badge">Primary</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={resetForm}>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-submit" 
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerProductManager;