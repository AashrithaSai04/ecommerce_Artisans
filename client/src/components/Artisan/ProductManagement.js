import React, { useState, useEffect } from 'react';
import { productService, uploadService } from '../../services';
import './ProductManagement.css';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    specifications: {
      materials: [],
      techniques: [],
      colors: [],
      dimensions: { length: '', width: '', height: '' },
      careInstructions: ''
    },
    inventory: {
      quantity: '',
      unit: 'piece'
    },
    customizable: false,
    availability: 'in-stock',
    tags: []
  });
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  const categories = [
    'pottery', 'weaving', 'woodwork', 'metalwork', 'jewelry',
    'textiles', 'embroidery', 'painting', 'sculpture', 'leather-work',
    'bamboo-craft', 'stone-carving', 'glass-work', 'paper-craft',
    'handloom', 'block-printing', 'organic-produce', 'processed-foods',
    'home-decor', 'traditional-wear', 'accessories', 'other'
  ];

  const units = ['piece', 'kg', 'g', 'dozen', 'pair', 'set', 'meter', 'cm'];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getProducts();
      setProducts(response.data.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleArrayInput = (field, value) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({
      ...prev,
      [field]: items
    }));
  };

  const handleSpecificationArrayInput = (field, value) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [field]: items
      }
    }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(file => uploadService.uploadImage(file, 'product'));
      const responses = await Promise.all(uploadPromises);
      const uploadedImages = responses.map(response => ({
        url: response.data.url,
        alt: formData.name
      }));
      setImages(prev => [...prev, ...uploadedImages]);
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Error uploading images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const productData = {
        ...formData,
        images,
        price: parseFloat(formData.price),
        inventory: {
          ...formData.inventory,
          quantity: parseInt(formData.inventory.quantity)
        }
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
      alert('Error saving product. Please try again.');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      specifications: product.specifications || {
        materials: [],
        techniques: [],
        colors: [],
        dimensions: { length: '', width: '', height: '' },
        careInstructions: ''
      },
      inventory: product.inventory,
      customizable: product.customizable,
      availability: product.availability,
      tags: product.tags || []
    });
    setImages(product.images || []);
    setShowAddModal(true);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
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

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      specifications: {
        materials: [],
        techniques: [],
        colors: [],
        dimensions: { length: '', width: '', height: '' },
        careInstructions: ''
      },
      inventory: {
        quantity: '',
        unit: 'piece'
      },
      customizable: false,
      availability: 'in-stock',
      tags: []
    });
    setImages([]);
    setEditingProduct(null);
    setShowAddModal(false);
  };

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  return (
    <div className="product-management">
      <div className="management-header">
        <h1>Product Management</h1>
        <button 
          className="btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          Add New Product
        </button>
      </div>

      <div className="products-grid">
        {products.length === 0 ? (
          <div className="no-products">
            <p>No products found. Add your first product to get started!</p>
          </div>
        ) : (
          products.map(product => (
            <div key={product._id} className="product-card">
              <div className="product-image">
                {product.images && product.images.length > 0 ? (
                  <img src={product.images[0].url} alt={product.name} />
                ) : (
                  <div className="no-image">No Image</div>
                )}
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <p className="price">₹{product.price}</p>
                <p className="category">{product.category.replace('-', ' ')}</p>
                <div className="inventory">
                  <span className={`stock-status ${product.inventory.inStock ? 'in-stock' : 'out-of-stock'}`}>
                    {product.inventory.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                  <span className="quantity">
                    {product.inventory.quantity} {product.inventory.unit}
                  </span>
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

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button className="close-btn" onClick={resetForm}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="product-form">
              <div className="form-section">
                <h3>Basic Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Product Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
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
                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
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
                      <option value="in-stock">In Stock</option>
                      <option value="made-to-order">Made to Order</option>
                      <option value="pre-order">Pre-order</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Inventory</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Quantity *</label>
                    <input
                      type="number"
                      name="inventory.quantity"
                      value={formData.inventory.quantity}
                      onChange={handleInputChange}
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
                </div>
              </div>

              <div className="form-section">
                <h3>Specifications</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Materials (comma separated)</label>
                    <input
                      type="text"
                      value={formData.specifications.materials.join(', ')}
                      onChange={(e) => handleSpecificationArrayInput('materials', e.target.value)}
                      placeholder="cotton, silk, wood"
                    />
                  </div>
                  <div className="form-group">
                    <label>Techniques (comma separated)</label>
                    <input
                      type="text"
                      value={formData.specifications.techniques.join(', ')}
                      onChange={(e) => handleSpecificationArrayInput('techniques', e.target.value)}
                      placeholder="hand-woven, carved, painted"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Colors (comma separated)</label>
                    <input
                      type="text"
                      value={formData.specifications.colors.join(', ')}
                      onChange={(e) => handleSpecificationArrayInput('colors', e.target.value)}
                      placeholder="red, blue, natural"
                    />
                  </div>
                  <div className="form-group">
                    <label>Care Instructions</label>
                    <input
                      type="text"
                      name="specifications.careInstructions"
                      value={formData.specifications.careInstructions}
                      onChange={handleInputChange}
                      placeholder="Hand wash only, dry clean"
                    />
                  </div>
                </div>
                <div className="dimensions-group">
                  <label>Dimensions</label>
                  <div className="form-row">
                    <input
                      type="text"
                      name="specifications.dimensions.length"
                      value={formData.specifications.dimensions.length}
                      onChange={handleInputChange}
                      placeholder="Length"
                    />
                    <input
                      type="text"
                      name="specifications.dimensions.width"
                      value={formData.specifications.dimensions.width}
                      onChange={handleInputChange}
                      placeholder="Width"
                    />
                    <input
                      type="text"
                      name="specifications.dimensions.height"
                      value={formData.specifications.dimensions.height}
                      onChange={handleInputChange}
                      placeholder="Height"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Additional Information</h3>
                <div className="form-group">
                  <label>Tags (comma separated)</label>
                  <input
                    type="text"
                    value={formData.tags.join(', ')}
                    onChange={(e) => handleArrayInput('tags', e.target.value)}
                    placeholder="handmade, traditional, gift, home-decor"
                  />
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="customizable"
                      checked={formData.customizable}
                      onChange={handleInputChange}
                    />
                    This product can be customized
                  </label>
                </div>
              </div>

              <div className="form-section">
                <h3>Product Images</h3>
                <div className="image-upload">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                  {uploading && <p>Uploading images...</p>}
                </div>
                <div className="image-preview">
                  {images.map((image, index) => (
                    <div key={index} className="image-item">
                      <img src={image.url} alt={`Product ${index + 1}`} />
                      <button
                        type="button"
                        className="remove-image"
                        onClick={() => removeImage(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;