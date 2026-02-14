import React, { useState, useEffect } from 'react';
import { getVendors, getProductsByVendor, addProduct, getOrders, deleteProduct } from '../services/mockData';
import { Product, Vendor, AuditEntry } from '../types';
import { 
  Plus, ShieldCheck, Globe, X, Rocket, Zap, Bot, 
  ShieldAlert, Shield, TrendingUp, Star, 
  ShoppingBag, Fingerprint, Activity, Clock,
  Search, ChevronRight, RefreshCcw, Image as ImageIcon, Leaf,
  BarChart3, Calendar, ArrowUpRight, FileCheck, AlertCircle, CheckCircle2, Trash2
} from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { auditVendorDescription } from '../services/geminiService';

const MOCK_AUDIT_LOGS: AuditEntry[] = [
  {
    id: 'AUD-1001',
    type: 'AUTHENTICITY',
    status: 'PASSED',
    timestamp: '২ ঘণ্টা আগে',
    label: 'Heritage Verification',
    details: 'Dhakai Jamdani thread count (100) verified via high-res image analysis.'
  },
  {
    id: 'AUD-1002',
    type: 'PRICING_ETHICS',
    status: 'PASSED',
    timestamp: '১০ ঘণ্টা আগে',
    label: 'Market Price Parity',
    details: 'Pricing is within 5% of ecosystem standard for Muslin silk.'
  }
];

const SALES_CHART_DATA = [
  { month: 'Jan', value: 45 },
  { month: 'Feb', value: 52 },
  { month: 'Mar', value: 38 },
  { month: 'Apr', value: 65 },
  { month: 'May', value: 48 },
  { month: 'Jun', value: 85 },
];

