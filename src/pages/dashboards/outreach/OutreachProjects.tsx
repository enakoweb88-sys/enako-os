import React, { useState, useEffect } from 'react';
import { outreachAPI } from '../../../lib/api';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';
import { 
  Building2, Plus, MapPin, Target, Trash2, Image as ImageIcon, 
  Film, X, Loader2, CheckCircle2, RefreshCw, Eye
} from 'lucide-react';

export default function OutreachProjects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCommunityFilter, setSelectedCommunityFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [form, setForm] = useState({
    title: '',
    communitySlug: 'kumba',
    targetAmount: '10000000',
    currentAmount: '0',
    status: 'In Progress',
    description: '',
  });

  // Media state — all store final Supabase URLs (not base64)
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isCompressingMedia, setIsCompressingMedia] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoPhase, setVideoPhase] = useState<'idle' | 'compressing' | 'uploading' | 'done'>('idle');

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await outreachAPI.getCommunityProjects(selectedCommunityFilter || undefined);
      setProjects(data);
    } catch (err) {
      toast.error('Failed to load community projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [selectedCommunityFilter]);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1280;
          let width = img.width;
          let height = img.height;
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const uploadToSupabase = async (base64: string, prefix: string): Promise<string | null> => {
    const match = base64.match(/^data:([a-zA-Z0-9-+\/]+);base64,(.+)$/);
    if (!match) return null;
    const contentType = match[1];
    const buffer = Uint8Array.from(atob(match[2]), c => c.charCodeAt(0));
    const ext = contentType.split('/')[1] || 'jpg';
    const fileName = `${prefix}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
    const { error } = await supabase.storage.from('outreach').upload(fileName, buffer, { contentType });
    if (error) { console.error('Supabase upload error:', error); return null; }
    const { data: { publicUrl } } = supabase.storage.from('outreach').getPublicUrl(fileName);
    return publicUrl;
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error('Cover image must be under 5MB');
    setIsCompressingMedia(true);
    try {
      const compressed = await compressImage(file);
      setCoverImagePreview(URL.createObjectURL(file)); // Local preview
      const url = await uploadToSupabase(compressed, 'project-cover');
      if (url) setCoverImageUrl(url);
      else toast.error('Failed to upload cover to storage');
    } catch (err) {
      toast.error('Failed to process cover image');
    } finally {
      setIsCompressingMedia(false);
    }
  };

  const handleMultiImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setIsCompressingMedia(true);
    try {
      for (const file of files) {
        if (file.size > 10 * 1024 * 1024) { toast.error(`${file.name} is too large (max 10MB)`); continue; }
        const compressed = await compressImage(file);
        const url = await uploadToSupabase(compressed, 'project-photo');
        if (url) setImages(prev => [...prev, url]);
      }
      toast.success('Photos uploaded successfully!');
    } catch (err) {
      toast.error('Failed to upload photos');
    } finally {
      setIsCompressingMedia(false);
    }
  };

  // ─── Browser-side video compression via MediaRecorder ─────────────────────
  const compressVideoInBrowser = (file: File, onProgress: (p: number) => void): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.src = URL.createObjectURL(file);
      video.muted = true;
      video.crossOrigin = 'anonymous';
      video.preload = 'metadata';

      video.onloadedmetadata = () => {
        const duration = video.duration;
        const MAX_W = 1280;
        let w = video.videoWidth || 1280;
        let h = video.videoHeight || 720;
        if (w > MAX_W) { h = Math.round((h * MAX_W) / w); w = MAX_W; }

        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        const stream = canvas.captureStream(25);

        const mimeType = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm']
          .find(t => MediaRecorder.isTypeSupported(t)) || 'video/webm';

        const recorder = new MediaRecorder(stream, {
          mimeType,
          videoBitsPerSecond: 1_500_000,
        });
        const chunks: BlobPart[] = [];
        recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
        recorder.onstop = () => {
          URL.revokeObjectURL(video.src);
          resolve(new Blob(chunks, { type: mimeType.split(';')[0] }));
        };
        recorder.onerror = (e) => reject(e);
        recorder.start(500);

        const startedAt = Date.now();
        const drawFrame = () => {
          if (video.ended || video.paused) { recorder.stop(); return; }
          ctx.drawImage(video, 0, 0, w, h);
          const elapsed = (Date.now() - startedAt) / 1000;
          onProgress(Math.min((elapsed / duration) * 100, 95));
          requestAnimationFrame(drawFrame);
        };
        video.play().then(() => requestAnimationFrame(drawFrame)).catch(reject);
        video.onended = () => recorder.stop();
      };
      video.onerror = () => reject(new Error('Failed to load video'));
    });
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024 * 1024) {
      toast.error('Video must be under 500MB. Please trim or compress it first.');
      return;
    }
    setIsCompressingMedia(true);
    setVideoProgress(0);
    setVideoUrl(null);
    try {
      let uploadBlob: Blob = file;
      if (file.size > 50 * 1024 * 1024) {
        setVideoPhase('compressing');
        toast.info(`Compressing video (${(file.size / 1024 / 1024).toFixed(0)}MB)…`);
        uploadBlob = await compressVideoInBrowser(file, (p) => setVideoProgress(p * 0.7));
        const savedMB = ((file.size - uploadBlob.size) / 1024 / 1024).toFixed(1);
        toast.success(`Compressed! Saved ${savedMB}MB. Uploading…`);
      } else {
        toast.info('Uploading video…');
      }
      setVideoPhase('uploading');
      const ext = file.name.split('.').pop() || 'webm';
      const fileName = `project-video/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
      const { error } = await supabase.storage.from('outreach').upload(fileName, uploadBlob, {
        contentType: uploadBlob.type || file.type,
      });
      if (!error) {
        const { data: { publicUrl } } = supabase.storage.from('outreach').getPublicUrl(fileName);
        setVideoUrl(publicUrl);
        setVideoProgress(100);
        setVideoPhase('done');
        toast.success('Video uploaded successfully!');
      } else {
        toast.error('Failed to upload video to storage');
        setVideoPhase('idle');
      }
    } catch (err) {
      toast.error('Video processing failed. Try a smaller file.');
      setVideoPhase('idle');
    } finally {
      setIsCompressingMedia(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        title: form.title,
        description: form.description,
        communitySlug: form.communitySlug,
        targetAmount: form.targetAmount,
        currentAmount: form.currentAmount,
        status: form.status,
        coverImage: coverImageUrl,  // Supabase URL, not base64
        images,                     // Array of Supabase URLs
        videoUrl,                   // Supabase URL, not blob URL
      };

      await outreachAPI.createCommunityProject(payload);
      toast.success(`Project published successfully for ${form.communitySlug.toUpperCase()}!`);
      
      setIsModalOpen(false);
      // Reset Form
      setForm({
        title: '',
        communitySlug: 'kumba',
        targetAmount: '10000000',
        currentAmount: '0',
        status: 'In Progress',
        description: '',
      });
      setCoverImageUrl(null);
      setCoverImagePreview(null);
      setImages([]);
      setVideoUrl(null);

      fetchProjects();
    } catch (err: any) {
      toast.error(err.message || 'Failed to publish project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await outreachAPI.deleteCommunityProject(id);
      toast.success('Project deleted from database');
      fetchProjects();
    } catch (err) {
      toast.error('Failed to delete project');
    }
  };

  const communitiesList = [
    { slug: 'kumba', name: 'Kumba (South West)' },
    { slug: 'douala', name: 'Douala (Littoral)' },
    { slug: 'yaounde', name: 'Yaoundé (Centre)' },
    { slug: 'bamenda', name: 'Bamenda (North West)' },
    { slug: 'buea', name: 'Buea (South West)' },
    { slug: 'limbe', name: 'Limbe (South West)' },
    { slug: 'kribi', name: 'Kribi (South)' },
    { slug: 'bafoussam', name: 'Bafoussam (West)' },
    { slug: 'garoua', name: 'Garoua (North)' },
    { slug: 'maroua', name: 'Maroua (Far North)' },
    { slug: 'ebolowa', name: 'Ebolowa (South)' },
    { slug: 'bertoua', name: 'Bertoua (East)' },
    { slug: 'ngaoundere', name: 'Ngaoundéré (Adamawa)' },
    { slug: 'dschang', name: 'Dschang (West)' },
    { slug: 'foumban', name: 'Foumban (West)' },
  ];

  return (
    <div className="space-y-6 pb-20 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/30 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4 text-primary" />
            <span>Outreach Manager Portal</span>
          </div>
          <h2 className="text-3xl font-bold font-display text-primary">Community Field Projects & State Initiatives</h2>
          <p className="text-secondary text-sm mt-1">
            Publish, edit, and manage custom community projects across all regional divisions in Cameroon.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchProjects}
            className="bg-surface-container border border-outline-variant/40 text-primary font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 hover:bg-surface-container-high transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-primary-dark transition-all shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            Post New Community Project
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-outline-variant/30 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-primary">Select Target State / City:</span>
          <select
            value={selectedCommunityFilter}
            onChange={(e) => setSelectedCommunityFilter(e.target.value)}
            className="bg-surface-container border border-outline-variant/40 rounded-lg px-3 py-1.5 text-xs font-bold text-primary focus:outline-none"
          >
            <option value="">All Regions & Cities</option>
            {communitiesList.map(c => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>

        <span className="text-xs font-bold text-secondary">
          Database Projects Count: <strong className="text-primary">{projects.length}</strong>
        </span>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-16 text-center text-secondary text-sm font-medium animate-pulse">
            Loading field projects from database...
          </div>
        ) : projects.length === 0 ? (
          <div className="col-span-full bg-white border border-outline-variant/30 rounded-2xl p-12 text-center text-secondary space-y-3">
            <Building2 className="w-12 h-12 text-outline-variant mx-auto opacity-40" />
            <h4 className="font-bold text-primary text-base">No Community Projects Published Yet</h4>
            <p className="text-xs text-secondary max-w-sm mx-auto">
              Click <strong>"Post New Community Project"</strong> above to publish field projects for Kumba, Douala, Yaoundé, or any state.
            </p>
          </div>
        ) : (
          projects.map((p) => {
            const target = parseFloat(p.targetAmount || '0');
            const current = parseFloat(p.currentAmount || '0');
            const percent = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

            return (
              <div key={p.id} className="bg-white border border-outline-variant/30 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative group">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-primary/10 text-primary text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider">
                      📍 {p.communitySlug.toUpperCase()}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${p.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : p.status === 'In Progress' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'}`}>
                      {p.status}
                    </span>
                  </div>

                  {p.coverImage && (
                    <div className="w-full h-40 rounded-lg overflow-hidden mb-3 bg-slate-100">
                      <img src={p.coverImage} alt={p.title} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <h3 className="font-bold text-primary text-base mb-2">{p.title}</h3>
                  <p className="text-xs text-secondary line-clamp-3 leading-relaxed mb-4">{p.description}</p>
                </div>

                <div className="pt-3 border-t border-outline-variant/30 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-primary">
                    <span>Funding Raised: {current.toLocaleString()} XAF</span>
                    <span>{percent}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${percent}%` }} />
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-secondary">Target: <strong>{target.toLocaleString()} XAF</strong></span>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                      title="Delete Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Create Community Project with Local Machine File & Video Selector */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/20 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-outline-variant/30 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
              <h3 className="font-bold text-primary text-lg">Post Community / State Field Project</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-base">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold text-primary">
              <div>
                <label className="block mb-1 text-secondary uppercase tracking-wider">Project Title *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Kumba Solar Water Borehole & Health Clinic"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full p-3 bg-surface border border-outline-variant/40 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-secondary uppercase tracking-wider">Target State / City *</label>
                  <select
                    value={form.communitySlug}
                    onChange={(e) => setForm({ ...form, communitySlug: e.target.value })}
                    className="w-full p-3 bg-surface border border-outline-variant/40 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                  >
                    {communitiesList.map(c => (
                      <option key={c.slug} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-secondary uppercase tracking-wider">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full p-3 bg-surface border border-outline-variant/40 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="Planned">Planned</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-secondary uppercase tracking-wider">Target Funding (XAF) *</label>
                  <input
                    required
                    type="number"
                    value={form.targetAmount}
                    onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
                    className="w-full p-3 bg-surface border border-outline-variant/40 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-secondary uppercase tracking-wider">Current Raised (XAF)</label>
                  <input
                    type="number"
                    value={form.currentAmount}
                    onChange={(e) => setForm({ ...form, currentAmount: e.target.value })}
                    className="w-full p-3 bg-surface border border-outline-variant/40 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                  />
                </div>
              </div>

              {/* Local File Pickers: Cover Photo, Gallery & Video */}
              <div className="space-y-3 pt-2">
                <label className="block text-secondary uppercase tracking-wider">Project Media Uploads (Select from Machine)</label>
                
                <div className="grid grid-cols-2 gap-3">
                  {/* Cover Photo Input */}
                  <div className="relative border-2 border-dashed border-outline-variant/50 rounded-xl p-4 text-center hover:border-primary/40 transition-colors cursor-pointer bg-surface-container-low">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    <ImageIcon className="w-6 h-6 text-secondary mx-auto mb-1" />
                    <span className="text-[11px] font-bold text-primary block">Select Cover Image</span>
                    <span className="text-[10px] text-slate-400 font-normal">JPG, PNG format</span>
                  </div>

                  {/* Video Input with compression progress */}
                  <div className="relative">
                    <div className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-all ${
                      videoPhase === 'done' ? 'border-green-500/50 bg-green-50'
                      : videoPhase === 'compressing' || videoPhase === 'uploading' ? 'border-primary/50 bg-primary/5 cursor-not-allowed'
                      : 'border-outline-variant/50 hover:border-primary/40 bg-surface-container-low cursor-pointer'
                    }`}>
                      {(videoPhase === 'compressing' || videoPhase === 'uploading') ? (
                        <div className="space-y-1.5 py-1">
                          <div className="flex justify-between text-[10px] font-bold text-primary">
                            <span>{videoPhase === 'compressing' ? '🗜 Compressing…' : '⬆ Uploading…'}</span>
                            <span>{Math.round(videoProgress)}%</span>
                          </div>
                          <div className="w-full h-2 bg-primary/10 rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${videoProgress}%` }} />
                          </div>
                          <div className="text-[10px] text-secondary">
                            {videoPhase === 'compressing' ? 'Reducing file size…' : 'Uploading to Supabase…'}
                          </div>
                        </div>
                      ) : (
                        <>
                          <input
                            type="file"
                            accept="video/*"
                            onChange={handleVideoUpload}
                            disabled={isCompressingMedia}
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                          />
                          <Film className={`w-6 h-6 mx-auto mb-1 ${videoPhase === 'done' ? 'text-green-600' : 'text-secondary'}`} />
                          <span className={`text-[11px] font-bold block ${videoPhase === 'done' ? 'text-green-700' : 'text-primary'}`}>
                            {videoPhase === 'done' ? '✓ Video Uploaded' : 'Select Video File'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            {videoPhase === 'done' ? 'Click to replace' : 'Max 500MB · Auto-compressed if >50MB'}
                          </span>
                        </>
                      )}
                    </div>
                    {videoPhase === 'done' && videoUrl && (
                      <button
                        type="button"
                        onClick={() => { setVideoUrl(null); setVideoProgress(0); setVideoPhase('idle'); }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600 z-20"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Previews */}
                {coverImagePreview && (
                  <div className="relative w-full h-36 rounded-xl overflow-hidden border border-outline-variant/30">
                    <img src={coverImagePreview} alt="Cover preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setCoverImagePreview(null)}
                      className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full hover:bg-black"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block mb-1 text-secondary uppercase tracking-wider">Detailed Description *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe field objectives, local beneficiary impact, and resource needs..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full p-3 bg-surface border border-outline-variant/40 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-medium resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isCompressingMedia}
                className="w-full py-3.5 bg-primary text-white font-bold rounded-xl shadow hover:bg-primary-dark transition-all uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Publishing to Database...</span>
                  </>
                ) : (
                  <span>Publish Community Project</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
