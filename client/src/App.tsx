import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams } from 'react-router-dom';

// Types
interface Podcast {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo: string;
  category: string;
  hostName: string;
  listenerCount: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  images: string[];
  category: string;
  sizes: string[];
  colors: string[];
  inventory: number;
  affiliateUrl: string;
  podcast?: {
    id: string;
    name: string;
    slug: string;
    logo: string;
  };
}

// API functions
const api = {
  async get(endpoint: string) {
    const response = await fetch(`/api${endpoint}`);
    if (!response.ok) throw new Error('API request failed');
    return response.json();
  },
  
  async post(endpoint: string, data: any) {
    const response = await fetch(`/api${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('API request failed');
    return response.json();
  }
};

// Components
const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="text-xl font-bold text-gray-900">PodShop</span>
          </Link>
          
          <nav className="hidden md:flex space-x-8">
            <Link to="/podcasts" className="text-gray-600 hover:text-gray-900 transition-colors">
              Podcasts
            </Link>
            <Link to="/products" className="text-gray-600 hover:text-gray-900 transition-colors">
              Products
            </Link>
            <Link to="/favorites" className="text-gray-600 hover:text-gray-900 transition-colors">
              Favorites
            </Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Sign In
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

const HomePage: React.FC = () => {
  const [featuredPodcasts, setFeaturedPodcasts] = useState<Podcast[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [podcastsData, productsData] = await Promise.all([
          api.get('/podcasts?limit=6'),
          api.get('/products?limit=8')
        ]);
        setFeaturedPodcasts(podcastsData);
        setFeaturedProducts(productsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Discover Amazing Products from Your Favorite Podcasts
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Shop curated products recommended by podcast hosts you trust
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/podcasts"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Browse Podcasts
              </Link>
              <Link 
                to="/products"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Shop Products
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Podcasts */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Featured Podcasts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredPodcasts.map((podcast) => (
              <Link 
                key={podcast.id}
                to={`/podcasts/${podcast.slug}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                  {podcast.logo ? (
                    <img 
                      src={podcast.logo} 
                      alt={podcast.name}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">{podcast.name[0]}</span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{podcast.name}</h3>
                  <p className="text-gray-600 mb-3 line-clamp-2">{podcast.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>by {podcast.hostName}</span>
                    <span>{podcast.listenerCount?.toLocaleString()} listeners</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Featured Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Link 
                key={product.id}
                to={`/products/${product.id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-w-1 aspect-h-1 bg-gray-200">
                  {product.images && product.images[0] ? (
                    <img 
                      src={product.images[0]} 
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-300 flex items-center justify-center">
                      <span className="text-gray-500">No Image</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                  <p className="text-2xl font-bold text-blue-600 mb-2">${product.price}</p>
                  {product.podcast && (
                    <p className="text-sm text-gray-500">from {product.podcast.name}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

const PodcastsPage: React.FC = () => {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPodcasts = async () => {
      try {
        const data = await api.get('/podcasts');
        setPodcasts(data);
      } catch (error) {
        console.error('Error fetching podcasts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPodcasts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">All Podcasts</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {podcasts.map((podcast) => (
            <Link 
              key={podcast.id}
              to={`/podcasts/${podcast.slug}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                {podcast.logo ? (
                  <img 
                    src={podcast.logo} 
                    alt={podcast.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">{podcast.name[0]}</span>
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{podcast.name}</h3>
                <p className="text-gray-600 mb-3 line-clamp-3">{podcast.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>by {podcast.hostName}</span>
                  <span>{podcast.listenerCount?.toLocaleString()} listeners</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await api.get('/products');
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">All Products</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link 
              key={product.id}
              to={`/products/${product.id}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="aspect-w-1 aspect-h-1 bg-gray-200">
                {product.images && product.images[0] ? (
                  <img 
                    src={product.images[0]} 
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-300 flex items-center justify-center">
                    <span className="text-gray-500">No Image</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                <p className="text-2xl font-bold text-blue-600 mb-2">${product.price}</p>
                {product.podcast && (
                  <p className="text-sm text-gray-500">from {product.podcast.name}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        const data = await api.get(`/products/${id}`);
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAffiliateClick = async () => {
    if (!product) return;
    
    try {
      await api.post('/clicks', {
        productId: product.id,
        podcastId: product.podcast?.id,
      });
      
      // Open affiliate link
      window.open(product.affiliateUrl, '_blank');
    } catch (error) {
      console.error('Error tracking click:', error);
      // Still open the link even if tracking fails
      window.open(product.affiliateUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <Link to="/products" className="text-blue-600 hover:text-blue-800">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Product Image */}
            <div className="aspect-w-1 aspect-h-1">
              {product.images && product.images[0] ? (
                <img 
                  src={product.images[0]} 
                  alt={product.name}
                  className="w-full h-96 object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-96 bg-gray-300 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500 text-xl">No Image</span>
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                {product.podcast && (
                  <p className="text-lg text-gray-600">
                    Recommended by{' '}
                    <Link 
                      to={`/podcasts/${product.podcast.slug}`}
                      className="text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      {product.podcast.name}
                    </Link>
                  </p>
                )}
              </div>

              <div className="text-4xl font-bold text-blue-600">
                ${product.price}
              </div>

              {product.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{product.description}</p>
                </div>
              )}

              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Available Sizes</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-800 rounded-lg text-sm"
                      >
                        {size}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {product.colors && product.colors.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Available Colors</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-800 rounded-lg text-sm"
                      >
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-6">
                <button
                  onClick={handleAffiliateClick}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Buy Now
                </button>
                <p className="text-sm text-gray-500 mt-2 text-center">
                  You'll be redirected to the retailer's website
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/podcasts" element={<PodcastsPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h1>
                <Link to="/" className="text-blue-600 hover:text-blue-800">
                  Go Home
                </Link>
              </div>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
};

export default App; 