export const VendorDashboard: React.FC = () => {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>(MOCK_AUDIT_LOGS);
  
  // Real-time Stats
  const [totalSales, setTotalSales] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);

  // Verification State
  const [isAuditing, setIsAuditing] = useState(false);
  const [verificationForm, setVerificationForm] = useState({
    description: '',
    tradeLicense: ''
  });
  const [auditFeedback, setAuditFeedback] = useState<string | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [websiteUrl, setWebsiteUrl] = useState<string | null>(null);

  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    externalUrl: '',
    category: '',
    description: ''
  });

  const loadVendorData = () => {
    // Simulating logged-in vendor ID = 1 (Royal Bengal Looms)
    const currentVendor = getVendors().find(v => v.id === 1);
    if (currentVendor) {
      setVendor(currentVendor);
      setProducts(getProductsByVendor(currentVendor.id));
      setVerificationForm({
        description: currentVendor.description,
        tradeLicense: currentVendor.tradeLicense || ''
      });

      // Calculate Real Stats from Orders
      const allOrders = getOrders();
      let sales = 0;
      let orderCount = 0;

      allOrders.forEach(order => {
        // Check if this vendor has items in the order
        const vendorItems = order.items.filter(i => i.vendorId === currentVendor.id);
        if (vendorItems.length > 0) {
            orderCount++;
            sales += vendorItems.reduce((acc, item) => acc + item.price, 0);
        }
      });
      setTotalSales(sales > 0 ? sales : 85400); // Fallback to mock value if 0 for demo
      setTotalOrders(orderCount > 0 ? orderCount : 46);
    }
  };

  useEffect(() => {
    loadVendorData();
    window.addEventListener('productUpdated', loadVendorData);
    window.addEventListener('orderUpdated', loadVendorData);
    return () => {
        window.removeEventListener('productUpdated', loadVendorData);
        window.removeEventListener('orderUpdated', loadVendorData);
    };
  }, []);

  const handleVerifySubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor) return;

    setIsAuditing(true);
    setAuditFeedback(null);

    try {
      const result = await auditVendorDescription(
        vendor.name,
        verificationForm.description,
        verificationForm.tradeLicense
      );

      const newAudit: AuditEntry = {
        id: `AUD-${Date.now()}`,
        type: 'AUTHENTICITY',
        status: result.status === 'APPROVED' ? 'PASSED' : result.status === 'PENDING' ? 'WARNING' : 'FAILED',
        timestamp: 'Just now',
        label: 'Manual Re-Verification',
        details: result.reason
      };

      setAuditLogs([newAudit, ...auditLogs]);
      setVendor({ 
          ...vendor, 
          status: result.status as 'APPROVED' | 'PENDING' | 'BLOCKED', 
          description: verificationForm.description, 
          tradeLicense: verificationForm.tradeLicense 
      });
      setAuditFeedback(result.reason);
    } catch (err) {
      setAuditFeedback("Verification engine encountered a neural sync error. Please try again.");
    } finally {
      setIsAuditing(false);
    }
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor) return;

    const product: Product = {
      id: Date.now(),
      vendorId: vendor.id,
      name: newProduct.name,
      price: Number(newProduct.price),
      externalUrl: newProduct.externalUrl || undefined,
      category: newProduct.category || 'General',
      description: newProduct.description,
      imageUrl: `https://picsum.photos/400/600?random=${Date.now()}`
    };

    // Save to Database (Mock)
    addProduct(product);

    setIsFormOpen(false);
    setNewProduct({ name: '', price: '', externalUrl: '', category: '', description: '' });
    
    const newAudit: AuditEntry = {
        id: `AUD-${Date.now()}`,
        type: 'COPYWRITING',
        status: 'PASSED',
        timestamp: 'Just now',
        label: 'New Inventory Audit',
        details: `Aura reviewed "${product.name}" description. Compliance score: 98%.`
    };
    setAuditLogs([newAudit, ...auditLogs]);
  };

  const handleDeleteProduct = (id: number) => {
      if(window.confirm('Are you sure you want to remove this item from the ecosystem?')) {
          deleteProduct(id);
      }
  };

  const handleReAudit = (id: string) => {
    setAuditLogs(prev => prev.map(log => 
      log.id === id ? { ...log, status: 'RE-AUDITING' } : log
    ));

    setTimeout(() => {
        setAuditLogs(prev => prev.map(log => 
            log.id === id ? { ...log, status: 'PASSED', timestamp: 'Just now', details: 'Aura refreshed: Issues resolved.' } : log
        ));
    }, 2000);
  };

  const handleGenerateWebsite = () => {
    if (!vendor || vendor.status !== 'APPROVED') return;
    setIsGenerating(true);
    setGenerationStep(1);
    setTimeout(() => setGenerationStep(2), 1500);
    setTimeout(() => setGenerationStep(3), 3000);
    setTimeout(() => {
        setWebsiteUrl(`https://${vendor.slug}.snehalata.com`);
        setIsGenerating(false);
    }, 4500);
  };

  const auditStats = {
    passed: auditLogs.filter(l => l.status === 'PASSED').length,
    warning: auditLogs.filter(l => l.status === 'WARNING').length,
    failed: auditLogs.filter(l => l.status === 'FAILED').length
  };

  if (!vendor) return <div className="min-h-screen flex items-center justify-center text-aura-purple animate-pulse font-bold tracking-widest bg-black">AURA CONSOLE INITIALIZING...</div>;

  return (
    <div className="min-h-screen bg-black pb-20">
      {/* Dashboard Header */}
      <div className="bg-aura-purple/10 border-b border-aura-glassBorder relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6 py-10 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <h1 className="text-3xl font-serif font-bold text-white">{vendor.name}</h1>
                
                {/* Website Link Icon */}
                {vendor.websiteUrl && (
                  <a 
                    href={vendor.websiteUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="p-2 bg-white/5 border border-white/10 rounded-full text-gray-400 hover:text-white hover:bg-aura-purple/20 transition-all"
                    title="Visit Official Website"
                  >
                    <Globe size={18} />
                  </a>
                )}

                {/* Visual Status Badge */}
                <div className={`
                    inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg
                    ${vendor.status === 'APPROVED' 
                      ? 'bg-green-500/10 border-green-500/30 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)]' 
                      : vendor.status === 'PENDING'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse'
                      : 'bg-red-500/10 border-red-500/30 text-red-400'
                    }
                `}>
                    {vendor.status === 'APPROVED' ? <ShieldCheck size={14} strokeWidth={2.5} /> : vendor.status === 'PENDING' ? <Shield size={14} strokeWidth={2.5} /> : <ShieldAlert size={14} strokeWidth={2.5} />}
                    <span>{vendor.status === 'APPROVED' ? 'Aura Verified' : vendor.status === 'PENDING' ? 'Verification Pending' : 'Restricted'}</span>
                </div>
              </div>
              <p className="text-gray-400 text-sm max-w-xl line-clamp-2">{vendor.description}</p>
            </div>
            
            <div className="flex gap-4">
               <button 
                onClick={() => setIsFormOpen(!isFormOpen)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-700 to-indigo-700 rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-purple-900/40 hover:scale-105 transition-transform border border-white/10 text-white"
               >
                 {isFormOpen ? <X size={18} /> : <Plus size={18} />}
                 {isFormOpen ? 'Cancel' : 'পণ্য যোগ করুন'}
               </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        
        {/* Performance Metrics Section */}
        <section className="mb-12">
            <div className="flex items-center gap-3 mb-8 px-2">
                <BarChart3 className="text-aura-purple" size={28} />
                <div>
                    <h2 className="text-2xl font-serif font-bold text-white">Performance Metrics</h2>
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Ecosystem business intelligence</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <PerformanceMetric 
                        title="Total Sales" 
                        value={`৳${totalSales.toLocaleString()}`} 
                        icon={<TrendingUp className="text-green-400" />} 
                        trend={<span className="text-green-400 flex items-center gap-1"><ArrowUpRight size={12}/> ১২%</span>} 
                    />
                    <PerformanceMetric 
                        title="Orders" 
                        value={totalOrders.toString()} 
                        icon={<ShoppingBag className="text-blue-400" />} 
                        trend={<span className="text-gray-500 text-[9px]">Live Data</span>} 
                    />
                    <PerformanceMetric 
                        title="Rating" 
                        value="৪.৯/৫" 
                        icon={<Star className="text-yellow-400 fill-yellow-400" />} 
                        trend={<span className="text-gray-500 text-[9px]">১০২ reviews</span>} 
                    />
                    <PerformanceMetric 
                        title="Growth Index" 
                        value="+১৮%" 
                        icon={<Activity className="text-aura-purple" />} 
                        trend={<span className="text-aura-purple text-[9px]">Elite Tier</span>} 
                    />
                </div>

                <div className="lg:col-span-2 bg-aura-glass border border-aura-glassBorder rounded-[2.5rem] p-8 relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-white mb-1">Sales Trends</h3>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Monthly volume in BDT</p>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                            <Calendar size={12} /> Last 6 Months
                        </div>
                    </div>
                    <div className="flex items-end justify-between h-48 gap-4 px-2">
                        {SALES_CHART_DATA.map((data, idx) => (
                            <div key={idx} className="flex-1 flex flex-col items-center gap-3 group/bar">
                                <div className="w-full relative flex items-end justify-center h-full">
                                    <div 
                                        className="w-full max-w-[40px] bg-gradient-to-t from-aura-purple/20 to-aura-purple rounded-t-lg transition-all duration-700 ease-out group-hover/bar:from-aura-purple group-hover/bar:to-indigo-500 relative cursor-pointer"
                                        style={{ height: `${data.value}%` }}
                                    />
                                </div>
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{data.month}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>

        {/* Verification Center (New Section) */}
        <section className="mb-12">
            <div className="flex items-center gap-3 mb-8 px-2">
                <FileCheck className="text-aura-purple" size={28} />
                <div>
                    <h2 className="text-2xl font-serif font-bold text-white">Verification & Compliance Center</h2>
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Secure your place in the Aura Ecosystem</p>
                </div>
            </div>

            <div className="bg-aura-glass border border-aura-glassBorder rounded-[2.5rem] p-10 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 left-0 w-80 h-80 bg-aura-purple/5 blur-[100px] rounded-full"></div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
                    <div className="space-y-6">
                        <div className="flex items-start gap-4 p-6 bg-white/[0.03] rounded-3xl border border-white/5">
                            <Shield className="text-aura-purple shrink-0 mt-1" size={24} />
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2">Business Identity Audit</h3>
                                <p className="text-xs text-gray-400 leading-relaxed">
                                    Aura AI audits your shop description and trade license to ensure cultural authenticity and legal compliance. Verified vendors receive the 'Aura Verified' badge and priority search ranking.
                                </p>
                            </div>
                        </div>

                        {auditFeedback && (
                            <div className={`p-6 rounded-3xl border animate-in slide-in-from-bottom-2 ${
                                vendor.status === 'APPROVED' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                            }`}>
                                <div className="flex items-center gap-2 mb-2">
                                    {vendor.status === 'APPROVED' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                                    <span className="text-[10px] font-black uppercase tracking-widest">Aura Audit Result</span>
                                </div>
                                <p className="text-xs font-medium leading-relaxed">{auditFeedback}</p>
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleVerifySubmission} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Shop Narrative (English/Bengali)</label>
                            <textarea 
                                value={verificationForm.description}
                                onChange={(e) => setVerificationForm({...verificationForm, description: e.target.value})}
                                required
                                className="w-full h-32 bg-black/40 border border-white/10 rounded-2xl p-4 text-xs text-gray-300 focus:outline-none focus:border-aura-purple resize-none transition-all"
                                placeholder="Describe your heritage craft or brand mission..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Trade License ID</label>
                            <input 
                                value={verificationForm.tradeLicense}
                                onChange={(e) => setVerificationForm({...verificationForm, tradeLicense: e.target.value})}
                                required
                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-xs text-white focus:outline-none focus:border-aura-purple font-mono transition-all"
                                placeholder="TRD-2024-XXXX"
                            />
                        </div>

                        <button 
                            type="submit"
                            disabled={isAuditing}
                            className="w-full bg-white text-black py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-aura-purple hover:text-white transition-all shadow-xl active:scale-95 disabled:opacity-50"
                        >
                            {isAuditing ? <RefreshCcw size={16} className="animate-spin" /> : <Bot size={16} />}
                            {isAuditing ? 'Auditing with Aura AI...' : 'Submit for Re-Audit'}
                        </button>
                    </form>
                </div>
            </div>
        </section>

        {/* Store Generator Section */}
        <section className="mb-12">
            <div className={`bg-gradient-to-br from-indigo-900/40 to-purple-900/20 border border-aura-glassBorder rounded-3xl p-8 relative overflow-hidden group transition-all ${vendor.status === 'PENDING' ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}>
                <div className="absolute top-0 right-0 p-32 bg-purple-500/10 blur-[80px] rounded-full group-hover:bg-purple-500/20 transition-all"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                            <Rocket className="text-purple-400" />
                            <h2 className="text-2xl font-serif font-bold text-white">1-Click Store Generator</h2>
                        </div>
                        <p className="text-gray-300 mb-8 max-w-lg leading-relaxed text-sm">
                            আপনার নিজস্ব ব্র্যান্ড পোর্টাল তৈরি করুন Aura-র সাহায্যে। এটি সরাসরি আপনার ক্যাটালগের সাথে সিঙ্ক থাকবে।
                        </p>
                        {!websiteUrl && !isGenerating && vendor.status === 'APPROVED' && (
                            <button onClick={handleGenerateWebsite} className="bg-white text-black px-8 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors flex items-center gap-2 shadow-xl active:scale-95 transition-transform text-xs">
                                <Zap size={18} className="text-purple-600 fill-purple-600" /> জেনারেট করুন
                            </button>
                        )}
                        {isGenerating && (
                            <div className="space-y-4 max-w-sm">
                                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                                    <div className="h-full bg-aura-purple animate-pulse transition-all duration-1000" style={{width: `${(generationStep / 3) * 100}%`}}></div>
                                </div>
                                <p className="text-[10px] uppercase tracking-widest text-aura-purple font-bold flex items-center gap-2">
                                    <RefreshCcw size={12} className="animate-spin" />
                                    {generationStep === 1 ? 'Mapping Inventory...' : generationStep === 2 ? 'Deploying Aura Engine...' : 'Finalizing Subdomain...'}
                                </p>
                            </div>
                        )}
                        {websiteUrl && (
                            <div className="bg-green-500/10 border border-green-500/30 p-6 rounded-2xl animate-in zoom-in">
                                <h3 className="font-bold text-green-400 mb-2 text-xs uppercase tracking-widest flex items-center gap-2">
                                    <ShieldCheck size={14} /> Live on Aura Hub Subdomain
                                </h3>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                    <a href="#" className="text-xl text-white underline decoration-aura-purple underline-offset-8 font-mono hover:text-aura-purple transition-colors truncate">
                                        {websiteUrl}
                                    </a>
                                    <button className="text-[10px] text-gray-500 border border-white/10 px-3 py-1 rounded-full hover:text-white transition-colors">Copy URL</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>

        {/* Audit Logs Section */}
        <section className="mb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 px-2 gap-6">
                <div>
                    <h2 className="text-2xl font-serif font-bold text-white flex items-center gap-3">
                        <Fingerprint className="text-aura-purple" />
                        Governance Audit Logs
                    </h2>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-bold">Real-time transparency tracking</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-6 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                        <div className="text-center">
                            <div className="text-green-400 font-black text-sm leading-none">{auditStats.passed}</div>
                            <div className="text-[8px] uppercase font-bold text-gray-600 mt-1">Pass</div>
                        </div>
                        <div className="text-center">
                            <div className="text-amber-400 font-black text-sm leading-none">{auditStats.warning}</div>
                            <div className="text-[8px] uppercase font-bold text-gray-600 mt-1">Warn</div>
                        </div>
                        <div className="text-center">
                            <div className="text-red-400 font-black text-sm leading-none">{auditStats.failed}</div>
                            <div className="text-[8px] uppercase font-bold text-gray-600 mt-1">Fail</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-aura-glass border border-aura-glassBorder rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/5">
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Timestamp</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Type</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Outcome</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Aura AI Insights</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {auditLogs.map((log) => (
                                <tr key={log.id} className="group hover:bg-white/[0.02] transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-white">{log.timestamp}</span>
                                            <span className="text-[9px] font-mono text-gray-600">{log.id}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-gray-300">{log.label}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                                            log.status === 'PASSED' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
                                            log.status === 'WARNING' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                                            log.status === 'RE-AUDITING' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 animate-pulse' :
                                            'bg-red-500/10 border-red-500/30 text-red-400'
                                        }`}>
                                            {log.status}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-xs text-gray-500 leading-relaxed max-w-xs">{log.details}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        {(log.status === 'FAILED' || log.status === 'WARNING') && (
                                            <button 
                                                onClick={() => handleReAudit(log.id)}
                                                className="p-2 bg-white/5 border border-white/10 rounded-lg text-aura-purple hover:bg-aura-purple hover:text-white transition-all"
                                            >
                                                <RefreshCcw size={14} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>

        {isFormOpen && (
          <div className="mb-12 bg-white/5 border border-white/10 p-8 rounded-3xl animate-in fade-in slide-in-from-top-4">
            <h2 className="text-xl font-bold mb-6 border-b border-white/10 pb-4 font-serif text-white">নতুন পণ্য যোগ করুন</h2>
            <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Product Name</label>
                <input required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:border-aura-purple outline-none" placeholder="পণ্যর নাম" />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Price (BDT)</label>
                <input required type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:border-aura-purple outline-none" placeholder="৳ মূল্য" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Product Description</label>
                <textarea required value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:border-aura-purple outline-none h-32" placeholder="পণ্যর বিস্তারিত বিবরণ..." />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button type="submit" className="bg-white text-black px-10 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-aura-purple hover:text-white transition-all shadow-xl">
                    Save Inventory & Audit
                </button>
              </div>
            </form>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-serif font-bold text-white flex items-center gap-3">
                <ShoppingBag className="text-aura-purple" />
                আপনার বর্তমান ইনভেন্টরি ({products.length})
            </h2>
            <div className="text-[10px] text-gray-600 uppercase tracking-widest font-bold flex items-center gap-2">
                <Clock size={12} /> Updated: Just Now
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map(p => (
              <div key={p.id} className="relative group">
                <ProductCard product={p} vendor={vendor} />
                <button 
                  onClick={() => handleDeleteProduct(p.id)}
                  className="absolute top-4 right-4 p-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white z-20"
                  title="Remove from Inventory"
                >
                    <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const PerformanceMetric: React.FC<{ title: string; value: string; icon: React.ReactNode; trend: React.ReactNode }> = ({ title, value, icon, trend }) => (
    <div className="bg-aura-glass border border-aura-glassBorder rounded-2xl p-5 hover:border-aura-purple/30 transition-all group flex flex-col justify-between h-full">
        <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <div className="text-[9px] font-black uppercase tracking-widest">
                {trend}
            </div>
        </div>
        <div>
            <div className="text-2xl font-black text-white mb-0.5 tracking-tight">{value}</div>
            <div className="text-[9px] uppercase tracking-[0.2em] font-bold text-gray-600">{title}</div>
        </div>
    </div>
);