import React, { useState } from 'react';
import { Product, Vendor } from '../types';
import { ShoppingCart, Eye, X, Plus, Minus, CheckCircle2, ShoppingBag, Shirt, Sparkles, ShieldCheck, Palette, RefreshCcw, Loader2, Share2, Wand2, Zap, ArrowRight } from 'lucide-react';
import { Link } from './Navigation';
import { editAuraImage } from '../services/geminiService';

interface ProductCardProps {
  product: Product;
  vendor?: Vendor;
}

const STYLE_PRESETS = [
  { id: 'vintage', name: 'Vintage', prompt: 'Apply a warm, nostalgic vintage film aesthetic with muted colors, soft lighting, and subtle grain.', icon: '🎬' },
  { id: 'cyberpunk', name: 'Cyberpunk', prompt: 'Apply a cyberpunk aesthetic with neon pink and blue lighting, high contrast, and a futuristic, dark atmosphere.', icon: '🦾' },
  { id: 'minimalist', name: 'Minimal', prompt: 'Apply a minimalist aesthetic with clean lines, neutral colors, and a bright, airy, uncluttered background.', icon: '⚪' },
  { id: 'bohemian', name: 'Boho', prompt: 'Apply a bohemian aesthetic with earthy tones, natural textures, warm sunlight, and a cozy, eclectic vibe.', icon: '🌿' },
];

