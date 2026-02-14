import React, { useState, useEffect } from 'react';
import { Link } from '../components/Navigation';
import { ShoppingBag, ArrowLeft, Trash2, ShieldCheck, CreditCard, ChevronRight, Minus, Plus, Sparkles, Zap, Package } from 'lucide-react';
import { Product } from '../types';
import { getAIRecommendations } from '../services/geminiService';
import { getProducts, addOrder } from '../services/mockData';
import { ProductCard } from '../components/ProductCard';
import { PaymentGateway } from '../components/PaymentGateway';
import { OrderReceipt } from '../components/OrderReceipt';

interface CartItem extends Product {
  quantity: number;
}

export const Cart: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any | null>(null);

  useEffect(() => {
    const loadCart = async () => {
      const items = JSON.parse(localStorage.getItem('aura_cart') || '[]');
      setCartItems(items);
      setIsLoading(false);
      
      if (items.length > 0) {
        // Fetch AI recommendations based on cart content
        try {
          const recIds = await getAIRecommendations(items);
          const allProds = getProducts();
          const recs = allProds.filter(p => recIds.includes(p.id));
          // If AI fails or returns empty, just show some random ones as fallback
          if (recs.length === 0) {
            setRecommendations(allProds.filter(p => !items.find((i:any) => i.id === p.id)).slice(0, 3));
          } else {
            setRecommendations(recs);
          }
        } catch (e) {
          console.error("Neural Recommendation Sync Failed", e);
        }
      }
    };

    loadCart();
    window.addEventListener('cartUpdated', loadCart);
    return () => window.removeEventListener('cartUpdated', loadCart);
  }, []);

  const updateQuantity = (id: number, delta: number) => {
    const newCart = cartItems.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    });
    setCartItems(newCart);
    localStorage.setItem('aura_cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const removeItem = (id: number) => {
    const newCart = cartItems.filter(item => item.id !== id);
    setCartItems(newCart);
    localStorage.setItem('aura_cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = cartItems.length > 0 ? 120 : 0;
  const total = subtotal + shipping;

  const handleCheckoutSuccess = () => {
    // Generate a unique Order ID
    const newOrder = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: "Current User",
      totalAmount: total,
      items: cartItems,
      currentStatus: "PLACED" as const, // Ensure type compatibility
      estimatedDelivery: "৩-৫ কার্যদিবস",
      timeline: [
        { status: 'PLACED' as const, label: 'অর্ডার প্লেস করা হয়েছে', timestamp: new Date().toLocaleString(), completed: true, description: "পেমেন্ট সফলভাবে সম্পন্ন হয়েছে।" },
        { status: 'CONFIRMED' as const, label: 'ভেন্ডর কনফার্মেশন', timestamp: '-', completed: false, description: "Waiting for vendor approval" },
        { status: 'QUALITY_CHECK' as const, label: 'Aura কোয়ালিটি চেক', timestamp: '-', completed: false, description: "Pending AI Audit" },
        { status: 'SHIPPED' as const, label: 'শিপিং', timestamp: '-', completed: false, description: "Pending Courier" },
        { status: 'DELIVERED' as const, label: 'ডেলিভারি সম্পন্ন', timestamp: '-', completed: false, description: "Pending Arrival" }
      ]
    };
    
    // Save to Backend Mock
    addOrder(newOrder);

    // Clear cart
    localStorage.removeItem('aura_cart');
    setCartItems([]);
    window.dispatchEvent(new Event('cartUpdated'));
    
    setCompletedOrder(newOrder);
    setShowPayment(false);
  };

  if (completedOrder) {
    return (
      <div className="min-h-screen bg-black pb-20 pt-20 px-6 flex flex-col items-center">
        <div className="max-w-2xl w-full">
           <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4">
              <div className="w-20 h-20 bg-aura-purple/10 border border-aura-purple/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Package className="text-aura-purple" size={32} />
              </div>
              <h1 className="text-4xl font-serif font-black text-white mb-2">Order Confirmed!</h1>
              <p className="text-gray-500 text-[10px] uppercase tracking-[0.4em] font-black">Neural Transaction Reference: {completedOrder.id}</p>
           </div>
           <OrderReceipt order={completedOrder} />
           <div className="mt-12 text-center space-x-4">
              <Link to="/orders" className="inline-flex items-center gap-2 bg-aura-purple text-white px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-xl">
                 Track Order <ChevronRight size={16} />
              </Link>
              <Link to="/" className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-xl">
                 <ArrowLeft size={16} /> Return to Hub
              </Link>
           </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-aura-purple border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-xs">অর্ডার লোড হচ্ছে...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-32 pt-20 selection:bg-aura-purple selection:text-white">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="flex items-center gap-4 mb-16">
          <div className="p-4 bg-aura-purple/10 border border-aura-purple/20 rounded-[2rem]">
            <ShoppingBag className="text-aura-purple" size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-serif font-black text-white leading-none">শপিং ব্যাগ</h1>
            <p className="text-[10px] uppercase tracking-[0.4em] text-gray-500 font-black mt-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-aura-purple rounded-full animate-pulse"></span>
                Aura AI Shield: Enabled
            </p>
          </div>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-32 bg-white/5 border border-dashed border-white/10 rounded-[3rem] animate-in fade-in duration-700">
             <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/5 opacity-40">
                <ShoppingBag size={40} className="text-gray-400" />
             </div>
             <h2 className="text-2xl font-serif font-black text-gray-400 mb-2">আপনার ব্যাগটি খালি</h2>
             <p className="text-gray-600 text-sm mb-12 max-w-sm mx-auto">SNEHALATA ইকোসিস্টেমের এক্সক্লুসিভ কালেকশনগুলো এক্সপ্লোর করতে নীড়ে ফিরে যান।</p>
             <Link to="/" className="inline-flex items-center gap-3 bg-white text-black px-12 py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-aura-purple hover:text-white transition-all shadow-2xl shadow-aura-purple/10">
                শপিং শুরু করুন <ChevronRight size={18} />
             </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-16">
            {/* Items List */}
            <div className="flex-1 space-y-8">
              <div className="space-y-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="bg-aura-glass border border-aura-glassBorder rounded-[2.5rem] p-8 flex flex-col sm:flex-row gap-8 hover:border-aura-purple/30 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-aura-purple/5 blur-[60px] rounded-full pointer-events-none" />
                    <div className="w-full sm:w-40 h-40 rounded-2xl overflow-hidden border border-white/5 shrink-0 bg-black">
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 grayscale-[0.3] group-hover:grayscale-0" />
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-between py-2">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-2xl font-serif font-black text-white mb-2">{item.name}</h3>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black flex items-center gap-2">
                                <Zap size={12} className="text-aura-purple" /> {item.category}
                            </p>
                          </div>
                          <button 
                            onClick={() => removeItem(item.id)}
                            className="p-3 bg-white/5 border border-white/5 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-6">
                        <div className="flex items-center gap-6 bg-black/60 rounded-2xl px-6 py-2 border border-white/5">
                          <button 
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-2 text-gray-400 hover:text-white transition-colors"
                          >
                            <Minus size={20} />
                          </button>
                          <span className="text-xl font-black text-white min-w-[1.5rem] text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-2 text-gray-400 hover:text-white transition-colors"
                          >
                            <Plus size={20} />
                          </button>
                        </div>

                        <div className="text-right">
                          <div className="text-[10px] text-gray-600 uppercase tracking-widest font-black mb-1">Unit Value</div>
                          <div className="text-3xl font-black text-white tabular-nums tracking-tighter">৳{(item.price * item.quantity).toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <Link to="/" className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-aura-purple hover:text-white transition-colors group">
                 <ArrowLeft size={16} className="group-hover:-translate-x-2 transition-transform" /> শপিং চালিয়ে যান
              </Link>

              {/* Related Products Section */}
              {recommendations.length > 0 && (
                <div className="pt-20 animate-in fade-in duration-1000">
                  <div className="flex items-center gap-4 mb-10">
                    <div className="p-3 bg-aura-purple/10 rounded-2xl">
                      <Sparkles className="text-aura-purple animate-pulse" size={20} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-serif font-black text-white">Aura Neural Suggestions</h3>
                      <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Based on your current aesthetic</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {recommendations.map(p => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Summary Panel */}
            <aside className="lg:w-[400px]">
              <div className="bg-aura-glass border border-aura-glassBorder rounded-[3rem] p-10 sticky top-32 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-aura-purple/5 blur-[80px] rounded-full pointer-events-none"></div>
                
                <h3 className="text-2xl font-serif font-bold text-white mb-10 border-b border-white/5 pb-6">Summary</h3>
                
                <div className="space-y-6 mb-12">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-bold uppercase tracking-widest">Subtotal</span>
                    <span className="text-white font-black">৳{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-bold uppercase tracking-widest">Neural Logistics</span>
                    <span className="text-white font-black">৳{shipping.toLocaleString()}</span>
                  </div>
                  <div className="h-px bg-white/5 my-6" />
                  <div className="flex justify-between items-baseline">
                    <span className="text-[11px] uppercase tracking-[0.3em] font-black text-aura-purple">Total Payable</span>
                    <span className="text-4xl font-black text-white tracking-tighter">৳{total.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-4 mb-10">
                   <div className="flex items-center gap-4 p-5 bg-green-500/10 border border-green-500/20 rounded-2xl group transition-all">
                      <ShieldCheck size={20} className="text-green-400" />
                      <div>
                        <p className="text-[10px] font-black text-green-400 uppercase tracking-widest">Aura Protected</p>
                        <p className="text-[9px] text-gray-500 font-bold">Eco-certified product integrity</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4 p-5 bg-white/5 border border-white/10 rounded-2xl group transition-all">
                      <CreditCard size={20} className="text-gray-400 group-hover:text-white" />
                      <div>
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Direct Checkout</p>
                        <p className="text-[9px] text-gray-600 font-bold">Encrypted multi-vendor routing</p>
                      </div>
                   </div>
                </div>

                <button 
                  onClick={() => setShowPayment(true)}
                  className="w-full bg-white text-black py-6 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-aura-purple hover:text-white transition-all shadow-[0_20px_40px_rgba(0,0,0,0.4)] flex items-center justify-center gap-4 active:scale-95 group"
                >
                   অর্ডার কনফার্ম করুন <ChevronRight size={20} className="group-hover:translate-x-2 transition-transform" />
                </button>
                
                <p className="text-[9px] text-center text-gray-700 mt-8 leading-relaxed font-bold uppercase tracking-widest">
                   Governance v3.1 Compliant • Neural Secured
                </p>
              </div>
            </aside>
          </div>
        )}

      </div>

      {showPayment && (
        <PaymentGateway 
          amount={total} 
          onSuccess={handleCheckoutSuccess} 
          onClose={() => setShowPayment(false)} 
        />
      )}
    </div>
  );
};