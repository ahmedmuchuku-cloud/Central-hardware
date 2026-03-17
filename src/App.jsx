import React, { useState, useEffect, useMemo, useRef } from 'react';
import itemsData from './data/items.json';
import idToImage from './data/id_to_image.json';

import heroImg1 from './assets/hero.png';
import heroImg2 from './assets/hero_construction.png';
import heroImg3 from './assets/hero_shop.png';
import heroImg4 from './assets/hero_workshop.png';
import brandLogo from './assets/Logo.png';

const heroImages = [heroImg1, heroImg2, heroImg3, heroImg4];
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
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedPrices, setSelectedPrices] = useState([]);
  
  const [tempCategories, setTempCategories] = useState([]);
  const [tempBrands, setTempBrands] = useState([]);
  const [tempPrices, setTempPrices] = useState([]);
  const [activeTab, setActiveTab] = useState('categories'); // categories, brands, price
  const [isProductPage, setIsProductPage] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [quoteCart, setQuoteCart] = useState([]);
  
  // Hero transition state
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  // Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([{ role: 'model', text: 'Hello! I am your Central Hardware AI Assistant. How can I help you find the right tools for your project today?' }]);
  const [chatInput, setChatInput] = useState('');
  const [geminiKey, setGeminiKey] = useState(localStorage.getItem('opencode_api_key') || 'sk-xy6lJ3RTZAycEUJ57j9ezeVOuXRsx8dsa0FPTShBSsrkyTFL56zbrNa7ww2gfzXh');
  const [selectedItem, setSelectedItem] = useState(null);
  const clickTimeoutRef = useRef(null);
  const chatEndRef = useRef(null);

  const heroContent = [
    {
      title: "Everything Under The Sun",
      subtitle: "We empower every Kenyan fundi with the best equipment."
    },
    {
      title: "100% Genuine",
      subtitle: "Verified brands only"
    },
    {
      title: "12/7 Services",
      subtitle: "Every day service 8am-6pm"
    },
    {
      title: "Professional Support",
      subtitle: "Get free advice"
    }
  ];

  const allItems = useMemo(() => {
    return itemsData.categories.flatMap(cat => 
      cat.items.map(item => ({ ...item, categoryId: cat.id, categoryName: cat.name }))
    );
  }, []);

  const shuffledTickerItems = useMemo(() => {
    // Pick 60 random items for the ticker to keep DOM light and performance high
    return [...allItems].sort(() => Math.random() - 0.5).slice(0, 60);
  }, [allItems]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000); 
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isChatOpen && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatOpen]);

  const toggleQuoteItem = (item) => {
    setQuoteCart(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) {
        return prev.filter(i => i.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
  };

  const sendWhatsAppQuote = () => {
    if (quoteCart.length === 0) return;
    let message = "*Order Inquiry - Central Hardware*\n\n";
    quoteCart.forEach((item, index) => {
      message += `${index + 1}. *${item.name}*\n   Brand: ${item.brand || 'N/A'}\n   Price: KES ${item.price_range}\n   Item ID: #${item.id}\n\n`;
    });
    message += `*Total Items:* ${quoteCart.length}\n\n_Please confirm availability and current pricing._`;
    const encodedText = encodeURIComponent(message);
    window.open(`https://wa.me/254701006983?text=${encodedText}`, '_blank');
  };

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    if (!geminiKey) {
      alert("Please enter an OpenCode API Key to use the chat.");
      return;
    }
    const newUserMessage = { role: 'user', text: chatInput };
    setChatMessages((prev) => [...prev, newUserMessage]);
    setChatInput('');
    setIsChatLoading(true);
    try {
      const catalogContext = allItems.slice(0, 100).map(item => 
        `- ${item.name} (${item.brand}) - KES ${item.price_range}`
      ).join('\n');
      const systemPrompt = `You are a professional industrial hardware expert for Central Hardware in Mlolongo, Kenya.
Context: You are helping a customer browse our catalog.
Catalog Summary:
${catalogContext}

Instructions:
- Be technical, helpful, and concise.
- Only recommend items from the catalog.
- If unsure or empty search, ask for specifics.
- Do not disclose personal contact info publicly.

User Question: ${chatInput}`;

      const response = await fetch('/api/ai/zen/v1/responses', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${geminiKey}`
        },
        mode: 'cors',
        body: JSON.stringify({
          model: "gpt-4o",
          input: systemPrompt,
          text: { format: { type: "text" }, verbosity: "medium" },
          max_output_tokens: 512
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || `API Error: ${response.status}`);
      }

      const data = await response.json();
      
      // Handle both OpenCode specific and standard OpenAI-like structures
      let modelText = "Sorry, I couldn't understand that.";
      if (data.output?.[0]?.content?.[0]?.text) {
        modelText = data.output[0].content[0].text;
      } else if (data.choices?.[0]?.message?.content) {
        modelText = data.choices[0].message.content;
      }
      setChatMessages((prev) => [...prev, { role: 'model', text: modelText }]);
    } catch (err) {
      console.error("AI Chat Error:", err);
      setChatMessages((prev) => [...prev, { role: 'model', text: `Connection Error: ${err.message}. Please check your internet and API key.` }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const saveApiKey = (e) => {
    const val = e.target.value;
    setGeminiKey(val);
    localStorage.setItem('opencode_api_key', val);
  };

  const categoryMeta = {
    electricals: { image: electrcals, icon: "⚡" },
    plumbing: { image: plumbing, icon: "🔧" },
    welding: { image: welding, icon: "🔥" },
    juakali: { image: Juakali, icon: "⚒️" },
    locks_padlocks: { image: locks, icon: "🔒" },
    farm_tools: { image: farmTools, icon: "🚜" },
    fasteners: { image: boltsAndScrews, icon: "🔩" },
    tools: { image: fundiTools, icon: "🏗️" },
    household: { image: utensilsPlasticware, icon: "🍽️" },
    engineering_tools: { image: engineeringTools, icon: "🛠️" },
    screws_boards: { image: screwsBoards, icon: "🪛" },
    mali_mali: { image: maliMali, icon: "🛍️" }
  };

  const categories = itemsData.categories;
  const allBrands = useMemo(() => Array.from(new Set(allItems.map(i => i.brand))).filter(Boolean), [allItems]);
  const priceRanges = ['Under 1000', '1000 - 5000', '5000 - 10000', '10000+'];

  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = item.name.toLowerCase().includes(searchLower) || 
                          (item.description && item.description.toLowerCase().includes(searchLower)) ||
                          item.id.toLowerCase().includes(searchLower);
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(item.categoryId);
      const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(item.brand);
      let matchesPrice = true;
      if (selectedPrices.length > 0) {
        const p = parseInt((item.price_range || "0").replace(/\D/g, ''), 10);
        matchesPrice = selectedPrices.some(range => {
          if (range === 'Under 1000') return p < 1000;
          if (range === '1000 - 5000') return p >= 1000 && p <= 5000;
          if (range === '5000 - 10000') return p > 5000 && p <= 10000;
          if (range === '10000+') return p > 10000;
          return false;
        });
      }
      return matchesSearch && matchesCategory && matchesBrand && matchesPrice;
    });
  }, [searchTerm, selectedCategories, selectedBrands, selectedPrices, allItems]);

  const getGroupName = (name) => {
    return name
      // 1. Remove bracketed info completely
      .replace(/\s*\([^)]*\)/g, '')
      // 2. Clear dimensions and values with units: 4x2ft, 1/2", 10.5A, 3-Way, 4-Pole, 6-Way, 1Gang, 30mA, 2P etc.
      .replace(/\s*\b\d+([\/\.x-](\d+))*(\s*(mm|ma|p|a|l|w|v|kv|kva|kg|ft|inch|in|hp|gang|way|pole|core|drawer|disc|grit|%|ohm|uf|amps|amp|litres|litre|liters|liter|watts|watt|volts|volt|mtr|m|mm²|²|["']))\b/gi, '')
      // 3. Clear category-specific ratings (PN20, Sch40, Class 5 etc.)
      .replace(/\b(pn\d+|sch\d+|class\s*\d+)\b/gi, '')
      // 4. Final cleanup
      .replace(/\s\s+/g, ' ')
      .trim()
      .replace(/[-x,./\\]+$/, '')
      .trim();
  };

  const extractSpec = (name) => {
    // Regex to find things like 1/2", 4x2, PN20, 3-Way, 10.5A, 30mA, 2P
    const match = name.match(/\b(\d+([\/\.x-](\d+))*(\s*(mm|ma|p|a|l|w|v|kv|kva|kg|ft|inch|in|hp|gang|way|pole|core|grit|amps|amp|litres|litre|watts|watt|volts|volt|mm²|²|["'])))\b| \b(pn\d+|sch\d+|class\s*\d+)\b/gi);
    return match ? match[0].trim() : null;
  };

  const groupedItems = useMemo(() => {
    const groups = {};
    filteredItems.forEach(item => {
      const baseName = getGroupName(item.name);
      // Group by Brand + BaseName to keep Schneider/Chint separate
      const groupKey = `${item.brand || 'Generic'}-${baseName}-${item.categoryId}`;
      
      if (!groups[groupKey]) {
        groups[groupKey] = {
          id: groupKey,
          name: baseName,
          categoryId: item.categoryId,
          brand: item.brand,
          variants: []
        };
      }
      groups[groupKey].variants.push(item);
    });
    return Object.values(groups);
  }, [filteredItems]);

  const hasPendingChanges = 
    JSON.stringify(tempCategories) !== JSON.stringify(selectedCategories) ||
    JSON.stringify(tempBrands) !== JSON.stringify(selectedBrands) ||
    JSON.stringify(tempPrices) !== JSON.stringify(selectedPrices);

  const applyFilters = () => {
    setSelectedCategories([...tempCategories]);
    setSelectedBrands([...tempBrands]);
    setSelectedPrices([...tempPrices]);
  };

  const toggleTemp = (list, setList, item) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  return (
    <div className="animate-in">
      <header>
        <nav className="container" style={{ alignItems: 'center' }}>
          <div className="logo" style={{ cursor: 'pointer' }} onClick={() => setIsProductPage(false)}>
            <img src={brandLogo} alt="Logo" style={{ height: '2.2rem', width: 'auto' }} />
            <span style={{ color: '#fff' }}>CENTRAL <span style={{ color: 'var(--accent)' }}>HARDWARE</span></span>
          </div>
          <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <a href="#" className={!isProductPage ? "active" : ""} onClick={(e) => { e.preventDefault(); setIsProductPage(false); }}>Home</a>
            <a href="#" className={isProductPage ? "active" : ""} onClick={(e) => { e.preventDefault(); setIsProductPage(true); }}>Products</a>
            {!isProductPage && <a href="#our-story" onClick={(e) => { e.preventDefault(); document.getElementById('our-story')?.scrollIntoView({behavior: 'smooth'}); }} style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>About Us</a>}
            <div 
              className="cart-icon-trigger" 
              onClick={() => setCartOpen(true)} 
              style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              {quoteCart.length > 0 && (
                <span style={{ position: 'absolute', top: '-8px', right: '-10px', background: 'var(--accent)', color: '#000', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 900 }}>
                  {quoteCart.length}
                </span>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Hidden Print Section */}
      <div id="print-quote">
        <div className="print-header">
          <div>
            <h1>CENTRAL <span>HARDWARE</span></h1>
            <p style={{ color: '#666', fontSize: '10pt', marginTop: '5pt' }}>Industrial Supplier | Kwa Kalembe, Mlolongo</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '14pt', fontWeight: 800 }}>PROFORMA QUOTE</p>
            <p style={{ fontSize: '9pt', color: '#666' }}>Date: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
        
        <table className="print-table">
          <thead>
            <tr>
              <th style={{ width: '40pt' }}>#</th>
              <th>Product Specification</th>
              <th>Brand</th>
              <th style={{ textAlign: 'right' }}>Price Guide (KES)</th>
            </tr>
          </thead>
          <tbody>
            {quoteCart.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td style={{ fontWeight: 600 }}>{item.name}</td>
                <td>{item.brand || 'Generic'}</td>
                <td style={{ textAlign: 'right' }}>{item.price_range}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ padding: '15pt', background: '#f9f9f9', border: '1pt solid #eee', borderRadius: '4pt' }}>
          <p style={{ fontSize: '9pt', fontWeight: 800, marginBottom: '5pt' }}>Terms & Conditions:</p>
          <ul style={{ fontSize: '8pt', color: '#555', margin: 0, paddingLeft: '15pt' }}>
            <li>This quote is for information purposes only.</li>
            <li>Final prices may vary based on market fluctuations at the time of purchase.</li>
            <li>Stock availability must be confirmed via WhatsApp: +254 701 006 983.</li>
          </ul>
        </div>

        <div className="print-footer">
          <p>Generated via Central Hardware Digital Inventory Portal</p>
          <p>Kwa Kalembe, Mlolongo, Kenya | ahmedmuchuku@gmail.com</p>
        </div>
      </div>

      {isProductPage ? (
        <main className="container" style={{marginTop: '2rem'}}>
          <div className="section-title compact" style={{ marginBottom: '0.5rem' }}>
            <h2 style={{fontSize: '1rem'}}>Inventory Portal</h2>
          </div>

          <div className="collection-main">
            <div className="search-bar" style={{ marginBottom: '0.5rem', position: 'relative' }}>
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search 1,000+ items..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: 'var(--card-bg)',
                  border: '1px solid var(--accent)',
                  borderTop: 'none',
                  borderRadius: '0 0 12px 12px',
                  zIndex: 200,
                  maxHeight: '300px',
                  overflowY: 'auto',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                }}>
                  {filteredItems.slice(0, 8).map(item => (
                    <div 
                      key={item.id}
                      onClick={() => { setSelectedItem(item); setSearchTerm(''); }}
                      style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem' }}
                      className="search-suggestion-item"
                    >
                      <div style={{ width: '30px', height: '30px', background: '#fff', borderRadius: '4px', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         {idToImage[item.id] ? <img src={`/product_images/${idToImage[item.id]}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span>📦</span>}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#fff' }}>{item.name}</div>
                        <div style={{ fontSize: '0.55rem', color: 'var(--accent)', fontWeight: 800 }}>{item.brand} | KES {item.price_range}</div>
                      </div>
                    </div>
                  ))}
                  {filteredItems.length === 0 && <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem' }}>No items found</div>}
                </div>
              )}
            </div>

            <div className="filter-panel" style={{ position: 'relative' }}>
              {(selectedCategories.length > 0 || selectedBrands.length > 0 || selectedPrices.length > 0) && (
                <div className="active-filters-row">
                  {selectedCategories.map(catId => (
                    <div key={catId} className="active-badge clickable" onClick={() => {
                      const newList = selectedCategories.filter(c => c !== catId);
                      setSelectedCategories(newList);
                      setTempCategories(newList);
                    }}>
                      {categoryMeta[catId]?.icon} {categories.find(c => c.id === catId)?.name || catId} <span style={{marginLeft: '5px', opacity: 0.6}}>×</span>
                    </div>
                  ))}
                  {selectedBrands.map(brand => (
                    <div key={brand} className="active-badge clickable" onClick={() => {
                      const newList = selectedBrands.filter(b => b !== brand);
                      setSelectedBrands(newList);
                      setTempBrands(newList);
                    }}>
                      {brand} <span style={{marginLeft: '5px', opacity: 0.6}}>×</span>
                    </div>
                  ))}
                  {selectedPrices.map(price => (
                    <div key={price} className="active-badge clickable" onClick={() => {
                      const newList = selectedPrices.filter(p => p !== price);
                      setSelectedPrices(newList);
                      setTempPrices(newList);
                    }}>
                      KES {price} <span style={{marginLeft: '5px', opacity: 0.6}}>×</span>
                    </div>
                  ))}
                  <button className="reset-btn" onClick={() => {
                    setSelectedCategories([]);
                    setSelectedBrands([]);
                    setSelectedPrices([]);
                    setTempCategories([]);
                    setTempBrands([]);
                    setTempPrices([]);
                  }}>Reset All</button>
                </div>
              )}

              <div className="filter-tabs-container">
                <div className="filter-tabs">
                  <button className={activeTab === 'categories' ? 'active' : ''} onClick={() => setActiveTab('categories')}>Categories ({tempCategories.length})</button>
                  <button className={activeTab === 'brands' ? 'active' : ''} onClick={() => setActiveTab('brands')}>Brands ({tempBrands.length})</button>
                  <button className={activeTab === 'price' ? 'active' : ''} onClick={() => setActiveTab('price')}>Price Range ({tempPrices.length})</button>
                </div>
                
                <div className="filter-content" style={{ paddingBottom: hasPendingChanges ? '4rem' : '1rem' }}>
                  {activeTab === 'categories' && (
                    <div className="filter-options">
                      {categories.map(cat => (
                        <div key={cat.id} className={`filter-chip ${tempCategories.includes(cat.id) ? 'active' : ''}`} onClick={() => toggleTemp(tempCategories, setTempCategories, cat.id)}>
                          {categoryMeta[cat.id]?.icon} {cat.name}
                        </div>
                      ))}
                    </div>
                  )}
                  {activeTab === 'brands' && (
                    <div className="filter-options">
                      {allBrands.map(brand => (
                        <div key={brand} className={`filter-chip ${tempBrands.includes(brand) ? 'active' : ''}`} onClick={() => toggleTemp(tempBrands, setTempBrands, brand)}>
                          {brand}
                        </div>
                      ))}
                    </div>
                  )}
                  {activeTab === 'price' && (
                    <div className="filter-options">
                      {priceRanges.map(price => (
                        <div key={price} className={`filter-chip ${tempPrices.includes(price) ? 'active' : ''}`} onClick={() => toggleTemp(tempPrices, setTempPrices, price)}>
                          {price}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {hasPendingChanges && (
                  <div style={{
                    position: 'absolute',
                    bottom: '0',
                    left: '0',
                    right: '0',
                    background: 'rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(10px)',
                    padding: '1rem',
                    borderTop: '1px solid var(--accent)',
                    display: 'flex',
                    justifyContent: 'center',
                    zIndex: 10
                  }}>
                    <button 
                      onClick={applyFilters}
                      style={{
                        background: 'var(--accent)',
                        color: '#000',
                        border: 'none',
                        padding: '0.6rem 2rem',
                        borderRadius: '20px',
                        fontWeight: 900,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        boxShadow: '0 0 20px rgba(251, 191, 36, 0.4)'
                      }}
                    >
                      Confirm Selection
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="product-grid" style={{ marginTop: '1rem' }}>
              {groupedItems.slice(0, 100).map(group => {
                const hasVariants = group.variants.length > 1;
                const firstItem = group.variants[0];
                
                return (
                  <div 
                    key={group.id} 
                    className="product-card" 
                    onClick={() => setSelectedItem(firstItem)}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                  >
                    {extractSpec(firstItem.name) && (
                      <div style={{
                        position: 'absolute',
                        top: '0.5rem',
                        left: '0.5rem',
                        background: 'rgba(15, 23, 42, 0.9)',
                        color: 'var(--accent)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.65rem',
                        fontWeight: 900,
                        zIndex: 15,
                        border: '1px solid var(--border)',
                        textTransform: 'uppercase'
                      }}>
                        {extractSpec(firstItem.name)}
                      </div>
                    )}
                    <div className="product-visual">
                      {idToImage[firstItem.id] ? (
                        <img src={`/product_images/${idToImage[firstItem.id]}`} alt={group.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ color: '#000', fontSize: '2.5rem', opacity: 0.15 }}>{categoryMeta[group.categoryId]?.icon || '📦'}</div>
                      )}
                      
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          if (hasVariants) {
                            setSelectedItem(firstItem);
                          } else {
                            toggleQuoteItem(firstItem);
                          }
                        }}
                        className={`add-to-cart-btn ${(!hasVariants && quoteCart.some(i => i.id === firstItem.id)) ? 'selected' : ''}`}
                        style={{ zIndex: 12 }}
                      >
                        {(!hasVariants && quoteCart.some(i => i.id === firstItem.id)) ? '✓' : '+'}
                      </button>

                      {hasVariants && (
                        <div 
                          className="variant-badge" 
                          style={{ position: 'absolute', bottom: '0.5rem', right: '0.5rem', background: 'var(--accent)', color: '#000', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 900, zIndex: 11 }}
                        >
                          {group.variants.length} SIZES
                        </div>
                      )}
                    </div>
                    
                    <div className="product-info-compact">
                      <h4 style={{ fontSize: '0.85rem' }}>
                        {group.brand && group.brand.toLowerCase() !== 'generic' && (
                          <span className="brand-tag">{group.brand} </span>
                        )}
                        {group.name}
                      </h4>
                      
                      {!hasVariants && (
                        <div className="product-price" style={{ fontSize: '0.9rem' }}>
                          KES {firstItem.price_range}
                        </div>
                      )}

                      {hasVariants && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                          Starting from KES {Math.min(...group.variants.map(v => parseInt(v.price_range.replace(/\D/g, ''), 10)))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {filteredItems.length > 100 && (
             <div style={{textAlign: 'center', marginTop: '6rem', padding: '4rem', background: 'var(--card-bg)', borderRadius: '2rem'}}>
                <h3 style={{fontSize: '2rem', marginBottom: '1rem'}}>Need More Specifics?</h3>
                <p style={{color: 'var(--text-muted)'}}>Use the filters above to narrow down your search among our 1,000+ items.</p>
             </div>
          )}
        </main>
      ) : (
        <>
          <section className="hero" style={{ minHeight: '80vh', padding: 0, position: 'relative', overflow: 'hidden' }}>
            <div className="hero-bg-container" style={{ position: 'absolute', inset: 0 }}>
              {heroImages.map((img, index) => (
                <div 
                  key={index} 
                  className={`hero-bg-slide ${index === currentHeroIndex ? 'active' : ''}`}
                  style={{ backgroundImage: `url(${img})` }}
                />
              ))}
              <div className="hero-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)' }}>
                <div className="container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', minHeight: '80vh', textAlign: 'center', position: 'relative', paddingBottom: '6rem' }}>
                  <div className="hero-badge" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', border: '1px solid var(--accent)', color: 'var(--accent)', padding: '0.3rem 0.8rem', borderRadius: '30px', fontSize: '0.6rem', fontWeight: 800, marginBottom: '1rem' }}>
                    Decades of Excellence
                  </div>
                  
                  <div style={{ background: '#000', padding: '0.3rem 0.6rem', borderRadius: '4px', borderLeft: '3px solid var(--accent)', marginBottom: '0.3rem', width: 'fit-content' }}>
                    <h1 style={{fontSize: '1rem', fontWeight: 900, lineHeight: 1.2, margin: 0, color: '#fff'}}>
                      {heroContent[currentHeroIndex]?.title}
                    </h1>
                  </div>

                  <div style={{ background: '#000', padding: '0.2rem 0.5rem', borderRadius: '4px', width: 'fit-content' }}>
                    <p style={{fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)', margin: 0, fontWeight: 500}}>
                      {heroContent[currentHeroIndex]?.subtitle}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {['Electricals', 'Welding', 'Engineering', 'Tools'].map(tag => (
                      <button 
                        key={tag}
                        onClick={(e) => {
                          e.preventDefault();
                          const cat = categories.find(c => c.name.includes(tag));
                          if (cat) {
                            setSelectedCategories([cat.id]);
                            setTempCategories([cat.id]);
                            setIsProductPage(true);
                          }
                        }}
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: '#fff',
                          padding: '0.3rem 0.7rem',
                          borderRadius: '20px',
                          fontSize: '0.6rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.3s'
                        }}
                        onMouseOver={(e) => e.target.style.borderColor = 'var(--accent)'}
                        onMouseOut={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>

                  <a href="#" className="cta-button" style={{
                    position: 'absolute',
                    bottom: '1rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    padding: '0.5rem 1rem', 
                    fontSize: '0.75rem'
                  }} onClick={(e) => { e.preventDefault(); setIsProductPage(true); }}>
                    Explore Products
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{marginLeft: '0.4rem'}}><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                  </a>
                </div>
              </div>
            </div>
          </section>
          
          <div className="product-ticker-container">
            <div className="product-ticker-track" style={{ animationDuration: `${shuffledTickerItems.length * 1.3}s` }}>
              {[...shuffledTickerItems, ...shuffledTickerItems.slice(0, 20)].map((item, idx) => (
                <div key={`${item.id}-${idx}`} className="ticker-item">
                   • {item.name} <span>KES {item.price_range}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="container" style={{paddingBottom: '2rem'}}>
            <div className="section-title" style={{marginTop: '4rem'}}>
              <h2>Tool <span>Categories</span></h2>
              <p>Explore our specialized range of professional hardware and industrial equipment.</p>
            </div>

            <div className="category-grid">
              {categories.map(cat => (
                <div key={cat.id} className="category-card" onClick={() => { 
                    setSelectedCategories([cat.id]); 
                    setTempCategories([cat.id]);
                    setIsProductPage(true); 
                  }}>
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
                    <p>{cat.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          



          {/* About Us & Contact ONLY on Home */}
          <section id="our-story" style={{padding: '5rem 0', background: 'var(--card-bg)', borderTop: '1px solid var(--border)'}}>
            <div className="container">
              <div className="section-title">
                <h2>About <span>Us</span></h2>
                <p style={{ marginTop: '0.5rem', color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.8rem' }}>
                  Empowering Kenya’s Builders
                </p>
              </div>
              
              <div style={{maxWidth: '850px', margin: '0 auto'}}>
                <p style={{fontSize: '1rem', lineHeight: 1.6, color: '#fff', marginBottom: '2.5rem', textAlign: 'center', opacity: 0.9}}>
                  From our humble beginnings, Central Hardware has grown into Kenya’s trusted partner for professional-grade tools and equipment. 
                  We bridge the gap between global innovation and local craftsmanship.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 768 ? 'repeat(3, 1fr)' : '1fr', gap: '2rem' }}>
                  <div>
                    <h4 style={{ color: 'var(--accent)', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 900 }}>Curated Selection</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      Thousands of products across 12 categories, from precision engineering kits to robust Jua Kali tools.
                    </p>
                  </div>
                  <div>
                    <h4 style={{ color: 'var(--accent)', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 900 }}>For Every Project</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      Whether you are a weekend DIYer or a lead contractor, we provide the reliability you need.
                    </p>
                  </div>
                  <div>
                    <h4 style={{ color: 'var(--accent)', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 900 }}>Our Commitment</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      High quality, competitive pricing, and a deep respect for the Kenyan fundi.
                    </p>
                  </div>
                </div>

                <div style={{ marginTop: '4rem', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2.5rem' }}>
                   <p style={{ fontSize: '1.2rem', fontWeight: 900, fontStyle: 'italic', letterSpacing: '0.05em' }}>
                    "The right tool makes all the difference. We make sure you have it."
                   </p>
                </div>
              </div>
            </div>
          </section>

          <section id="contact" style={{ background: '#000', borderTop: '1px solid var(--border)' }}>
            <div className="container" style={{ padding: 0 }}>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'row', 
                alignItems: 'stretch',
                minHeight: window.innerWidth < 768 ? '250px' : '450px'
              }}>
                <div style={{ 
                  flex: window.innerWidth < 768 ? '0 0 30%' : '0 0 25%', 
                  padding: window.innerWidth < 768 ? '1rem 0.75rem' : '3rem 2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  background: 'rgba(255,255,255,0.02)'
                }}>
                  <div className="section-title" style={{ textAlign: 'left', margin: 0 }}>
                    <h2 style={{ fontSize: window.innerWidth < 768 ? '1rem' : '1.4rem' }}>Visit <span>Us</span></h2>
                  </div>
                  <div style={{ marginTop: window.innerWidth < 768 ? '0.25rem' : '1rem' }}>
                    <p style={{ color: '#fff', fontSize: window.innerWidth < 768 ? '0.7rem' : '0.9rem', fontWeight: 700, marginBottom: '0.1rem' }}>Central Hardware</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: window.innerWidth < 768 ? '0.6rem' : '0.8rem', marginBottom: window.innerWidth < 768 ? '0.75rem' : '1.5rem', lineHeight: '1.3' }}>
                      Kwa Kalembe, Mlolongo,<br />
                      Kenya
                    </p>
                    
                    <a href="https://wa.me/254701006983" target="_blank" rel="noreferrer" style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '0.3rem', 
                      background: '#25D366', 
                      color: '#fff', 
                      padding: window.innerWidth < 768 ? '0.3rem 0.5rem' : '0.6rem 1.2rem', 
                      borderRadius: '6px', 
                      textDecoration: 'none', 
                      fontWeight: 800, 
                      fontSize: window.innerWidth < 768 ? '0.55rem' : '0.8rem',
                      transition: 'var(--transition)'
                    }}>
                      <svg width={window.innerWidth < 768 ? "12" : "18"} height={window.innerWidth < 768 ? "12" : "18"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                      WhatsApp
                    </a>
                  </div>
                </div>

                <div style={{ 
                  flex: '1', 
                  borderLeft: '1px solid var(--border)',
                  filter: 'invert(1) hue-rotate(180deg) contrast(1.1) brightness(0.9)',
                  position: 'relative'
                }}>
                  <iframe 
                    src="https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=Kwa+Kalembe,+Mlolongo,+Kenya&zoom=17" 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen="" 
                    loading="lazy"
                    title="Kwa Kalembe Mlolongo Map">
                  </iframe>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Global Components */}
      {isChatOpen && (
        <div className="chat-overlay">
          <div className="chat-modal">
            <div className="chat-header">
              <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <span style={{fontSize: '1.2rem'}}>🤖</span>
                <h3 style={{margin: 0, fontSize: '0.9rem'}}>Central AI Assistant</h3>
              </div>
              <button className="chat-close" onClick={() => setIsChatOpen(false)}>×</button>
            </div>
            
            <div className="chat-body">
              {!geminiKey && (
                <div style={{padding: '0.5rem', background: 'rgba(251,191,36,0.1)', borderBottom: '1px solid var(--border)', fontSize: '0.7rem'}}>
                  <p style={{margin: '0 0 0.5rem 0', color: 'var(--accent)'}}>Demo Mode: Please enter an OpenCode API Key to use real AI functionality.</p>
                  <input type="password" placeholder="Paste your OpenCode API key here..." value={geminiKey} onChange={saveApiKey} style={{width: '100%', padding: '0.4rem', borderRadius: '4px', background: 'var(--bg)', color: '#fff', border: '1px solid var(--border)', fontSize: '0.7rem'}} />
                  <p style={{margin: '0.3rem 0 0 0', fontSize: '0.6rem', color: 'var(--text-muted)'}}>Get free key at opencode.ai/zen</p>
                </div>
              )}
              <div className="chat-messages">
                {chatMessages.map((msg, i) => (
                   <div key={i} className={`chat-message ${msg.role}`}>
                    <div className="chat-bubble">{msg.text}</div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="chat-message model">
                    <div className="chat-bubble loading">Thinking...</div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            </div>

            <div className="chat-footer">
              <input 
                type="text" 
                placeholder="Ask me anything..." 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
              />
              <button onClick={handleSendChat} disabled={isChatLoading || !chatInput.trim()}>
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedItem && (
        <div className="cart-drawer-overlay" style={{ justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
          <div onClick={() => setSelectedItem(null)} style={{ position: 'absolute', inset: 0 }} />
          <div className="product-detail-modal animate-in" style={{ 
            maxWidth: '1200px', 
            width: window.innerWidth > 768 ? '40%' : '90%', 
            height: 'auto',
            background: '#0a0a0a', 
            borderRadius: '24px', 
            border: '1px solid rgba(255,255,255,0.1)',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: window.innerWidth > 768 ? 'row' : 'column',
            maxHeight: '90vh',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
            backgroundImage: 'url("https://www.transparenttextures.com/patterns/dark-leather.pattern")'
          }}>
            <button 
              onClick={() => setSelectedItem(null)} 
              className="cart-close-btn"
              style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 20, background: 'var(--accent)', color: '#000', width: '40px', height: '40px', fontSize: '1.5rem', borderRadius: '50%', boxShadow: '0 0 20px rgba(0,0,0,0.5)' }}
            >×</button>
            
            <div style={{ flex: '1.2', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              {idToImage[selectedItem.id] ? (
                <img src={`/product_images/${idToImage[selectedItem.id]}`} alt={selectedItem.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '2rem' }} />
              ) : (
                <div style={{ fontSize: '10rem', opacity: 0.1 }}>📦</div>
              )}
            </div>
            
            <div style={{ flex: '1', padding: '2.5rem', overflowY: 'auto', borderLeft: window.innerWidth > 768 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
              <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem' }}>
                <div style={{ color: 'var(--accent)', fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.2rem' }}>
                  {selectedItem.brand || 'Premium Brand'}
                </div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '0.5rem', color: '#fff' }}>{selectedItem.name}</h2>
                <div style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--accent)' }}>KES {selectedItem.price_range}</div>
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Description & Use Cases</h4>
                <p style={{ fontSize: '0.8rem', color: '#ccc', lineHeight: '1.5' }}>
                  {selectedItem.description || "Premium hardware product vetted for quality and durability in the Kenyan environment."}
                </p>
                <ul style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem', paddingLeft: '1.2rem', lineHeight: '1.6' }}>
                  {(selectedItem.use_cases || [
                    "Professional industrial application",
                    "Residential maintenance and repair",
                    "Tested for Kenyan environment durability"
                  ]).map((uc, i) => (
                    <li key={i}>{uc}</li>
                  ))}
                </ul>
              </div>

              {/* Variations list inside modal */}
              {(() => {
                const groupName = getGroupName(selectedItem.name);
                const group = groupedItems.find(g => getGroupName(g.variants[0].name) === groupName && g.categoryId === selectedItem.categoryId);
                
                if (group && group.variants.length > 1) {
                  return (
                    <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                      <h4 style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '0.75rem' }}>Available Sizes / Specifications</h4>
                      <div style={{ display: 'grid', gap: '0.5rem' }}>
                        {group.variants.sort((a,b) => parseInt(a.price_range.replace(/\D/g, ''), 10) - parseInt(b.price_range.replace(/\D/g, ''), 10)).map(v => {
                          const inCart = quoteCart.some(i => i.id === v.id);
                          return (
                            <div 
                              key={v.id} 
                              onClick={() => toggleQuoteItem(v)}
                              style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center', 
                                padding: '0.4rem 0.6rem',
                                background: 'rgba(255,255,255,0.03)',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                border: inCart ? '1px solid var(--accent)' : '1px solid transparent'
                              }}
                            >
                              <div>
                                <div style={{ fontSize: '0.65rem', color: inCart ? 'var(--accent)' : '#fff', fontWeight: 700 }}>{v.name.replace(group.name, '').trim() || v.name}</div>
                                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>KES {v.price_range}</div>
                              </div>
                              <button 
                                style={{ 
                                  background: inCart ? 'var(--accent)' : 'rgba(255,255,255,0.1)', 
                                  border: 'none', 
                                  borderRadius: '4px', 
                                  width: '20px', 
                                  height: '20px', 
                                  color: inCart ? '#000' : '#fff',
                                  fontSize: '0.7rem',
                                  fontWeight: 900
                                }}
                              >
                                {inCart ? '✓' : '+'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }
                
                return (
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                    <button 
                      onClick={() => { toggleQuoteItem(selectedItem); setSelectedItem(null); }}
                      style={{ 
                        flex: 1,
                        padding: '0.8rem', 
                        background: quoteCart.some(i => i.id === selectedItem.id) ? '#ff4444' : 'var(--accent)', 
                        color: quoteCart.some(i => i.id === selectedItem.id) ? '#fff' : '#000',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: 900,
                        fontSize: '0.8rem',
                        cursor: 'pointer'
                      }}
                    >
                      {quoteCart.some(i => i.id === selectedItem.id) ? 'Remove from List' : 'Add to Collection'}
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {cartOpen && (
        <div className="cart-drawer-overlay">
          <div onClick={() => setCartOpen(false)} style={{ position: 'absolute', inset: 0 }} />
          <div className="cart-drawer-content animate-in">
            <div className="cart-drawer-header">
              <div>
                <h2>Collection</h2>
                <p>{quoteCart.length} Items Selected</p>
              </div>
              <button onClick={() => setCartOpen(false)} className="cart-close-btn">×</button>
            </div>

            <div className="cart-items-container">
              {quoteCart.length === 0 ? (
                <div className="empty-cart">
                  <div className="empty-cart-icon">🛒</div>
                  <p>Your list is empty</p>
                </div>
              ) : (
                quoteCart.map(item => (
                  <div key={item.id} className="cart-item-card">
                    <div className="cart-item-img">
                      {idToImage[item.id] ? (
                        <img src={`/product_images/${idToImage[item.id]}`} alt="" />
                      ) : (
                        <div className="cart-item-placeholder">📦</div>
                      )}
                    </div>
                    <div className="cart-item-info">
                      <h4>{item.name}</h4>
                      <p>KES {item.price_range}</p>
                    </div>
                    <button onClick={() => toggleQuoteItem(item)} className="cart-item-remove">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                ))
              )}
            </div>

            {quoteCart.length > 0 && (
              <div className="cart-drawer-footer">
                <button onClick={sendWhatsAppQuote} className="whatsapp-confirm-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Confirm WhatsApp
                </button>
                
                <button 
                  onClick={() => { window.print(); }} 
                  style={{
                    width: '100%',
                    marginTop: '0.5rem',
                    padding: '0.6rem',
                    background: 'rgba(255,255,255,0.05)',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    fontWeight: 700,
                    fontSize: '0.65rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                  Download PDF Quote
                </button>
                <p className="whatsapp-hint">Choose "Save as PDF" in print settings.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Trigger for Chat Box */}
      <button 
        className="chat-trigger" 
        onClick={() => setIsChatOpen(true)}
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'var(--accent)',
          border: 'none',
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          fontSize: '1.5rem'
        }}
      >
        🤖
      </button>
    </div>
  );
};

export default App;
