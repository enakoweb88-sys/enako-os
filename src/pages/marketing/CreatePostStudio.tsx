import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  PenTool, Sparkles, Image, PlaySquare, FileText, Send, RefreshCw, CheckCircle2,
  Share2, Video, DollarSign, BookOpen, Layers, Wand2, Upload, FileVideo, Trash2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { api } from '../../lib/api';
import { toast } from 'sonner';

const MARKETING_TOPICS = [
  'Create promotional videos',
  'Create graphics',
  'Write captions',
  'Create educational financial content',
  'Promote ENAKO products',
  'Promote savings',
  'Promote remittance services',
  'Promote B2B services',
  'Promote land banking/investment products',
  'ENAKO Mobile App',
  'Pay school Fees',
  'Save on Akawo'
];

export default function CreatePostStudio() {
  const ALL_PLATFORMS = ['Instagram', 'TikTok', 'Facebook', 'LinkedIn', 'X', 'YouTube'];

  const [topic, setTopic] = useState('Promote remittance services');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['Instagram']);
  const [postFormat, setPostFormat] = useState('Reel');
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [mediaFiles, setMediaFiles] = useState<{ url: string; type: 'image' | 'video'; name: string }[]>([]);

  const [aiPrompt, setAiPrompt] = useState('');
  const [generatingAi, setGeneratingAi] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const togglePlatform = (p: string) => {
    if (p === 'All') {
      setSelectedPlatforms(selectedPlatforms.length === ALL_PLATFORMS.length ? [] : [...ALL_PLATFORMS]);
      return;
    }
    setSelectedPlatforms(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    );
  };

  // Generate Flyer Canvas dynamically
  const handleGenerateFlyer = () => {
    setGeneratingAi(true);
    setTimeout(() => {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Gradient Background
        const grad = ctx.createLinearGradient(0, 0, 1080, 1080);
        grad.addColorStop(0, '#1e1b4b');
        grad.addColorStop(0.5, '#4338ca');
        grad.addColorStop(1, '#0f172a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1080, 1080);

        // Decorative Glass Circle
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.beginPath();
        ctx.arc(900, 200, 300, 0, Math.PI * 2);
        ctx.fill();

        // ENAKO Badge Header
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 36px sans-serif';
        ctx.fillText('ENAKO CLOUD OS · OFFICIAL CAMPAIGN', 90, 120);

        // Topic Title
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 64px sans-serif';
        
        // Wrap text
        const words = (topic || 'ENAKO Fintech Solutions').toUpperCase().split(' ');
        let line = '';
        let y = 240;
        for (let i = 0; i < words.length; i++) {
          const testLine = line + words[i] + ' ';
          if (ctx.measureText(testLine).width > 900 && i > 0) {
            ctx.fillText(line, 90, y);
            line = words[i] + ' ';
            y += 80;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, 90, y);

        // Subtext Callout
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '36px sans-serif';
        ctx.fillText('Instant MoMo, Savings, School Fees & Remittance', 90, y + 90);

        // CTA Button Box
        ctx.fillStyle = '#fbbf24';
        ctx.roundRect ? ctx.roundRect(90, y + 160, 520, 100, 20) : ctx.fillRect(90, y + 160, 520, 100);
        ctx.fill();

        ctx.fillStyle = '#1e1b4b';
        ctx.font = 'bold 38px sans-serif';
        ctx.fillText('DOWNLOAD ENAKO APP NOW 📲', 120, y + 225);
      }

      const generatedDataUrl = canvas.toDataURL('image/png');
      setMediaFiles(prev => [...prev, { url: generatedDataUrl, type: 'image', name: `${topic} — Promo Flyer.png` }]);
      if (!caption) {
        setCaption(`🚀 ${topic}\n\nFast, secure, and automated financial services powered by ENAKO OS!\n\n📲 Download the app today on iOS & Android! #ENAKO #Fintech #Cameroon #MoMo`);
      }
      if (!title) {
        setTitle(`${topic} — Promo Flyer`);
      }
      setGeneratingAi(false);
      toast.success('Custom Marketing Flyer generated successfully!');
    }, 600);
  };

  // Upload Multiple Local Machine Files (Videos/Photos)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach(file => {
      const isVideo = file.type.startsWith('video/');
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setMediaFiles(prev => [...prev, { url: dataUrl, type: isVideo ? 'video' : 'image', name: file.name }]);
      };
      reader.readAsDataURL(file);
    });
    toast.success(`${files.length} file${files.length > 1 ? 's' : ''} added to media library`);
    // Reset input so same files can be re-selected
    e.target.value = '';
  };

  const removeMedia = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const platformStr = selectedPlatforms.length === ALL_PLATFORMS.length ? 'All Channels' : selectedPlatforms.join(', ');
      await api.createPost({
        title: title || `${topic} (${postFormat})`,
        platform: platformStr,
        type: postFormat,
        status: 'Pending',
        author: 'Digital Marketer',
        reach: 0,
        engagement: 0,
        date: new Date().toISOString()
      });
      toast.success(`Post published to ${platformStr}! Saved to PostgreSQL.`);
      setTitle('');
      setCaption('');
      setMediaFiles([]);
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit post');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 font-sans pb-20 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary flex items-center gap-2">
            <PenTool className="w-6 h-6 text-primary" /> Social Content Creation & AI Studio
          </h1>
          <p className="text-xs text-secondary mt-1 uppercase tracking-widest font-bold">Generate promotional videos, graphics, captions, or upload local files from machine</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Form: Topic & Configuration */}
        <div className="lg:col-span-7 bg-white border border-outline-variant/30 rounded-3xl p-8 shadow-sm space-y-6">
          <form onSubmit={handleSubmitPost} className="space-y-6">
            
            {/* Topic Selection Grid */}
            <div>
              <label className="block text-[11px] font-bold text-secondary mb-3 uppercase tracking-widest">
                1. Select Marketing Topic / Campaign Focus *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                {MARKETING_TOPICS.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setTopic(t);
                      if (!title) setTitle(`${t} Campaign`);
                    }}
                    className={cn(
                      "p-3 rounded-xl border text-xs font-bold text-left transition-all flex items-center justify-between",
                      topic === t ? "bg-primary text-white border-primary shadow-sm" : "bg-surface-container-low text-secondary border-outline-variant/30 hover:border-primary/40"
                    )}
                  >
                    <span className="truncate">{t}</span>
                    {topic === t && <CheckCircle2 className="w-3.5 h-3.5 shrink-0 ml-1" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Platform Multi-Select Pill Toggles */}
            <div>
              <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">
                Target Social Channels * <span className="ml-2 text-primary font-black">{selectedPlatforms.length === ALL_PLATFORMS.length ? '— All Channels Selected' : selectedPlatforms.length > 0 ? `— ${selectedPlatforms.length} selected` : '— None selected'}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => togglePlatform('All')}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold border transition-all",
                    selectedPlatforms.length === ALL_PLATFORMS.length
                      ? "bg-primary text-white border-primary shadow-md"
                      : "bg-surface-container-low text-secondary border-outline-variant/30 hover:border-primary/40"
                  )}
                >
                  🌐 All Channels
                </button>
                {ALL_PLATFORMS.map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => togglePlatform(p)}
                    className={cn(
                      "px-3 py-2 rounded-xl text-xs font-bold border transition-all",
                      selectedPlatforms.includes(p)
                        ? "bg-primary text-white border-primary shadow-sm"
                        : "bg-surface-container-low text-secondary border-outline-variant/30 hover:border-primary/40"
                    )}
                  >
                    {p === 'Instagram' ? '📸' : p === 'TikTok' ? '🎵' : p === 'Facebook' ? '👥' : p === 'LinkedIn' ? '💼' : p === 'X' ? '𝕏' : '▶️'} {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Format */}
            <div>
              <label className="block text-[10px] font-bold text-secondary mb-1.5 uppercase tracking-widest">Content Format *</label>
              <select value={postFormat} onChange={e => setPostFormat(e.target.value)} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm font-bold text-primary outline-none focus:ring-2 focus:ring-primary/20">
                <option value="Reel">Short Video / Reel / TikTok</option>
                <option value="Post">Graphic Image Post</option>
                <option value="Article">Educational Article</option>
                <option value="Story">Ephemeral Story</option>
              </select>
            </div>

            {/* Upload Multiple Machine Photos / Videos */}
            <div>
              <label className="block text-[10px] font-bold text-secondary mb-1.5 uppercase tracking-widest">Upload Photos & Videos from Machine <span className="text-primary">(multiple allowed)</span></label>
              <input 
                ref={fileInputRef} 
                type="file" 
                accept="image/*,video/*" 
                multiple
                onChange={handleFileUpload} 
                className="hidden" 
              />
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-outline-variant/50 rounded-2xl p-5 flex flex-col items-center justify-center bg-surface-container-low/40 hover:bg-surface-container-low transition-all cursor-pointer group"
              >
                <Upload className="w-7 h-7 text-primary group-hover:scale-110 transition-transform mb-1.5" />
                <p className="text-xs font-bold text-primary uppercase tracking-wider">Click to browse & upload multiple Photos or Videos</p>
                <p className="text-[10px] text-secondary mt-1">MP4, MOV, PNG, JPG, WEBP — select as many as you want</p>
              </div>

              {/* Uploaded Files Grid */}
              {mediaFiles.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {mediaFiles.map((m, i) => (
                    <div key={i} className="relative rounded-xl overflow-hidden aspect-square border border-outline-variant/20 bg-black group">
                      {m.type === 'video' ? (
                        <video src={m.url} className="w-full h-full object-cover" />
                      ) : (
                        <img src={m.url} alt={m.name} className="w-full h-full object-cover" />
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button type="button" onClick={() => removeMedia(i)} className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1">
                        <p className="text-[8px] text-white truncate">{m.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Post Title */}
            <div>
              <label className="block text-[10px] font-bold text-secondary mb-1.5 uppercase tracking-widest">Post Title / Headline *</label>
              <input 
                required 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm font-bold text-primary outline-none focus:ring-2 focus:ring-primary/20" 
                placeholder="e.g. Save on Akawo & Transfer Remittance Instantly" 
              />
            </div>

            {/* Caption Textarea */}
            <div>
              <label className="block text-[10px] font-bold text-secondary mb-1.5 uppercase tracking-widest">Caption & Promotional Copy *</label>
              <textarea 
                required 
                rows={4} 
                value={caption} 
                onChange={e => setCaption(e.target.value)} 
                className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none font-sans" 
                placeholder="Write compelling captions, hashtags, and call to action..." 
              />
            </div>

            <button type="submit" disabled={submitting} className="w-full py-4 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-60">
              {submitting ? 'Publishing...' : 'Save & Publish Post'}
            </button>
          </form>
        </div>

        {/* Right Panel: AI Generator Studio & Media Preview */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Generator Controls */}
          <div className="bg-gradient-to-br from-purple-900 via-primary to-slate-900 text-white rounded-3xl p-6 shadow-lg space-y-4">
            <div className="flex items-center gap-2 text-amber-300">
              <Wand2 className="w-5 h-5" />
              <h3 className="font-display text-lg font-bold">AI Studio & Graphic Flyer Generator</h3>
            </div>
            <p className="text-xs text-purple-200 leading-relaxed">
              Generate custom campaign flyers or promotional reels instantly for <span className="font-bold text-white">{topic}</span>.
            </p>

            <button 
              type="button" 
              onClick={handleGenerateFlyer} 
              disabled={generatingAi}
              className="w-full py-3.5 bg-amber-400 text-primary font-bold rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-amber-300 transition-all disabled:opacity-50 shadow-md"
            >
              {generatingAi ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Generating Flyer...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Generate Marketing Flyer / Reel Graphic
                </>
              )}
            </button>
          </div>

          {/* Media Preview Box (Upload or AI Generated) */}
          {mediaFiles.length > 0 ? (
            <div className="bg-white border border-outline-variant/30 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">
                  {mediaFiles.length} Media File{mediaFiles.length > 1 ? 's' : ''} Ready
                </span>
                <button type="button" onClick={() => setMediaFiles([])} className="p-1 text-red-500 hover:bg-red-50 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1" title="Clear All">
                  <Trash2 className="w-3.5 h-3.5" /> Clear All
                </button>
              </div>
              <div className={cn("grid gap-2", mediaFiles.length === 1 ? "grid-cols-1" : "grid-cols-2")}>
                {mediaFiles.slice(0, 4).map((m, i) => (
                  <div key={i} className="relative rounded-2xl overflow-hidden aspect-square border border-outline-variant/20 bg-black group">
                    {m.type === 'video' ? (
                      <video src={m.url} controls={mediaFiles.length === 1} className="w-full h-full object-cover" />
                    ) : (
                      <img src={m.url} alt={m.name} className="w-full h-full object-cover" />
                    )}
                    {mediaFiles.length > 4 && i === 3 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">+{mediaFiles.length - 4}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-8 border border-dashed border-outline-variant/40 rounded-3xl text-center space-y-2 bg-white/50">
              <Image className="w-10 h-10 text-secondary/40 mx-auto" />
              <p className="text-xs font-bold text-secondary uppercase tracking-wider">No Media Attached Yet</p>
              <p className="text-[10px] text-secondary">Click 'Generate Marketing Flyer' above or upload photos/videos from your machine.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
