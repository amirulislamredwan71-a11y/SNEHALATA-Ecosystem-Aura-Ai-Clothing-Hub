import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigation } from './components/Navigation';
import { Home } from './pages/Home';
import { VendorOnboarding } from './pages/VendorOnboarding';
import { OrderTracking } from './pages/OrderTracking';
import { Footer } from './components/Footer';
import { VendorDashboard } from './pages/VendorDashboard';
import { StoreProfile } from './pages/StoreProfile';
import { VirtualTryOn } from './pages/VirtualTryOn';
import { Cart } from './pages/Cart';
import { CEODashboard } from './pages/CEODashboard';
import { LegalDocs } from './pages/LegalDocs';
import { OrderHistory } from './pages/OrderHistory';
import { AuraStudio } from './pages/AuraStudio';
import { ChatAssistant } from './components/ChatAssistant';
import { subscribeToRealtime } from './services/supabaseClient';

/**
 * Snehalata Aura Neural Ecosystem - Root Component
 * রিয়েল-টাইম ডাটা সিঙ্ক্রোনাইজেশন এবং রাউটিং কনফিগারেশন।
 */
export const App: React.FC = () => {
  
  useEffect(() => {
    /**
     * ১. গ্লোবাল রিয়েল-টাইম ডাটা লিসেনার
     * সুপাবেস ডাটাবেসে কোনো পরিবর্তন হলে এটি পুরো অ্যাপে ইভেন্ট পাঠাবে।
     */
    const productSub = subscribeToRealtime('products', (payload) => {
      console.log('Aura Grid: Products Updated', payload);
      window.dispatchEvent(new CustomEvent('aura:products_updated', { detail: payload }));
    });

    const orderSub = subscribeToRealtime('orders', (payload) => {
      console.log('Aura Grid: Orders Updated', payload);
      window.dispatchEvent(new CustomEvent('aura:orders_updated', { detail: payload }));
    });

    const vendorSub = subscribeToRealtime('vendors', (payload) => {
      console.log('Aura Grid: Vendor Status Changed', payload);
      window.dispatchEvent(new CustomEvent('aura:vendors_updated', { detail: payload }));
    });

    // কম্পোনেন্ট আনমাউন্ট হলে কানেকশন বন্ধ করা
    return () => {
      productSub?.unsubscribe();
      orderSub?.unsubscribe();
      vendorSub?.unsubscribe();
    };
  }, []);

  return (
    <Router>
      <div className="min-h-screen flex flex-col relative bg-black selection:bg-aura-purple selection:text-white">
        
        {/* টপ নেভিগেশন বার (ব্র্যান্ড লোগো এবং মেনু) */}
        <Navigation />
        
        {/* মেইন কন্টেন্ট এরিয়া (স্মুথ ট্রানজিশন লোডিং) */}
        <main className="flex-grow pt-16 md:pt-20">
          <Routes>
            {/* হোম ও ল্যান্ডিং পেজ */}
            <Route path="/" element={<Home />} />
            
            {/* ভেন্ডর অনবোর্ডিং ও রেজিস্ট্রেশন */}
            <Route path="/onboarding" element={<VendorOnboarding />} />
            
            {/* অর্ডার ট্র্যাকিং (রিয়েল-টাইম ম্যাপ সাপোর্ট) */}
            <Route path="/tracking" element={<OrderTracking />} />
            <Route path="/tracking/:orderId" element={<OrderTracking />} />
            
            {/* ভেন্ডর ড্যাশবোর্ড ও স্টোর প্রোফাইল */}
            <Route path="/dashboard" element={<VendorDashboard />} />
            <Route path="/store/:slug" element={<StoreProfile />} />
            
            {/* এআই ভার্চুয়াল ট্রাই-অন ও শপিং কার্ট */}
            <Route path="/try-on/:id" element={<VirtualTryOn />} />
            <Route path="/cart" element={<Cart />} />
            
            {/* অ্যাডমিন/সিইও ড্যাশবোর্ড ও আইনি নথিপত্র */}
            <Route path="/ceo-dashboard" element={<CEODashboard />} />
            <Route path="/legal" element={<LegalDocs />} />
            
            {/* ইউজার অর্ডার হিস্ট্রি */}
            <Route path="/orders" element={<OrderHistory />} />
            <Route path="/orders/:orderId" element={<OrderHistory />} />
            
            {/* Aura AI Studio (Image/Video Generation) */}
            <Route path="/studio" element={<AuraStudio />} />
          </Routes>
        </main>

        {/* Aura AI চ্যাট অ্যাসিস্ট্যান্ট (গ্লোবাল ফ্লোটিং বট) */}
        <ChatAssistant />
        
        {/* স্টাইলিশ ফুটার */}
        <Footer />
        
        {/* গ্লোবাল নিউরাল গ্লো ইফেক্ট (CSS এর মাধ্যমে ব্যাকগ্রাউন্ডে থাকে) */}
        <div className="fixed inset-0 pointer-events-none z-[-1] opacity-20 bg-[radial-gradient(circle_at_50%_0%,#7c3aed_0%,transparent_50%)]"></div>
      </div>
    </Router>
  );
};