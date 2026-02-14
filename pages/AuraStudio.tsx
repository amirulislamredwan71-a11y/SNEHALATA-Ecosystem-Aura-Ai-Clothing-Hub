
import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Video, Image as ImageIcon, Brain, Search, MapPin, 
  Volume2, Loader2, Play, Download, Maximize2, Layers, Zap, X, Send, ShieldAlert
} from 'lucide-react';
import { 
  generateAuraVideo, generateAuraProImage, generateAuraSpeech, 
  searchGroundedAura, mapsGroundedAura, complexThinkingAura 
} from '../services/geminiService';

export const AuraStudio: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'VIDEO' | 'IMAGE' | 'THINK' | 'SEARCH' | 'MAPS'>('IMAGE');
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [videoRatio, setVideoRatio] = useState<'16:9' | '9:16'>('16:9');
  
  // Track API key selection status for high-end models (Veo, Pro Image)
  const [isKeySelected, setIsKeySelected] = useState<boolean | null>(null);

  useEffect(() => {
    // Initial check for selected API key as required by the Veo/Pro image model guidelines
    const checkKeySelection = async () => {
      if ((window as any).aistudio?.hasSelectedApiKey) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        setIsKeySelected(hasKey);
      }
    };
    checkKeySelection();
  }, []);

  const handleOpenKeySelection = async () => {
    if ((window as any).aistudio?.openSelectKey) {
      await (window as any).aistudio.openSelectKey();
      // Assume success immediately after opening to avoid race conditions per guidelines
      setIsKeySelected(true);
    }
  };

  const handleRun = async () => {
    if (!prompt.trim() || isProcessing) return;
    
    // Check for required API key selection before calling Veo or Pro Image models
    if (activeTool === 'VIDEO' || activeTool === 'IMAGE') {
      if (isKeySelected === false) {
        await handleOpenKeySelection();
        return;
      }
    }

    setIsProcessing(true);
    setResult(null);

    try {
      switch (activeTool) {
        case 'IMAGE':
          const img = await generateAuraProImage(prompt, imageSize);
          setResult({ type: 'IMAGE', url: img });
          break;
        case 'VIDEO':
          const vidUrl = await generateAuraVideo(prompt, videoRatio);
          setResult({ type: 'VIDEO', url: vidUrl });
          break;
        case 'THINK':
          const thought = await complexThinkingAura(prompt);
          setResult({ type: 'TEXT', content: thought });
          break;
        case 'SEARCH':
          const searchData = await searchGroundedAura(prompt);
          setResult({ type: 'GROUNDED', ...searchData });
          break;
        case 'MAPS':
          navigator.geolocation.getCurrentPosition(async (pos) => {
            const mapsData = await mapsGroundedAura(prompt, pos.coords.latitude, pos.coords.longitude);
            setResult({ type: 'GROUNDED', ...mapsData });
          }, async () => {
            const mapsData = await mapsGroundedAura(prompt);
            setResult({ type: 'GROUNDED', ...mapsData });
          });
          break;
      }
    } catch (error: any) {
      console.error(error);
      // Reset key selection if the request fails due to missing project/key entities
      if (error?.message?.includes('Requested entity was not found.')) {
        setIsKeySelected(false);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const playTTS = async (text: string) => {
    const base64 = await generateAuraSpeech(text);
    if (base64) {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const dataInt16 = new Int16Array(bytes.buffer);
        const buffer = audioCtx.createBuffer(1, dataInt16.length, 24000);
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtx.destination);
        source.start();
    }
  };

  return (
    <div className="min-h-screen bg-aura-black pb-20 pt-10 px-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-aura-purple/10 border border-aura-purple/20 mb-6">
            <Sparkles size={14} className="text-aura-purple" />
            <span className="text-[10px] font-black uppercase tracking-widest text-aura-purple">Neural Creative Hub</span>
          </div>
          <h1 className="text-5xl font-serif font-black text-white mb-4">Aura Studio</h1>
          <p className="text-gray-500 max-w-xl mx-auto">Access the world's most advanced AI models for ecosystem growth. Veo videos, Pro images, and Grounded Intelligence.</p>
        </header>

        {/* API Key Selection UI for high-end models */}
        {isKeySelected === false && (activeTool === 'VIDEO' || activeTool === 'IMAGE') && (
           <div className="mb-12 p-8 bg-aura-purple/5 border border-aura-purple/20 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 animate-in slide-in-from-top-4">
              <div className="flex items-center gap-5">
                 <div className="p-4 bg-aura-purple/10 rounded-2xl shadow-inner"><ShieldAlert className="text-aura-purple" /></div>
                 <div>
                    <h3 className="text-xl font-bold text-white mb-1">Select a Paid API Key</h3>
                    <p className="text-xs text-gray-500 max-w-sm">Generating video with Veo or high-res images with Pro 3.0 requires a billing-enabled project key.</p>
                 </div>
              </div>
              <div className="flex items-center gap-6">
                 <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-white transition-colors">Billing info</a>
                 <button onClick={handleOpenKeySelection} className="bg-white text-black px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-aura-purple hover:text-white transition-all shadow-xl shadow-aura-purple/20">Select Key</button>
              </div>
           </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Tool Selector */}
          <aside className="space-y-3">
            <ToolTab active={activeTool === 'IMAGE'} icon={<ImageIcon />} label="Neural Image Pro" onClick={() => setActiveTool('IMAGE')} sub="Pro 3.0 • Up to 4K" />
            <ToolTab active={activeTool === 'VIDEO'} icon={<Video />} label="Cinematic Video" onClick={() => setActiveTool('VIDEO')} sub="Veo 3.1 • HD Motion" />
            <ToolTab active={activeTool === 'THINK'} icon={<Brain />} label="Thinking Mode" onClick={() => setActiveTool('THINK')} sub="Pro 3.0 • Logic Max" />
            <ToolTab active={activeTool === 'SEARCH'} icon={<Search />} label="Search Grounding" onClick={() => setActiveTool('SEARCH')} sub="Flash 3.0 • Live Web" />
            <ToolTab active={activeTool === 'MAPS'} icon={<MapPin />} label="Maps Grounding" onClick={() => setActiveTool('MAPS')} sub="Flash 2.5 • Geodata" />
          </aside>

          {/* Canvas Area */}
          <main className="lg:col-span-3 space-y-8">
            <div className="bg-aura-glass border border-aura-glassBorder rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-aura-purple/5 blur-[100px] pointer-events-none" />
              
              <div className="relative z-10 space-y-6">
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={
                    activeTool === 'IMAGE' ? "A hyper-realistic Dhakai Jamdani loom with cinematic lighting..." :
                    activeTool === 'VIDEO' ? "A drone shot over the busy streets of Dhaka at night..." :
                    "Type your complex query or creative prompt here..."
                  }
                  className="w-full h-32 bg-black/40 border border-white/10 rounded-2xl p-6 text-sm text-white focus:outline-none focus:border-aura-purple transition-all placeholder:text-gray-700 resize-none"
                />

                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex gap-4">
                    {activeTool === 'IMAGE' && (
                      <div className="flex gap-2">
                        {['1K', '2K', '4K'].map((s: any) => (
                          <button key={s} onClick={() => setImageSize(s)} className={`px-4 py-2 rounded-xl text-[10px] font-bold border transition-all ${imageSize === s ? 'bg-aura-purple border-aura-purple text-white' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                    {activeTool === 'VIDEO' && (
                      <div className="flex gap-2">
                        {['16:9', '9:16'].map((r: any) => (
                          <button key={r} onClick={() => setVideoRatio(r)} className={`px-4 py-2 rounded-xl text-[10px] font-bold border transition-all ${videoRatio === r ? 'bg-aura-purple border-aura-purple text-white' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                            {r}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={handleRun}
                    disabled={isProcessing}
                    className="bg-white text-black px-10 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center gap-3 hover:bg-aura-purple hover:text-white transition-all shadow-xl disabled:opacity-50"
                  >
                    {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                    {isProcessing ? 'Synthesizing...' : 'Generate with Aura'}
                  </button>
                </div>
              </div>
            </div>

            {/* Results Area */}
            <div className="bg-aura-glass border border-aura-glassBorder rounded-[2.5rem] min-h-[400px] flex items-center justify-center relative overflow-hidden">
               {isProcessing ? (
                 <div className="flex flex-col items-center gap-6 animate-pulse">
                    <div className="w-16 h-16 border-4 border-aura-purple border-t-transparent rounded-full animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-aura-purple">Aura is thinking deeply...</p>
                 </div>
               ) : result ? (
                 <div className="w-full h-full p-6">
                    {result.type === 'IMAGE' && (
                      <div className="group relative rounded-3xl overflow-hidden shadow-2xl">
                        <img src={result.url} className="w-full h-auto object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                           <button className="p-4 bg-white text-black rounded-full hover:scale-110 transition-transform"><Download size={20} /></button>
                           <button className="p-4 bg-white text-black rounded-full hover:scale-110 transition-transform"><Maximize2 size={20} /></button>
                        </div>
                      </div>
                    )}
                    {result.type === 'VIDEO' && (
                      <div className="rounded-3xl overflow-hidden shadow-2xl bg-black aspect-video">
                        <video src={result.url} controls className="w-full h-full" autoPlay loop muted />
                      </div>
                    )}
                    {result.type === 'TEXT' && (
                      <div className="p-10 text-gray-200 leading-relaxed font-light whitespace-pre-wrap text-lg animate-in fade-in slide-in-from-bottom-4">
                         {result.content}
                         <button onClick={() => playTTS(result.content)} className="mt-8 flex items-center gap-2 px-6 py-3 bg-aura-purple text-white rounded-xl text-xs font-bold uppercase tracking-widest"><Volume2 size={16} /> Listen to Aura</button>
                      </div>
                    )}
                    {result.type === 'GROUNDED' && (
                        <div className="space-y-8 animate-in fade-in">
                            <div className="p-10 bg-white/[0.02] rounded-[2rem] border border-white/5 text-gray-300 leading-relaxed text-lg">
                                {result.text}
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-[10px] uppercase tracking-widest font-black text-aura-purple px-4">Sources & Verified Grounds</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {result.sources.map((chunk: any, i: number) => (
                                        <a key={i} href={chunk.web?.uri || chunk.maps?.uri} target="_blank" className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:border-aura-purple transition-all flex items-center justify-between group">
                                            <span className="text-xs font-bold text-white truncate max-w-[200px]">{chunk.web?.title || chunk.maps?.title || "Verification Link"}</span>
                                            <ArrowRight size={14} className="text-gray-600 group-hover:text-aura-purple" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                 </div>
               ) : (
                 <div className="text-center space-y-4 opacity-20">
                    <Layers size={64} className="mx-auto" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">Canvas Ready for Generation</p>
                 </div>
               )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

const ToolTab = ({ active, icon, label, sub, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full text-left p-6 rounded-3xl border transition-all flex items-center gap-4 ${active ? 'bg-aura-purple border-aura-purple shadow-[0_10px_30px_rgba(124,58,237,0.3)]' : 'bg-aura-glass border-aura-glassBorder hover:border-aura-purple/50'}`}
  >
    <div className={`p-3 rounded-2xl ${active ? 'bg-white/20' : 'bg-white/5'}`}>{icon}</div>
    <div>
      <div className={`text-xs font-black uppercase tracking-widest ${active ? 'text-white' : 'text-gray-300'}`}>{label}</div>
      <div className={`text-[8px] uppercase tracking-widest mt-1 ${active ? 'text-white/60' : 'text-gray-600'}`}>{sub}</div>
    </div>
  </button>
);

const ArrowRight = ({ size, className }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
);
