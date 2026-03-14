import React, { useState, useEffect, useMemo } from 'react';
import itemsData from './data/items.json';

import heroImg from './assets/hero.png';
import brandLogo from './assets/Logo.png';
import electrcals from './assets/electrcals.png';
import plumbing from './assets/plumbing.png';
import welding from './assets/welding.jpg';
import engineeringTools from './assets/engineering tools.png';
import screwsBoards from './assets/screws and boards.png';
import Juakali from './assets/Juakali.png';
import locks from './assets/locks and padlockks.png';
import fundiTools from './assets/fundi tools.png';
import farmTools from './assets/farm tools.png';
import utensilsPlasticware from './assets/utensils and plasticware.png';
import boltsAndScrews from './assets/bolts and screws.png';
import maliMali from './assets/mali mali.png';

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isProductPage, setIsProductPage] = useState(false);

  // Categories map for icons and images (local assets)
  const categoryMeta = {
    electricals: { image: electrcals, icon: "⚡" },
    plumbing: { image: plumbing, icon: "🔧" },
    welding: { image: welding, icon: "🔥" },
    engineering_tools: { image: engineeringTools, icon: "🛠️" },
    screws_boards: { image: screwsBoards, icon: "🪛" },
    bolts_nuts: { image: boltsAndScrews, icon: "🔩" },
    juakali: { image: Juakali, icon: "⚒️" },
    fundi_tools: { image: fundiTools, icon: "🏗️" },
    mali_mali: { image: maliMali, icon: "🛍️" },
    utensils_plasticware: { image: utensilsPlasticware, icon: "🍽️" },
    locks_padlocks: { image: locks, icon: "🔒" },
    farm_tools: { image: farmTools, icon: "🚜" }
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
        <div className="container nav" style={{ alignItems: 'center' }}>
          <div className="logo" style={{ cursor: 'pointer' }} onClick={() => setIsProductPage(false)}>
            <img src={brandLogo} alt="Logo" style={{ height: '2.2rem', width: 'auto' }} />
            <span>CENTRAL <span>HARDWARE</span></span>
          </div>
          <div className="nav-links">
            <a href="#" className="active" onClick={(e) => { e.preventDefault(); setIsProductPage(false); }}>Home</a>
            <a href="#" onClick={(e) => { e.preventDefault(); setIsProductPage(true); }}>Collection</a>
            <a href="#our-story" onClick={(e) => { e.preventDefault(); document.getElementById('our-story')?.scrollIntoView({behavior: 'smooth'}); }}>Our Story</a>
            <a href="#" onClick={(e) => e.preventDefault()}>Contact</a>
          </div>
        </div>
      </header>

        <main className="container" style={{marginTop: '5rem'}}>
          <div className="section-title">
            <h2>Inventory <span>Portal</span></h2>
            <p>Direct access to {allItems.length}+ premium supplies. Everything under the sun.</p>
          </div>

          <div className="filter-bar">
            <div className="search-container">
              <input 
                type="text" 
                className="search-input" 
                placeholder="What equipment are you looking for?" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="chip-scroll">
              <span 
                className={`chip ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                All Gear
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
            {filteredItems.slice(0, 100).map(item => (
              <div key={item.id} className="product-card">
                <div className="product-visual">
                  {categoryMeta[item.categoryId]?.icon || '📦'}
                </div>
                <div className="product-brand">{item.brand}</div>
                <h4>{item.name}</h4>
                <div className="product-price-label">Price Range</div>
                <div className="product-price"><span>KES</span> {item.price_range}</div>
              </div>
            ))}
          </div>
          
          {filteredItems.length > 100 && (
             <div style={{textAlign: 'center', marginTop: '6rem', padding: '4rem', background: 'var(--card-bg)', borderRadius: '2rem'}}>
                <h3 style={{fontSize: '2rem', marginBottom: '1rem'}}>Need More Specifics?</h3>
                <p style={{color: 'var(--text-muted)'}}>Use the filters above to narrow down your search among our 1,000+ items.</p>
             </div>
          )}
        </main>

        <footer style={{background: 'var(--primary)', padding: '4rem 0 2rem', marginTop: '4rem'}}>
          <div className="container">
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', marginBottom: '3rem'}}>
              <div>
                <div className="logo" style={{marginBottom: '1rem'}}>CENTRAL <span>HARDWARE</span></div>
                <p style={{color: 'var(--text-muted)', lineHeight: 1.6}}>Kenya's premier destination for professional tools and hardware supplies. Serving craftsmen across the nation for over 25 years.</p>
              </div>
              <div>
                <h4 style={{color: '#fff', marginBottom: '1.25rem', fontWeight: 700}}>Categories</h4>
                <ul style={{listStyle: 'none', padding: 0}}>
                  {categories.slice(0, 5).map(cat => <li key={cat.id} style={{marginBottom: '0.75rem'}}><a href="#" style={{color: 'var(--text-muted)', textDecoration: 'none'}}>{cat.name}</a></li>)}
                </ul>
              </div>
              <div>
                <h4 style={{color: '#fff', marginBottom: '1.25rem', fontWeight: 700}}>Contact</h4>
                <p style={{color: 'var(--text-muted)', lineHeight: 1.8}}>
                  Central Hardware Building<br/>
                  River Road, Nairobi<br/>
                  +254 700 000000<br/>
                  info@centralhardware.co.ke
                </p>
              </div>
              <div>
                <h4 style={{color: '#fff', marginBottom: '1.25rem', fontWeight: 700}}>Hours</h4>
                <p style={{color: 'var(--text-muted)', lineHeight: 1.8}}>
                  Monday - Saturday: 8:00 AM - 7:00 PM<br/>
                  Sunday: 9:00 AM - 5:00 PM<br/>
                  Public Holidays: 9:00 AM - 2:00 PM
                </p>
              </div>
            </div>
            <div style={{borderTop: '1px solid var(--border)', paddingTop: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem'}}>
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
        <div className="container nav" style={{ alignItems: 'center' }}>
          <div className="logo" style={{ cursor: 'pointer' }} onClick={() => setIsProductPage(false)}>
            <img src={brandLogo} alt="Logo" style={{ height: '2.2rem', width: 'auto' }} />
            <span>CENTRAL <span>HARDWARE</span></span>
          </div>
          <div className="nav-links">
            <a href="#" className="active" onClick={(e) => { e.preventDefault(); setIsProductPage(false); }}>Home</a>
            <a href="#" onClick={(e) => { e.preventDefault(); setIsProductPage(true); }}>Collection</a>
            <a href="#our-story" onClick={(e) => { e.preventDefault(); document.getElementById('our-story')?.scrollIntoView({behavior: 'smooth'}); }}>Our Story</a>
            <a href="#" onClick={(e) => e.preventDefault()}>Contact</a>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="hero-overlay"></div>
        <img 
          src={heroImg} 
          alt="Kenyan Fundi working with tools" 
          className="hero-img" 
        />
        <div className="container" style={{position: 'relative', zIndex: 2}}>
          <div className="hero-content">
            <div className="hero-badge">Est. 1999 • 25 Years of Excellence</div>
            <div className="hero-title-row">
              <h1 style={{ margin: 0 }}>
                Everything <span>Under The Sun</span>
              </h1>
            </div>
            <p>From precision engineering tools to local Jua Kali fabrications. We empower every Kenyan fundi with the best equipment.</p>
            <a href="#" className="cta-button" onClick={() => setIsProductPage(true)}>
              Explore Collection
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </a>
          </div>
        </div>
      </section>
      {/* Gallery section rolled back to per-category panels */}

      <section className="container">
        <div className="stats-grid">
           <div className="stat-item">
              <h3>1K+</h3>
              <p>Items in Stock</p>
           </div>
           <div className="stat-item">
              <h3>24/7</h3>
              <p>Fundi Support</p>
           </div>
           <div className="stat-item">
              <h3>100%</h3>
              <p>Genuine Brands</p>
           </div>
           <div className="stat-item">
              <h3>254</h3>
              <p>Locally Fabricated</p>
           </div>
        </div>

        <div className="section-title">
          <h2>Tool <span>Categories</span></h2>
          <p>Explore our specialized range of professional hardware and industrial equipment.</p>
        </div>

        <div className="category-grid">
          {categories.map(cat => (
            <div key={cat.id} className="category-card" onClick={() => { setSelectedCategory(cat.id); setIsProductPage(true); }}>
              {categoryMeta[cat.id]?.image ? (
                <img src={categoryMeta[cat.id].image} alt={cat.name} />
              ) : (
                <div className="category-icon-only" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem', background: 'var(--card-bg)' }}>
                  {categoryMeta[cat.id]?.icon}
                </div>
              )}
              <div className="category-content">
                {!categoryMeta[cat.id]?.image && <div className="category-icon">{cat.icon}</div>}
                <h3>{cat.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="our-story" style={{padding: '8rem 0', background: 'var(--card-bg)'}}>
        <div className="container">
          <div className="section-title">
            <h2>Our <span>Story</span></h2>
          </div>
          <div style={{maxWidth: '900px', margin: '0 auto'}}>
            <p style={{fontSize: '1.25rem', lineHeight: 1.8, color: 'var(--text-muted)', marginBottom: '2rem'}}>
              Central Hardware was founded 25 years ago with a simple mission: to provide Kenyan craftsmen, builders, and engineers with the highest quality tools and equipment at competitive prices. What started as a small shop in Mlolongo, Mombasa Road has grown into Kenya's premier destination for professional hardware supplies.
            </p>
            <p style={{fontSize: '1.25rem', lineHeight: 1.8, color: 'var(--text-muted)', marginBottom: '2rem'}}>
              We understand that behind every project—from a simple home repair to a major construction—there's a Kenyan fundi who deserves reliable tools. That's why we source everything from precision engineering instruments to locally fabricated Jua Kali products, ensuring that you have access tools you can trust.
            </p>
            <p style={{fontSize: '1.25rem', lineHeight: 1.8, color: 'var(--text-muted)'}}>
              Today, we stock over 1,000 items across 12 categories, serving everyone from weekend DIY enthusiasts to large-scale contractors. Our commitment to quality, authenticity, and exceptional service remains the foundation of everything we do. Because at Central Hardware, we believe the right tool can make all the difference.
            </p>
          </div>
        </div>
      </section>

      <footer style={{background: 'var(--primary)', padding: '4rem 0 2rem', marginTop: '4rem'}}>
        <div className="container">
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', marginBottom: '3rem'}}>
            <div>
              <div className="logo" style={{marginBottom: '1rem'}}>CENTRAL <span>HARDWARE</span></div>
              <p style={{color: 'var(--text-muted)', lineHeight: 1.6}}>Kenya's premier destination for professional tools and hardware supplies. Serving craftsmen across the nation for over 25 years.</p>
            </div>
            <div>
              <h4 style={{color: '#fff', marginBottom: '1.25rem', fontWeight: 700}}>Categories</h4>
              <ul style={{listStyle: 'none', padding: 0}}>
                {categories.slice(0, 5).map(cat => <li key={cat.id} style={{marginBottom: '0.75rem'}}><a href="#" style={{color: 'var(--text-muted)', textDecoration: 'none'}}>{cat.name}</a></li>)}
              </ul>
            </div>
            <div>
              <h4 style={{color: '#fff', marginBottom: '1.25rem', fontWeight: 700}}>Contact</h4>
              <p style={{color: 'var(--text-muted)', lineHeight: 1.8}}>
                Central Hardware Building<br/>
                River Road, Nairobi<br/>
                +254 700 000000<br/>
                info@centralhardware.co.ke
              </p>
            </div>
            <div>
              <h4 style={{color: '#fff', marginBottom: '1.25rem', fontWeight: 700}}>Hours</h4>
              <p style={{color: 'var(--text-muted)', lineHeight: 1.8}}>
                Monday - Saturday: 8:00 AM - 7:00 PM<br/>
                Sunday: 9:00 AM - 5:00 PM<br/>
                Public Holidays: 9:00 AM - 2:00 PM
              </p>
            </div>
          </div>
          <div style={{borderTop: '1px solid var(--border)', paddingTop: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem'}}>
            &copy; 2026 Central Hardware. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
