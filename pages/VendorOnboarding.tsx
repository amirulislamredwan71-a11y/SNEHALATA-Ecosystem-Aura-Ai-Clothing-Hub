import React, { useState } from 'react';
import { auditVendorDescription } from '../services/geminiService';
import { addVendor } from '../services/mockData';
import { 
  ShieldCheck, AlertTriangle, Loader2, Sparkles, Building2, 
  LogIn, FileText, ChevronRight, CheckCircle2, Globe, 
  Wand2, Cpu, Zap, ArrowLeft, LayoutDashboard, Shirt, Check
} from 'lucide-react';
import { Link } from '../components/Navigation';

export const VendorOnboarding: React.FC = () => {
  const [formData, setFormData] = useState({
    ownerName: '',
    shopName: '',
    description: '',
    contact: '',
    tradeLicense: ''
  });
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState<'IDLE' | 'AUDITING' | 'SAVING' | 'SUCCESS' | 'REJECTED' | 'PENDING_HUB'>('IDLE');
  const [auditResult, setAuditResult] = useState<{ status: string; reason: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('AUDITING');

    const audit = await auditVendorDescription(formData.shopName, formData.description, formData.tradeLicense);
    setAuditResult(audit);

    if (audit.status === 'REJECTED') {
        setStatus('REJECTED');
        return;
    }

    setStatus('SAVING');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Save to Backend Mock
    addVendor({
        id: Date.now(),
        name: formData.shopName,
        slug: formData.shopName.toLowerCase().replace(/\s+/g, '-'),
        description: formData.description,
        status: audit.status as 'APPROVED' | 'PENDING',
        tradeLicense: formData.tradeLicense,
        websiteUrl: `https://${formData.shopName.toLowerCase().replace(/\s+/g, '-')}.snehalata.com`
    });

    setStatus('SUCCESS');
  };

  return (
    <div className="min-h-screen bg-aura-black pb-32 pt-12 px-6 relative overflow-hidden">
        {/* Background Atmosphere */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
            <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-aura-purple/5 blur-[120px] rounded-full" />
            <div className="absolute bottom-20 left-0 w-[500px] h-[500px] bg-indigo-900/5 blur-[120px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
            <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-colors text-[10px] font-black uppercase tracking-[0.3em]">
                <ArrowLeft size={14} /> Back to Hub
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                {/* Left Column: Feature Showcase */}
                <div className="space-y-10 lg:sticky lg:top-24">
                    <div>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-aura-purple/10 border border-aura-purple/20 mb-6">
                            <Sparkles size={14} className="text-aura-purple" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-aura-purple">Artisan Revolution v3.0</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-serif font-black text-white mb-6 leading-tight">
                            Scale Your <span className="text-aura-purple">Heritage</span>
                        </h1>
                        <p className="text-gray-400 text-lg leading-relaxed max-w-xl">
                            Join the SNEHALATA ecosystem. Aura AI verifies your authenticity and deploys your digital storefront globally in seconds.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {/* Vendor Console Feature */}
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-aura-purple/50 transition-all group hover:bg-white/[0.07]">
                           <div className="flex items-center gap-4 mb-6">
                              <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-lg">
                                 <LayoutDashboard size={24} />
                              </div>
                              <div>
                                  <h3 className="text-xl font-bold text-white">Vendor Console</h3>
                                  <p className="text-[10px] uppercase tracking-widest text-gray-500 font-black">Admin Command Center</p>
                              </div>
                           </div>
                           <ul className="space-y-3">
                              <FeatureItem text="1-Click Website Generator" />
                              <FeatureItem text="Automatic Subdomain Creation" />
                              <FeatureItem text="Free AI Analytics & Insights" />
                              <FeatureItem text="Automated Inventory Audits" />
                           </ul>
                        </div>

                        {/* Virtual Try-On Feature */}
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-aura-purple/50 transition-all group hover:bg-white/[0.07]">
                           <div className="flex items-center gap-4 mb-6">
                              <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all shadow-lg">
                                 <Shirt size={24} />
                              </div>
                              <div>
                                  <h3 className="text-xl font-bold text-white">Virtual Try-On Engine</h3>
                                  <p className="text-[10px] uppercase tracking-widest text-gray-500 font-black">Neural Style Transfer</p>
                              </div>
                           </div>
                           <ul className="space-y-3">
                              <FeatureItem text="Customer Image Upload Support" />
                              <FeatureItem text="Real-time Neural Processing" />
                              <FeatureItem text="Live Product Overlay Preview" />
                              <FeatureItem text="Interactive Size Guide" />
                           </ul>
                        </div>
                    </div>
                </div>

                {/* Right Column: Registration Form */}
                <div className="bg-aura-glass border border-aura-glassBorder rounded-[3rem] p-1 shadow-2xl overflow-hidden relative group">
                    <div className="absolute -inset-[1px] bg-gradient-to-r from-aura-purple/20 via-transparent to-aura-purple/20 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
                    
                    <div className="bg-aura-black/60 backdrop-blur-3xl rounded-[2.9rem] p-8 md:p-12 relative z-10">
                        {/* Step Progress */}
                        {status !== 'SUCCESS' && status !== 'PENDING_HUB' && status !== 'REJECTED' && (
                             <div className="flex items-center justify-center gap-4 mb-10">
                                {[1, 2].map((s) => (
                                    <React.Fragment key={s}>
                                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-black transition-all duration-500 ${step >= s ? 'bg-aura-purple border-aura-purple text-white shadow-[0_0_20px_rgba(124,58,237,0.3)]' : 'bg-white/5 border-white/10 text-gray-600'}`}>
                                            {step > s ? <CheckCircle2 size={14} /> : s}
                                        </div>
                                        {s < 2 && <div className={`w-12 h-0.5 rounded-full transition-all duration-700 ${step > s ? 'bg-aura-purple' : 'bg-white/5'}`} />}
                                    </React.Fragment>
                                ))}
                            </div>
                        )}

                        {status === 'SUCCESS' ? (
                            <div className="text-center py-10 animate-in zoom-in duration-500">
                                <div className="w-24 h-24 bg-green-500/10 border border-green-500/20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 relative">
                                    <div className="absolute inset-0 bg-green-500 blur-2xl opacity-20 animate-pulse"></div>
                                    <ShieldCheck size={48} className="text-green-400 relative z-10" />
                                </div>
                                <h2 className="text-3xl font-serif font-bold text-white mb-4">Neural Deployment Active</h2>
                                <p className="text-gray-400 text-sm mb-10 max-w-sm mx-auto leading-relaxed">{auditResult?.reason}</p>
                                <Link to="/dashboard" className="bg-white text-black px-12 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] hover:bg-aura-purple hover:text-white transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3 w-fit mx-auto">
                                    Enter Command Center <ChevronRight size={18} />
                                </Link>
                            </div>
                        ) : status === 'PENDING_HUB' ? (
                            <div className="text-center py-10 animate-in zoom-in duration-500">
                                <div className="w-24 h-24 bg-amber-500/10 border border-amber-500/20 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                                    <Loader2 size={48} className="text-amber-400 animate-spin" />
                                </div>
                                <h2 className="text-3xl font-serif font-bold text-white mb-4">Audit in Progress</h2>
                                <div className="bg-amber-500/5 border border-amber-500/10 p-6 rounded-3xl mb-10 max-w-md mx-auto">
                                    <p className="text-xs text-amber-400 leading-relaxed font-bold uppercase tracking-widest mb-2">Aura Insight:</p>
                                    <p className="text-sm text-gray-400 italic">"{auditResult?.reason}"</p>
                                </div>
                                <Link to="/" className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 hover:text-white transition-colors">Return to Neural Hub</Link>
                            </div>
                        ) : status === 'REJECTED' ? (
                            <div className="text-center py-10 animate-in shake duration-500">
                                <div className="w-24 h-24 bg-red-500/10 border border-red-500/20 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                                    <AlertTriangle size={48} className="text-red-400" />
                                </div>
                                <h2 className="text-3xl font-serif font-bold text-red-500 mb-4">Compliance Failed</h2>
                                <p className="text-gray-400 text-sm mb-10 bg-red-500/5 border border-red-500/10 p-6 rounded-3xl italic">"{auditResult?.reason}"</p>
                                <button onClick={() => { setStatus('IDLE'); setStep(1); }} className="bg-white/5 border border-white/10 text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                                    Refine Application
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-10">
                                {step === 1 && (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="p-3 bg-aura-purple/10 rounded-2xl"><Cpu className="text-aura-purple" /></div>
                                            <div>
                                                <h3 className="text-xl font-serif font-bold text-white">Identity Sync</h3>
                                                <p className="text-[10px] uppercase tracking-widest text-gray-500">Step 01: Core Brand Profile</p>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-6">
                                            <InputField label="Artisan Owner" icon={<LogIn size={18} />} value={formData.ownerName} onChange={(v: string) => setFormData({...formData, ownerName: v})} placeholder="Ex: Shafi Ahmed" />
                                            <InputField label="Direct Contact" icon={<Zap size={18} />} value={formData.contact} onChange={(v: string) => setFormData({...formData, contact: v})} placeholder="Ex: +880 17XXX..." />
                                            <InputField label="Brand Name" icon={<Building2 size={18} />} value={formData.shopName} onChange={(v: string) => setFormData({...formData, shopName: v})} placeholder="Ex: Dhakai Muslin Heritage" />
                                        </div>
                                        
                                        <div className="pt-6">
                                            <button type="button" onClick={() => setStep(2)} className="w-full bg-white text-black px-12 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 hover:bg-aura-purple hover:text-white transition-all shadow-xl">
                                                Next Stage <ChevronRight size={18} />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="p-3 bg-aura-purple/10 rounded-2xl"><FileText className="text-aura-purple" /></div>
                                            <div>
                                                <h3 className="text-xl font-serif font-bold text-white">Compliance Protocol</h3>
                                                <p className="text-[10px] uppercase tracking-widest text-gray-500">Step 02: Verification Logic</p>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <InputField label="Trade License Number" icon={<ShieldCheck size={18} />} value={formData.tradeLicense} onChange={(v: string) => setFormData({...formData, tradeLicense: v})} placeholder="Ex: TRD-2024-XXXX" />
                                            <div className="space-y-3">
                                                <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest px-1">Heritage Narrative (Audited by Aura)</label>
                                                <textarea 
                                                    required
                                                    value={formData.description}
                                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                                    className="w-full h-40 bg-black/40 border border-white/10 rounded-2xl p-6 text-sm text-white focus:outline-none focus:border-aura-purple resize-none transition-all placeholder:text-gray-700"
                                                    placeholder="Describe your artisan methods, fabric count, and shop heritage for our AI audit..."
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-6 flex justify-between gap-4">
                                            <button type="button" onClick={() => setStep(1)} className="text-gray-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest px-8 py-4">Back</button>
                                            <button type="submit" disabled={status !== 'IDLE'} className="flex-1 bg-aura-purple text-white px-12 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-2xl disabled:opacity-50">
                                                {status === 'AUDITING' ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
                                                {status === 'AUDITING' ? 'Analyzing Authentication...' : 'Deploy Global Store'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

const InputField = ({ label, icon, value, onChange, placeholder }: any) => (
    <div className="space-y-2">
        <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest px-1">{label}</label>
        <div className="relative group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-aura-purple transition-colors">{icon}</div>
            <input 
                required
                value={value}
                onChange={e => onChange(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-sm text-white focus:outline-none focus:border-aura-purple transition-all placeholder:text-gray-800"
                placeholder={placeholder}
            />
        </div>
    </div>
);

const FeatureItem = ({ text }: { text: string }) => (
    <li className="flex items-center gap-3 text-xs font-bold text-gray-400 uppercase tracking-wide">
        <Check size={14} className="text-aura-purple" />
        {text}
    </li>
);