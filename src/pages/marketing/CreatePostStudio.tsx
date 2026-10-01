import React, { useState, useRef } from 'react';
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
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, 1080, 1080);

        // Header
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 36px sans-serif';
        ctx.fillText('ENAKO CLOUD OS · OFFICIAL CAMPAIGN', 90, 120);

        // Topic Title
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 64px sans-serif';
        
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
        ctx.fillText('Official Verified Digital Assets & Merchant Solutions', 90, y + 80);

        // Footer Call to action
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 44px sans-serif';
        ctx.fillText('www.enako.app · Powered by ENAKO CLOUD', 90, 980);

        const dataUrl = canvas.toDataURL('image/png');
        setMediaFiles(prev => [...prev, { url: dataUrl, type: 'image', name: `${topic.replace(/\s+/g, '_')}_Flyer.png` }]);
        toast.success('Promotional flyer generated and added to media queue!');
      }
      setGeneratingAi(false);
    }, 600);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const isVideo = file.type.startsWith('video');
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setMediaFiles(prev => [
            ...prev,
            { url: event.target!.result as string, type: isVideo ? 'video' : 'image', name: file.name }
          ]);
        }
      };
      reader.readAsDataURL(file);
    });

    toast.success(`${files.length} file(s) loaded into queue`);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeMedia = (index: number) => {
    setMediaFiles(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPlatforms.length === 0) {
      toast.error('Please select at least one target social channel');
      return;
    }
    if (!title.trim()) {
      toast.error('Please enter a headline / title');
      return;
    }

    setSubmitting(true);
    try {
      await Promise.all(
        selectedPlatforms.map(platform =>
          api.createPost({
            title,
            platform,
            type: postFormat,
            status: 'Pending',
            author: 'Digital Marketer',
            date: new Date().toISOString(),
          })
        )
      );

      toast.success(`Post successfully queued across ${selectedPlatforms.length} platform(s)!`);
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
    <div className="space-y-6 font-sans pb-20">
      {/* Header */}
      <div className="flex justify-between items-center bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Social Content Creation & Production Studio</h1>
          <p className="text-slate-500 text-sm mt-1">Generate promotional videos, graphics, captions, or upload local files</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Topic & Configuration */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-5">
          <form onSubmit={handleSubmitPost} className="space-y-5">
            {/* Topic Selection Grid */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-2 uppercase tracking-wider">
                1. Select Marketing Topic / Campaign Focus *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {MARKETING_TOPICS.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setTopic(t);
                      if (!title) setTitle(`${t} Campaign`);
                    }}
                    className={cn(
                      "p-2.5 rounded-lg border text-xs font-semibold text-left transition-colors flex items-center justify-between",
                      topic === t ? "bg-slate-900 text-white border-slate-900 shadow-sm" : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"
                    )}
                  >
                    <span className="truncate">{t}</span>
                    {topic === t && <span className="text-[10px] font-bold ml-1">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Platform Multi-Select Pill Toggles */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                Target Social Channels * <span className="ml-2 text-slate-900 font-bold">{selectedPlatforms.length === ALL_PLATFORMS.length ? '— All Channels Selected' : selectedPlatforms.length > 0 ? `— ${selectedPlatforms.length} selected` : '— None selected'}</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => togglePlatform('All')}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors",
                    selectedPlatforms.length === ALL_PLATFORMS.length
                      ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                      : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                  )}
                >
                  All Channels
                </button>
                {ALL_PLATFORMS.map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => togglePlatform(p)}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors",
                      selectedPlatforms.includes(p)
                        ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                        : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Format */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Content Format *</label>
              <select value={postFormat} onChange={e => setPostFormat(e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-slate-500">
                <option value="Reel">Short Video / Reel / TikTok</option>
                <option value="Post">Graphic Image Post</option>
                <option value="Article">Educational Article</option>
                <option value="Story">Ephemeral Story</option>
              </select>
            </div>

            {/* Upload Multiple Machine Photos / Videos */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Upload Photos & Videos from Machine <span className="text-slate-500 font-normal">(multiple allowed)</span></label>
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
                className="border-2 border-dashed border-slate-300 rounded-lg p-5 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100/60 transition-colors cursor-pointer text-center"
              >
                <p className="text-xs font-semibold text-slate-800 uppercase tracking-wider">Click to browse & upload multiple Photos or Videos</p>
                <p className="text-[11px] text-slate-500 mt-0.5">MP4, MOV, PNG, JPG, WEBP — select as many as you want</p>
              </div>

              {/* Uploaded Files Grid */}
              {mediaFiles.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {mediaFiles.map((m, i) => (
                    <div key={i} className="relative rounded-lg overflow-hidden aspect-square border border-slate-200 bg-slate-900 group">
                      {m.type === 'video' ? (
                        <video src={m.url} className="w-full h-full object-cover" />
                      ) : (
                        <img src={m.url} alt={m.name} className="w-full h-full object-cover" />
                      )}
                      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button type="button" onClick={() => removeMedia(i)} className="p-1 bg-rose-600 text-white rounded text-xs font-bold hover:bg-rose-700">
                          Remove
                        </button>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-slate-900/80 p-1">
                        <p className="text-[9px] text-white truncate font-mono">{m.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Post Title */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Post Title / Headline *</label>
              <input 
                required 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-slate-500" 
                placeholder="e.g. Save on Akawo & Transfer Remittance Instantly" 
              />
            </div>

            {/* Caption Textarea */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Caption & Promotional Copy *</label>
              <textarea 
                required 
                rows={4} 
                value={caption} 
                onChange={e => setCaption(e.target.value)} 
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:border-slate-500 resize-none text-slate-900" 
                placeholder="Write compelling captions, hashtags, and call to action..." 
              />
            </div>

            <button type="submit" disabled={submitting} className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-60 shadow-sm">
              {submitting ? 'Publishing...' : 'Save & Publish Post'}
            </button>
          </form>
        </div>

        {/* Right Panel: Studio Generator & Media Preview */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-slate-900">Campaign Graphic Generator</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Generate custom campaign flyers or promotional graphics instantly for <strong className="text-slate-800">{topic}</strong>.
            </p>

            <button 
              type="button" 
              onClick={handleGenerateFlyer} 
              disabled={generatingAi}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs uppercase tracking-wider transition-colors disabled:opacity-50 shadow-sm"
            >
              {generatingAi ? 'Generating Graphic...' : 'Generate Marketing Graphic'}
            </button>
          </div>

          {/* Media Preview Box */}
          {mediaFiles.length > 0 ? (
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  {mediaFiles.length} Media File{mediaFiles.length > 1 ? 's' : ''} Ready
                </span>
                <button type="button" onClick={() => setMediaFiles([])} className="text-xs font-semibold text-rose-600 hover:underline">
                  Clear All
                </button>
              </div>
              <div className={cn("grid gap-2", mediaFiles.length === 1 ? "grid-cols-1" : "grid-cols-2")}>
                {mediaFiles.slice(0, 4).map((m, i) => (
                  <div key={i} className="relative rounded-lg overflow-hidden aspect-square border border-slate-200 bg-slate-900 group">
                    {m.type === 'video' ? (
                      <video src={m.url} controls={mediaFiles.length === 1} className="w-full h-full object-cover" />
                    ) : (
                      <img src={m.url} alt={m.name} className="w-full h-full object-cover" />
                    )}
                    {mediaFiles.length > 4 && i === 3 && (
                      <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">+{mediaFiles.length - 4}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-8 border border-dashed border-slate-300 rounded-lg text-center space-y-1.5 bg-white">
              <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">No Media Attached Yet</p>
              <p className="text-[11px] text-slate-400">Click 'Generate Marketing Graphic' above or upload photos/videos from your machine.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