export const ProductCard: React.FC<ProductCardProps> = ({ product, vendor }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRefineModalOpen, setIsRefineModalOpen] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState(product.imageUrl);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [isQuickAdded, setIsQuickAdded] = useState(false);

  // Modal Add to Cart
  const handleAddToCartModal = () => {
    const currentCart = JSON.parse(localStorage.getItem('aura_cart') || '[]');
    const existingIndex = currentCart.findIndex((item: any) => item.id === product.id);

    if (existingIndex > -1) {
      currentCart[existingIndex].quantity += quantity;
    } else {
      currentCart.push({ ...product, imageUrl: currentImageUrl, quantity });
    }

    localStorage.setItem('aura_cart', JSON.stringify(currentCart));
    window.dispatchEvent(new Event('cartUpdated'));
    setIsAdded(true);
    
    setTimeout(() => {
      window.location.hash = '/cart';
    }, 800);
  };

  // Quick Add (No Modal)
  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    const currentCart = JSON.parse(localStorage.getItem('aura_cart') || '[]');
    const existingIndex = currentCart.findIndex((item: any) => item.id === product.id);

    if (existingIndex > -1) {
      currentCart[existingIndex].quantity += 1;
    } else {
      currentCart.push({ ...product, imageUrl: currentImageUrl, quantity: 1 });
    }

    localStorage.setItem('aura_cart', JSON.stringify(currentCart));
    window.dispatchEvent(new Event('cartUpdated'));
    
    setIsQuickAdded(true);
    setTimeout(() => setIsQuickAdded(false), 2000);
  };

  // Fast Checkout (Add & Redirect)
  const handleFastCheckout = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    const currentCart = JSON.parse(localStorage.getItem('aura_cart') || '[]');
    const existingIndex = currentCart.findIndex((item: any) => item.id === product.id);

    if (existingIndex > -1) {
      currentCart[existingIndex].quantity += 1;
    } else {
      currentCart.push({ ...product, imageUrl: currentImageUrl, quantity: 1 });
    }

    localStorage.setItem('aura_cart', JSON.stringify(currentCart));
    window.dispatchEvent(new Event('cartUpdated'));
    window.location.hash = '/cart';
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const shareData = {
        title: product.name,
        text: `Check out ${product.name} on Snehalata Ecosystem! Price: ৳${product.price}`,
        url: window.location.href
    };

    if (navigator.share) {
        try {
            await navigator.share(shareData);
        } catch (err) {
            console.error("Share cancelled/failed", err);
        }
    } else {
        navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        alert("Product info copied to clipboard");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsAdded(false);
    setQuantity(1);
  };

  const convertUrlToBase64 = async (url: string): Promise<string> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleApplyStyle = async (presetPrompt: string) => {
    setIsRefining(true);
    setIsRefineModalOpen(false);
    try {
      const base64 = await convertUrlToBase64(currentImageUrl);
      const refinedImage = await editAuraImage(presetPrompt, base64);
      if (refinedImage) {
        setCurrentImageUrl(refinedImage);
      }
    } catch (error) {
      console.error("Style refinement failed", error);
    } finally {
      setIsRefining(false);
    }
  };

  const resetImage = () => {
    setCurrentImageUrl(product.imageUrl);
  };

  return (
    <>
      <div className="group space-y-4">
        {/* Image Container */}
        <div 
          onClick={() => setIsModalOpen(true)}
          className="relative aspect-[3/4] rounded-[2.5rem] overflow-hidden bg-white/5 border border-white/5 group-hover:border-aura-purple/40 transition-all duration-500 shadow-xl cursor-pointer"
        >
          <img 
            src={currentImageUrl} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale-[0.2] group-hover:grayscale-0"
          />
          
          {/* Refinement Loading Overlay */}
          {isRefining && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-30 flex flex-col items-center justify-center gap-4">
              <div className="relative">
                <Loader2 className="animate-spin text-aura-purple" size={48} />
                <Sparkles className="absolute inset-0 m-auto text-white animate-pulse" size={16} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Aura Refinement Active</p>
            </div>
          )}

          {/* Quick Action Floating Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-[1px] flex flex-col items-center justify-center gap-4 p-6">
            
             {/* Secondary Actions Row */}
             <div className="flex gap-4 translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-75">
               <button 
                 onClick={handleShare}
                 className="bg-white/10 backdrop-blur-md text-white p-4 rounded-2xl hover:bg-aura-purple hover:text-white transition-all border border-white/10 active:scale-90"
                 title="Share Product"
               >
                  <Share2 size={18} />
               </button>

               <Link 
                 to={`/store/${vendor?.slug || ''}`}
                 className="bg-white/10 backdrop-blur-md text-white p-4 rounded-2xl hover:bg-white hover:text-black transition-all border border-white/10 active:scale-90"
                 title="Visit Store"
               >
                 <Eye size={18} />
               </Link>
             </div>
            
             {/* Primary Actions Column */}
             <div className="w-full space-y-3 translate-y-8 group-hover:translate-y-0 transition-all duration-500 delay-100">
                <button 
                  onClick={handleQuickAdd}
                  className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl flex items-center justify-center gap-3 transition-all ${
                    isQuickAdded 
                      ? 'bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)] scale-105' 
                      : 'bg-white text-black hover:bg-gray-200'
                  }`}
                >
                   {isQuickAdded ? (
                     <>
                       <CheckCircle2 size={16} className="animate-bounce" /> Added
                     </>
                   ) : (
                     <>
                       <ShoppingBag size={16} /> Add to Cart
                     </>
                   )}
                </button>

                <button 
                  onClick={handleFastCheckout}
                  className="w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl flex items-center justify-center gap-3 bg-aura-purple text-white hover:bg-purple-600 active:scale-95 transition-all shadow-aura-purple/20"
                >
                   <Zap size={16} className="fill-current" /> Buy Now
                </button>
             </div>

          </div>

          {/* Top Actions: Try On and Refine */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20 pointer-events-none">
            <button 
              onClick={(e) => { e.stopPropagation(); setIsRefineModalOpen(true); }}
              className="bg-black/60 backdrop-blur-md text-white p-3 rounded-2xl border border-white/10 hover:bg-aura-purple hover:border-aura-purple/50 transition-all active:scale-95 shadow-lg group/btn pointer-events-auto"
              title="Advanced Style Options"
            >
              <Palette size={18} className="group-hover/btn:rotate-12 transition-transform" />
            </button>

            <Link 
              to={`/try-on/${product.id}`}
              className="bg-aura-purple text-white px-5 py-3 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-[0_10px_30px_rgba(124,58,237,0.4)] border border-white/20 hover:scale-105 active:scale-95 transition-all pointer-events-auto"
            >
              <Shirt size={16} /> Virtual Try-On
            </Link>
          </div>
          
          {/* Neural Vision Badge */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 z-20 pointer-events-none">
            <Sparkles size={12} className="text-aura-purple animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest text-white/90">Aura Vision Ready</span>
          </div>
        </div>
        
        {/* Inline Style Presets */}
        <div className="px-1 overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex gap-2 w-max">
             <div className="flex items-center gap-2 pr-2 border-r border-white/10 mr-2">
               <Wand2 size={12} className="text-aura-purple" />
               <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Quick FX</span>
             </div>
             {STYLE_PRESETS.map((preset) => (
               <button
                 key={preset.id}
                 onClick={(e) => {
                   e.preventDefault();
                   handleApplyStyle(preset.prompt);
                 }}
                 disabled={isRefining}
                 className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-aura-purple hover:border-aura-purple hover:text-white transition-all text-[9px] uppercase font-bold tracking-wider whitespace-nowrap active:scale-95"
               >
                 <span>{preset.icon}</span>
                 <span>{preset.name}</span>
               </button>
             ))}
             {currentImageUrl !== product.imageUrl && (
                <button
                  onClick={(e) => {
                      e.preventDefault();
                      resetImage();
                  }}
                  className="px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all text-[9px] uppercase font-bold tracking-wider whitespace-nowrap flex items-center gap-1 active:scale-95"
                >
                  <RefreshCcw size={10} /> Reset
                </button>
             )}
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-4 px-3">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-2xl font-bold text-white group-hover:text-aura-purple transition-colors bn-heavy truncate mb-1">{product.name}</h3>
              {vendor && (
                <Link to={`/store/${vendor.slug}`} className="text-[11px] text-gray-500 uppercase tracking-[0.2em] block hover:text-white transition-colors font-black">
                  {vendor.name}
                </Link>
              )}
            </div>
            <div className="text-2xl font-black text-white tabular-nums tracking-tighter">৳{product.price.toLocaleString()}</div>
          </div>
          <p className="text-gray-500 text-sm line-clamp-2 font-light leading-relaxed">{product.description}</p>
        </div>
      </div>

      {/* Style Refinement Modal (Advanced) */}
      {isRefineModalOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="relative w-full max-w-lg bg-aura-glass border border-aura-glassBorder rounded-[3rem] p-1 shadow-2xl overflow-hidden animate-in zoom-in duration-500">
            <div className="bg-black/40 backdrop-blur-3xl rounded-[2.9rem] p-10 md:p-12 relative z-10">
              <button 
                onClick={() => setIsRefineModalOpen(false)}
                className="absolute top-8 right-8 p-3 text-gray-500 hover:text-white hover:bg-white/5 rounded-2xl transition-all"
              >
                <X size={24} />
              </button>

              <div className="text-center mb-10">
                <div className="w-16 h-16 bg-aura-purple/10 border border-aura-purple/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Palette className="text-aura-purple" size={32} />
                </div>
                <h2 className="text-2xl font-serif font-black text-white mb-2">Refine Style</h2>
                <p className="text-gray-500 text-xs uppercase tracking-widest font-black">Choose an AI-Powered Aesthetic Preset</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {STYLE_PRESETS.map((preset) => (
                  <button 
                    key={preset.id}
                    onClick={() => handleApplyStyle(preset.prompt)}
                    className="group relative flex flex-col items-center justify-center p-6 bg-white/5 border border-white/10 rounded-3xl hover:border-aura-purple hover:bg-aura-purple/5 transition-all active:scale-95"
                  >
                    <span className="text-3xl mb-3 group-hover:scale-125 transition-transform">{preset.icon}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white">{preset.name}</span>
                    <div className="absolute inset-0 bg-aura-purple/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>

              <p className="text-[9px] text-center text-gray-600 mt-10 uppercase tracking-[0.3em] font-black">
                Powered by Aura Vision Generative Engine
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-500">
          <div className="relative w-full max-w-lg bg-aura-glass border border-aura-glassBorder rounded-[3.5rem] p-1 shadow-[0_0_100px_rgba(124,58,237,0.15)] overflow-hidden animate-in zoom-in duration-500">
            <div className="bg-black/40 backdrop-blur-3xl rounded-[3.4rem] p-10 md:p-12 relative z-10">
              <button 
                onClick={closeModal}
                className="absolute top-8 right-8 p-3 text-gray-500 hover:text-white hover:bg-white/5 rounded-2xl transition-all"
              >
                <X size={24} />
              </button>

              {isAdded ? (
                <div className="text-center py-12 space-y-8 animate-in zoom-in">
                  <div className="w-24 h-24 bg-green-500/10 border border-green-500/20 rounded-[2.5rem] flex items-center justify-center mx-auto mb-4 relative">
                    <div className="absolute inset-0 bg-green-500/20 blur-2xl animate-pulse" />
                    <CheckCircle2 size={48} className="text-green-400 relative z-10" />
                  </div>
                  <h2 className="text-3xl font-serif font-black text-white">Added to Hub</h2>
                  <p className="text-gray-400 text-sm">Aura is synchronizing your selection...</p>
                </div>
              ) : (
                <div className="space-y-10">
                  <header className="flex items-center gap-8">
                    <div className="w-28 h-28 rounded-3xl overflow-hidden border border-white/10 shrink-0 shadow-2xl">
                      <img src={currentImageUrl} className="w-full h-full object-cover" alt={product.name} />
                    </div>
                    <div>
                      <h2 className="text-3xl font-serif font-bold text-white mb-2">{product.name}</h2>
                      <div className="text-aura-purple font-black text-2xl tracking-tighter">৳{product.price.toLocaleString()}</div>
                    </div>
                  </header>

                  <div className="space-y-5">
                    <label className="text-[11px] text-gray-500 font-black uppercase tracking-[0.3em] px-2">Quantity Allocation</label>
                    <div className="flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-[2rem]">
                      <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-4 bg-white/5 hover:bg-white hover:text-black rounded-2xl transition-all text-white"
                      >
                        <Minus size={22} />
                      </button>
                      <span className="text-3xl font-black text-white tabular-nums">{quantity}</span>
                      <button 
                        onClick={() => setQuantity(quantity + 1)}
                        className="p-4 bg-white/5 hover:bg-white hover:text-black rounded-2xl transition-all text-white"
                      >
                        <Plus size={22} />
                      </button>
                    </div>
                  </div>

                  <div className="pt-6 grid grid-cols-2 gap-6">
                    <button 
                      onClick={closeModal}
                      className="py-6 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-white transition-all border border-transparent hover:border-white/10"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleAddToCartModal}
                      className="bg-white text-black py-6 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-aura-purple hover:text-white transition-all shadow-2xl active:scale-95"
                    >
                      <ShoppingBag size={18} /> Confirm Order
                    </button>
                  </div>

                  <p className="text-[10px] text-center text-gray-600 uppercase tracking-[0.3em] font-black flex items-center justify-center gap-3">
                    <ShieldCheck size={14} className="text-aura-purple" /> Secure Neural Transaction
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};