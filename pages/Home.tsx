import React, { useState, useEffect } from 'react';
import { getProducts, getVendors, getEcosystemStats } from '../services/mockData';
import { analyzeSearchIntent, SearchIntent } from '../services/geminiService';
import { ProductCard } from '../components/ProductCard';
import { Product, Vendor, EcosystemStats } from '../types';
import { Sparkles, ShoppingBag, Cpu, ShieldCheck, Activity, MessageSquare, Terminal, ArrowRight, Search, X, Loader2, Filter, ArrowUpDown, Palette } from 'lucide-react';
import { Link } from '../components/Navigation';
import { ChatAssistant } from '../components/ChatAssistant';

const QUICK_STYLES = ['Vintage', 'Modern', 'Traditional', 'Cyberpunk', 'Minimalist', 'Bohemian'];

export const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [stats, setStats] = useState<EcosystemStats | null>(null);
  const [sortOption, setSortOption] = useState('newest');

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [activeIntent, setActiveIntent] = useState<SearchIntent | null>(null);

  const applySort = (items: Product[], sort: string) => {
    const sorted = [...items];
    if (sort === 'price-asc') return sorted.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') return sorted.sort((a, b) => b.price - a.price);
    if (sort === 'name-asc') return sorted.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'newest') return sorted.sort((a, b) => b.id - a.id);
    return sorted;
  };

  const loadData = () => {
    const allProducts = getProducts();
    setProducts(allProducts);
    setFilteredProducts(applySort(allProducts, sortOption));
    setVendors(getVendors());
    setStats(getEcosystemStats());
  };

  useEffect(() => {
    loadData();
    // Listen for real-time updates from Dashboard/Cart
    window.addEventListener('productUpdated', loadData);
    return () => window.removeEventListener('productUpdated', loadData);
  }, []); // sortOption is not a dependency here to avoid reloading data on sort change, we handle sort change separately

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value;
    setSortOption(newSort);
    setFilteredProducts(prev => applySort(prev, newSort));
  };

  const executeSearch = async (query: string) => {
    if (!query.trim()) {
        setFilteredProducts(applySort(products, sortOption));
        setActiveIntent(null);
        setIsSearching(false);
        return;
    }

    setIsSearching(true);
    setActiveIntent(null);

    try {
        const intent = await analyzeSearchIntent(query);
        setActiveIntent(intent);
        
        let results: Product[] = [];

        if (intent) {
            results = products.filter(p => {
                const matchCat = intent.category ? p.category.toLowerCase().includes(intent.category.toLowerCase()) : true;
                const matchPrice = intent.maxPrice ? p.price <= intent.maxPrice : true;
                const matchMaterial = intent.material ? (p.description.toLowerCase().includes(intent.material.toLowerCase()) || p.name.toLowerCase().includes(intent.material.toLowerCase())) : true;
                const matchColor = intent.color ? (p.description.toLowerCase().includes(intent.color.toLowerCase()) || p.name.toLowerCase().includes(intent.color.toLowerCase())) : true;
                const matchStyle = intent.style ? (p.description.toLowerCase().includes(intent.style.toLowerCase()) || p.name.toLowerCase().includes(intent.style.toLowerCase()) || p.category.toLowerCase().includes(intent.style.toLowerCase())) : true;

                return matchCat && matchPrice && matchMaterial && matchColor && matchStyle;
            });
        } else {
            const lower = query.toLowerCase();
            results = products.filter(p => p.name.toLowerCase().includes(lower) || p.description.toLowerCase().includes(lower));
        }
        setFilteredProducts(applySort(results, sortOption));
    } catch (err) {
        console.error(err);
        const lower = query.toLowerCase();
        const results = products.filter(p => p.name.toLowerCase().includes(lower) || p.description.toLowerCase().includes(lower));
        setFilteredProducts(applySort(results, sortOption));
    } finally {
        setIsSearching(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(searchQuery);
  };

  const handleStyleClick = (style: string) => {
    const query = `${style} style`; // Append 'style' to guide the AI
    setSearchQuery(query);
    executeSearch(query);
  };

  const clearSearch = () => {
      setSearchQuery('');
      setFilteredProducts(applySort(products, sortOption));
      setActiveIntent(null);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Neural Link Header Status */}
      <div className="bg-aura-purple/5 border-b border-white/5 py-3 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-green-400">Neural Link Active</span>
            </div>
            <div className="hidden md:flex items-center gap-2 text-[10px] text-gray-600 font-bold uppercase tracking-widest">
              <Terminal size={12} /> SYNC_LATENCY: 14ms
            </div>
          </div>
          <div className="text-[10px] text-aura-purple/80 font-black uppercase tracking-widest flex items-center gap-2">
            Aura Neural Hub • Gemini 3.0 Pro <Sparkles size={12} className="animate-pulse" />
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-40 px-6 overflow-hidden min-h-[80vh] flex flex-col items-center justify-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-aura-purple/10 blur-[150px] rounded-full opacity-50" />
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10 w-full">
             <div className="flex flex-col items-center gap-0 mb-16 select-none animate-in zoom-in duration-1000">
                <h2 className="text-3xl md:text-5xl lg:text-7xl text-white/90 font-black uppercase tracking-[0.3em] md:tracking-[0.6em] pl-4 md:pl-12 mb-[-0.5rem] md:mb-[-1.5rem] z-10 drop-shadow-2xl">
                  SNEHALATA
                </h2>
                <h1 className="text-[5rem] md:text-[8rem] lg:text-[10rem] font-black text-white leading-none tracking-tighter bn-heavy drop-shadow-[0_0_80px_rgba(124,58,237,0.4)] bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-gray-500">
                  স্নেহলতা
                </h1>
             </div>

             <div className="w-full px-4 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                <ChatAssistant embedded={true} className="shadow-[0_0_100px_rgba(124,58,237,0.2)]" />
             </div>

             <div className="flex flex-wrap justify-center gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
                <Link to="/studio" className="group relative bg-white text-black px-12 py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] flex items-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-[0_20px_40px_rgba(255,255,255,0.1)] overflow-hidden">
                  <div className="absolute inset-0 bg-aura-purple/10 translate-y-full group-hover:translate-y-0 transition-transform" />
                  <Sparkles size={18} className="relative z-10" /> <span className="relative z-10">জেনারেট ইমেজ/ভিডিও</span>
                </Link>
                <Link to="/studio" className="bg-white/5 border border-white/10 text-white px-12 py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] flex items-center gap-3 hover:bg-white/10 transition-all active:scale-95 backdrop-blur-md">
                  <MessageSquare size={18} /> Aura AI চ্যাট
                </Link>
             </div>
        </div>
      </section>

      {/* Hub Catalog Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-white/5">
        <div className="flex flex-col md:flex-row items-end justify-between mb-8 gap-12">
          <div className="space-y-4">
            <h2 className="text-5xl font-serif font-black text-white leading-tight">ইকোসিস্টেম ক্যাটালগ</h2>
            <p className="text-[11px] text-gray-500 uppercase tracking-[0.5em] font-black flex items-center gap-3">
              <span className="w-12 h-px bg-aura-purple/40"></span>
              Exclusive direct-from-artisan collection
            </p>
          </div>
          
          <div className="w-full md:w-auto flex-1 max-w-2xl flex flex-col md:flex-row gap-4 justify-end">
             {/* Sort Dropdown */}
             <div className="relative group min-w-[180px]">
                 <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-500">
                     <ArrowUpDown size={14} />
                 </div>
                 <select 
                    value={sortOption}
                    onChange={handleSortChange}
                    className="w-full appearance-none bg-white/5 border border-white/10 rounded-2xl pl-12 pr-8 py-3.5 text-xs font-bold uppercase tracking-widest text-white focus:outline-none focus:border-aura-purple hover:bg-white/10 transition-all cursor-pointer h-full"
                 >
                     <option value="newest" className="bg-black">New Arrivals</option>
                     <option value="price-asc" className="bg-black">Price: Low to High</option>
                     <option value="price-desc" className="bg-black">Price: High to Low</option>
                     <option value="name-asc" className="bg-black">Name: A-Z</option>
                 </select>
                 <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-500">
                     <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                 </div>
             </div>

             {/* Search */}
             <form onSubmit={handleSearch} className="relative group flex-1">
                <div className="absolute inset-0 bg-gradient-to-r from-aura-purple/20 to-blue-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative bg-white/5 border border-white/10 rounded-2xl flex items-center p-2 focus-within:border-aura-purple/50 transition-all backdrop-blur-xl">
                    <Search className="text-gray-500 ml-4 shrink-0" size={20} />
                    <input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search items, style, or fabric..."
                        className="w-full bg-transparent border-none text-white px-4 py-3 focus:outline-none placeholder-gray-600 font-medium"
                    />
                    {searchQuery && (
                        <button type="button" onClick={clearSearch} className="p-2 text-gray-500 hover:text-white transition-colors"><X size={16}/></button>
                    )}
                    <button 
                        type="submit"
                        disabled={isSearching}
                        className="bg-white text-black px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-aura-purple hover:text-white transition-all shadow-lg flex items-center gap-2 shrink-0"
                    >
                        {isSearching ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                        Search
                    </button>
                </div>
             </form>
          </div>
        </div>

        {/* Style Filters */}
        <div className="mb-12 flex flex-col gap-4">
            <div className="flex items-center gap-3 text-xs font-bold text-gray-500 uppercase tracking-widest">
                <Palette size={14} /> Shop by Aesthetic
            </div>
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                {QUICK_STYLES.map(style => (
                    <button
                        key={style}
                        onClick={() => handleStyleClick(style)}
                        className={`
                            px-6 py-3 rounded-2xl border transition-all text-[11px] font-black uppercase tracking-widest whitespace-nowrap
                            ${searchQuery.includes(style) 
                                ? 'bg-aura-purple text-white border-aura-purple shadow-[0_0_15px_rgba(124,58,237,0.4)]' 
                                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white hover:border-white/20'
                            }
                        `}
                    >
                        {style}
                    </button>
                ))}
            </div>
        </div>

        {activeIntent && (
            <div className="flex flex-wrap gap-3 mb-10 animate-in fade-in slide-in-from-top-4">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-black text-gray-500 mr-2">
                    <Filter size={12} /> Active Filters:
                </div>
                {activeIntent.material && <span className="px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold">Material: {activeIntent.material}</span>}
                {activeIntent.category && <span className="px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold">Category: {activeIntent.category}</span>}
                {activeIntent.maxPrice && <span className="px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold">Max Price: ৳{activeIntent.maxPrice}</span>}
                {activeIntent.color && <span className="px-4 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-bold">Color: {activeIntent.color}</span>}
                {activeIntent.style && <span className="px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-bold">Style: {activeIntent.style}</span>}
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
          {filteredProducts.length > 0 ? (
             filteredProducts.map(p => (
               <ProductCard key={p.id} product={p} vendor={vendors.find(v => v.id === p.vendorId)} />
             ))
          ) : (
             <div className="col-span-full text-center py-20 opacity-50">
                <ShoppingBag size={48} className="mx-auto mb-4" />
                <p className="text-xl font-serif">No items found matching your criteria.</p>
                <button onClick={clearSearch} className="text-aura-purple mt-4 hover:underline">Clear Filters</button>
             </div>
          )}
        </div>
      </section>

      {/* Pulse Stats Hub */}
      <section className="max-w-7xl mx-auto px-6 py-20 relative z-20 border-t border-white/5 bg-white/[0.02]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard icon={<Cpu className="text-aura-purple" />} label="Artisan Nodes" value={stats?.totalVendors || '0'} sub="Verified Ecosystem" />
          <StatCard icon={<ShoppingBag className="text-blue-400" />} label="Live Items" value={stats?.activeProducts || '0'} sub="Audited Inventory" />
          <StatCard icon={<Activity className="text-green-400" />} label="Neural Pulse" value="Optimal" sub="System Synced" />
          <StatCard icon={<ShieldCheck className="text-amber-400" />} label="Security" value="Active" sub="Neural Shield v3.1" />
        </div>
      </section>

    </div>
  );
};

const StatCard = ({ icon, label, value, sub }: any) => (
  <div className="bg-aura-glass border border-aura-glassBorder rounded-[2.5rem] p-8 backdrop-blur-3xl shadow-2xl hover:border-aura-purple/50 transition-all duration-500 group relative overflow-hidden">
    <div className="absolute top-0 right-0 w-24 h-24 bg-aura-purple/5 blur-[40px] rounded-full pointer-events-none group-hover:bg-aura-purple/10 transition-all" />
    <div className="p-4 bg-white/5 rounded-2xl w-fit mb-6 group-hover:bg-aura-purple group-hover:text-white transition-all shadow-xl">{icon}</div>
    <div className="text-4xl font-black text-white mb-2 tracking-tighter tabular-nums">{value}</div>
    <div className="text-[10px] uppercase tracking-[0.3em] font-black text-gray-400 mb-1">{label}</div>
    <div className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">{sub}</div>
  </div>
);