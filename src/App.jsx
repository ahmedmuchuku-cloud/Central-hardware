import React, { useState, useEffect, useMemo } from 'react';
import itemsData from './data/items.json';

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isProductPage, setIsProductPage] = useState(false);

  // Categories map for icons and images (fallback to Unsplash if generated ones fail or aren't enough)
  const categoryMeta = {
    electricals: { image: "https://images.unsplash.com/photo-1558444479-2704f605c027?auto=format&fit=crop&q=80&w=800", icon: "⚡" },
    plumbing: { image: "https://images.unsplash.com/photo-1585704032915-c3400ca162e7?auto=format&fit=crop&q=80&w=800", icon: "🔧" },
    welding: { image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=800", icon: "🔥" },
    engineering_tools: { image: "https://images.unsplash.com/photo-1530124560676-ac6eb1191986?auto=format&fit=crop&q=80&w=800", icon: "🛠️" },
    screws_boards: { image: "https://images.unsplash.com/photo-1510444335546-950c05769165?auto=format&fit=crop&q=80&w=800", icon: "🪛" },
    bolts_nuts: { image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=800", icon: "🔩" },
    juakali: { image: "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&q=80&w=800", icon: "⚒️" },
    fundi_tools: { image: "https://images.unsplash.com/photo-1581244276891-663f82ed8347?auto=format&fit=crop&q=80&w=800", icon: "🏗️" },
    mali_mali: { image: "https://images.unsplash.com/photo-1520038410233-7141be7e6f97?auto=format&fit=crop&q=80&w=800", icon: "🛍️" },
    utensils_plasticware: { image: "https://images.unsplash.com/photo-1584346133934-a3afd2a33c4c?auto=format&fit=crop&q=80&w=800", icon: "🍽️" },
    locks_padlocks: { image: "https://images.unsplash.com/photo-1517646287270-a5a1cc1a7f6c?auto=format&fit=crop&q=80&w=800", icon: "🔒" },
    farm_tools: { image: "https://images.unsplash.com/photo-1589482483515-037130006768?auto=format&fit=crop&q=80&w=800", icon: "🚜" }
  };

  const allItems = useMemo(() => {
    return itemsData.categories.flatMap(cat => 
      cat.items.map(item => ({ ...item, categoryId: cat.id, categoryName: cat.name }))
    );
  }, []);

  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.categoryId === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory, allItems]);

  const categories = itemsData.categories;

  if (isProductPage) {
    return (
      <div className="animate-in">
        <header>
          <div className="container nav">
            <div className="logo" style={{cursor: 'pointer'}} onClick={() => setIsProductPage(false)}>
              CENTRAL <span>HARDWARE</span>
            </div>
            <div className="nav-links">
              <a href="#" onClick={() => setIsProductPage(false)}>Home</a>
              <a href="#" className="active">Products</a>
              <a href="#">Contact</a>
            </div>
          </div>
        </header>

        <main className="container" style={{marginTop: '3rem'}}>
          <div className="section-title">
            <h2>Explore Our Inventory</h2>
            <p>Quality tools and equipment for every need. {filteredItems.length} products available.</p>
          </div>

          <div className="filter-bar">
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search through thousands of items..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="category-chips">
              <span 
                className={`chip ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                All Products
              </span>
              {categories.map(cat => (
                <span 
                  key={cat.id} 
                  className={`chip ${selectedCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.icon} {cat.name}
                </span>
              ))}
            </div>
          </div>

          <div className="product-grid">
            {filteredItems.slice(0, 48).map(item => (
              <div key={item.id} className="product-card animate-in">
                <div className="product-img">
                  {categoryMeta[item.categoryId]?.icon || '📦'}
                </div>
                <div className="product-brand">{item.brand}</div>
                <h4>{item.name}</h4>
                <p style={{fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem', height: '3em', overflow: 'hidden'}}>{item.description}</p>
                <div className="product-price">KES {item.price_range}</div>
              </div>
            ))}
          </div>
          
          {filteredItems.length > 48 && (
             <div style={{textAlign: 'center', marginTop: '4rem'}}>
                <p style={{color: '#64748b'}}>Showing top 48 results. Use search/filter to find more.</p>
             </div>
          )}
        </main>

        <footer>
          <div className="container">
            <div className="footer-grid">
              <div className="footer-links">
                <div className="footer-logo">CENTRAL <span>HARDWARE</span></div>
                <p style={{color: '#94a3b8'}}>Everything under the sun. Kenya's premier choice for quality hardware and industrial supplies.</p>
              </div>
              <div className="footer-links">
                <h4>Categories</h4>
                <ul>
                  {categories.slice(0, 5).map(cat => <li key={cat.id}><a href="#">{cat.name}</a></li>)}
                </ul>
              </div>
              <div className="footer-links">
                <h4>Contact</h4>
                <p style={{color: '#94a3b8'}}>Nairobi, Kenya<br/>River Road / Kirinyaga Road<br/>Email: info@centralhardware.ke</p>
              </div>
            </div>
            <div className="footer-bottom">
              &copy; 2026 Central Hardware. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="animate-in">
      <header>
        <div className="container nav">
          <div className="logo">CENTRAL <span>HARDWARE</span></div>
          <div className="nav-links">
            <a href="#">Home</a>
            <a href="#" onClick={() => setIsProductPage(true)}>Products</a>
            <a href="#">About</a>
            <a href="#">Contact</a>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="hero-overlay"></div>
        <img 
          src="https://images.unsplash.com/photo-1581244276891-663f82ed8347?auto=format&fit=crop&q=80&w=2000" 
          alt="Central Hardware Interior" 
          className="hero-img" 
        />
        <div className="hero-content">
          <h1>Everything Under The Sun</h1>
          <p>The ultimate destination for premium tools, plumbing, electrical, and industrial supplies in Kenya.</p>
          <a href="#" className="cta-button" onClick={() => setIsProductPage(true)}>Shop Our Collection</a>
        </div>
      </section>

      <section className="container">
        <div className="section-title">
          <h2>Our Specialized Categories</h2>
          <p>Discover our extensive range of products across all hardware sectors.</p>
        </div>

        <div className="category-grid">
          {categories.map(cat => (
            <div key={cat.id} className="category-card" onClick={() => { setSelectedCategory(cat.id); setIsProductPage(true); }}>
              <img src={categoryMeta[cat.id]?.image || "https://images.unsplash.com/photo-1581244276891-663f82ed8347?auto=format&fit=crop&q=80&w=800"} alt={cat.name} />
              <div className="category-info">
                <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>{cat.icon}</div>
                <h3>{cat.name}</h3>
                <p style={{color: '#64748b', fontSize: '0.9rem'}}>{cat.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{background: 'white', padding: '6rem 0'}}>
        <div className="container" style={{display: 'flex', alignItems: 'center', gap: '4rem', flexWrap: 'wrap'}}>
          <div style={{flex: 1, minWidth: '300px'}}>
             <h2 style={{fontSize: '2.5rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--primary)'}}>Why Choose Us?</h2>
             <ul style={{listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                <li style={{display: 'flex', gap: '1rem'}}>
                   <div style={{background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 800}}>1</div>
                   <div>
                      <h4 style={{fontSize: '1.2rem', fontWeight: 700}}>Massive Inventory</h4>
                      <p style={{color: '#64748b'}}>Over 1,000 unique items in stock across plumbing, electrical, and more.</p>
                   </div>
                </li>
                <li style={{display: 'flex', gap: '1rem'}}>
                   <div style={{background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 800}}>2</div>
                   <div>
                      <h4 style={{fontSize: '1.2rem', fontWeight: 700}}>Premium Quality</h4>
                      <p style={{color: '#64748b'}}>We stock only the best brands like Bosch, Makita, Schneider, and Yale.</p>
                   </div>
                </li>
                <li style={{display: 'flex', gap: '1rem'}}>
                   <div style={{background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 800}}>3</div>
                   <div>
                      <h4 style={{fontSize: '1.2rem', fontWeight: 700}}>Local Fabrications</h4>
                      <p style={{color: '#64748b'}}>Supporting Jua Kali artisans with locally made metalware and tools.</p>
                   </div>
                </li>
             </ul>
          </div>
          <div style={{flex: 1, minWidth: '300px'}}>
             <img src="https://images.unsplash.com/photo-1544722759-390494be9070?auto=format&fit=crop&q=80&w=800" style={{width: '100%', borderRadius: '2rem', boxShadow: 'var(--shadow-lg)'}} alt="Warehouse" />
          </div>
        </div>
      </section>

      <footer>
        <div className="container">
          <div className="footer-grid">
            <div className="footer-links">
              <div className="footer-logo">CENTRAL <span>HARDWARE</span></div>
              <p style={{color: '#94a3b8'}}>Everything under the sun. Kenya's premier choice for quality hardware and industrial supplies.</p>
            </div>
            <div className="footer-links">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">Shipping Info</a></li>
                <li><a href="#">Refund Policy</a></li>
              </ul>
            </div>
            <div className="footer-links">
              <h4>Contact</h4>
              <p style={{color: '#94a3b8'}}>Nairobi, Kenya<br/>River Road / Kirinyaga Road<br/>Email: info@centralhardware.ke</p>
            </div>
          </div>
          <div className="footer-bottom">
            &copy; 2026 Central Hardware. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
