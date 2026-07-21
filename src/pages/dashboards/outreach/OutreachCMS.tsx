import React, { useState, useEffect } from 'react';
import { PenTool, Plus, Image as ImageIcon, Send, X, Clock, CheckCircle2, Film, Edit2, Loader2 } from 'lucide-react';
import { outreachAPI } from '../../../lib/api/outreach';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';

export default function OutreachCMS() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Blog');
  const [coverImageBase64, setCoverImageBase64] = useState('');
  const [coverImagePreview, setCoverImagePreview] = useState('');
  
  // Media State
  const [images, setImages] = useState<string[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const data = await outreachAPI.getPosts();
      setPosts(data);
    } catch (err: any) {
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
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
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error('Image must be under 5MB');

    try {
      const compressed = await compressImage(file);
      setCoverImageBase64(compressed);
      setCoverImagePreview(URL.createObjectURL(file));
    } catch (err) {
      toast.error('Failed to process cover image');
    }
  };

  const handleMultiImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setIsUploadingMedia(true);
    
    try {
      const newImages = [...images];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`Image ${file.name} is too large`);
          continue;
        }
        
        // Compress image before upload
        const compressedBase64 = await compressImage(file);
        
        // Upload directly to Supabase storage to avoid heavy payloads
        const match = compressedBase64.match(/^data:([a-zA-Z0-9-+\/]+);base64,(.+)$/);
        if (match) {
          const ext = match[1].split('/')[1] || 'jpg';
          const buffer = Uint8Array.from(atob(match[2]), c => c.charCodeAt(0));
          const fileName = `blog-media/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
          
          const { error } = await supabase.storage.from('outreach').upload(fileName, buffer, {
            contentType: match[1]
          });
          
          if (!error) {
            const { data: { publicUrl } } = supabase.storage.from('outreach').getPublicUrl(fileName);
            newImages.push(publicUrl);
          }
        }
      }
      setImages(newImages);
      toast.success('Photos uploaded successfully!');
    } catch (err) {
      toast.error('Failed to upload photos');
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 100 * 1024 * 1024) return toast.error('Video must be under 100MB');
    
    setVideoFile(file);
    toast.success('Video selected. It will be uploaded when you save the post.');
  };

  const handleSave = async (status: string) => {
    if (!title || !content) return toast.error('Title and content are required');
    setSaving(true);
    
    let finalVideoUrl = videoUrl;
    
    try {
      if (videoFile) {
        setIsUploadingMedia(true);
        const fileExt = videoFile.name.split('.').pop();
        const fileName = `blog-video/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error } = await supabase.storage.from('outreach').upload(fileName, videoFile, {
          contentType: videoFile.type
        });
        
        if (!error) {
          const { data: { publicUrl } } = supabase.storage.from('outreach').getPublicUrl(fileName);
          finalVideoUrl = publicUrl;
        } else {
          toast.error('Failed to upload video');
        }
        setIsUploadingMedia(false);
      }

      const payload = {
        title,
        content,
        category,
        coverImageBase64,
        images,
        video: finalVideoUrl,
        status,
        author: 'ENAKO OS Outreach Manager'
      };

      if (editingPostId) {
        await outreachAPI.updatePost(editingPostId, payload);
      } else {
        await outreachAPI.createPost(payload);
      }
      
      toast.success(status === 'PUBLISHED' ? 'Post published!' : 'Draft saved');
      closeModal();
      fetchPosts();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save post');
    } finally {
      setSaving(false);
      setIsUploadingMedia(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPostId(null);
    setTitle('');
    setContent('');
    setCategory('Blog');
    setCoverImageBase64('');
    setCoverImagePreview('');
    setImages([]);
    setVideoFile(null);
    setVideoUrl(null);
  };

  const handleEdit = (post: any) => {
    setEditingPostId(post.id);
    setTitle(post.title);
    setContent(post.content);
    setCategory(post.category || 'Blog');
    setCoverImagePreview(post.coverImage || '');
    setCoverImageBase64(''); // Keep empty unless changed
    setImages(post.images || []);
    setVideoUrl(post.video || null);
    setShowModal(true);
  };

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      await outreachAPI.updatePostStatus(id, newStatus);
      toast.success('Status updated');
      fetchPosts();
    } catch (err: any) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-display font-bold text-primary">Content Management System</h2>
          <p className="text-secondary mt-1">Manage articles and updates for the main charity website</p>
        </div>
        <button 
          onClick={() => {
            closeModal();
            setShowModal(true);
          }}
          className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-md"
        >
          <PenTool className="w-4 h-4" />
          Write New Post
        </button>
      </div>

      <div className="bg-white border border-outline-variant/30 rounded-[2rem] overflow-hidden shadow-sm p-8">
        {loading ? (
          <div className="text-center py-20 text-secondary">Loading content...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <PenTool className="w-16 h-16 text-outline-variant mx-auto mb-4" />
            <h3 className="text-xl font-bold text-primary mb-2">No Posts Yet</h3>
            <p className="text-secondary max-w-sm mx-auto">Click "Write New Post" to publish your first article to the website.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map(post => (
              <div key={post.id} className="border border-outline-variant/30 rounded-2xl overflow-hidden group hover:shadow-lg transition-all">
                <div className="h-48 bg-surface-container relative">
                  {post.coverImage ? (
                    <img src={post.coverImage} className="w-full h-full object-cover" alt={post.title} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-outline-variant">
                      <ImageIcon className="w-8 h-8 opacity-50" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 flex flex-col gap-2 items-end z-10">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-white/90 backdrop-blur text-primary shadow-sm border border-outline-variant/30">
                      {post.category || 'Blog'}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      post.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {post.status}
                    </span>
                  </div>

                  {post.status === 'DRAFT' && (
                    <button
                      onClick={() => handleEdit(post)}
                      className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur text-primary hover:bg-primary hover:text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" /> Edit Draft
                    </button>
                  )}
                </div>
                <div className="p-6">
                  <h4 className="text-lg font-bold text-primary line-clamp-2 mb-2">{post.title}</h4>
                  <p className="text-sm text-secondary line-clamp-3 mb-6">{post.content}</p>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-outline-variant/20">
                    <span className="text-xs font-bold text-secondary">{new Date(post.createdAt).toLocaleDateString()}</span>
                    <button 
                      onClick={() => handleStatusToggle(post.id, post.status)}
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      {post.status === 'PUBLISHED' ? 'Unpublish to Draft' : 'Publish Now'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm" onClick={() => !saving && setShowModal(false)} />
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden border border-outline-variant/30 z-10 flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-outline-variant/30">
              <h2 className="text-xl font-display font-bold text-primary flex items-center gap-2">
                <PenTool className="text-secondary w-5 h-5" />
                {editingPostId ? 'Edit Draft' : 'Write New Article'}
              </h2>
              <button onClick={closeModal} className="text-secondary hover:text-primary transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto space-y-6 flex-1">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Article Title</label>
                  <input 
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Impact Report: First Quarter Education Grants"
                    className="w-full text-xl font-bold text-primary bg-surface border border-outline-variant/30 rounded-xl p-4 outline-none focus:ring-2 focus:ring-primary-container/20" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Category</label>
                  <select 
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full text-xl font-bold text-primary bg-surface border border-outline-variant/30 rounded-xl p-4 outline-none focus:ring-2 focus:ring-primary-container/20 cursor-pointer" 
                  >
                    <option value="Blog">Blog</option>
                    <option value="News">News</option>
                    <option value="Latest News">Latest News</option>
                    <option value="Emergency Relief">Emergency Relief</option>
                    <option value="Crisis">Crisis</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Cover Image</label>
                <div 
                  className={`w-full h-48 rounded-xl border-2 border-dashed flex flex-col items-center justify-center relative overflow-hidden transition-all ${coverImagePreview ? 'border-primary/20' : 'border-outline-variant bg-surface-container-low hover:bg-surface-container cursor-pointer'}`}
                  onClick={() => !coverImagePreview && document.getElementById('cover-upload')?.click()}
                >
                  {coverImagePreview ? (
                    <>
                      <img src={coverImagePreview} alt="Cover Preview" className="w-full h-full object-cover" />
                      <button 
                        onClick={(e) => { e.stopPropagation(); setCoverImagePreview(''); setCoverImageBase64(''); }}
                        className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-lg hover:bg-black/70"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8 text-secondary mb-2" />
                      <span className="text-sm font-bold text-secondary">Click to upload cover image</span>
                    </>
                  )}
                  <input type="file" id="cover-upload" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Article Content</label>
                <textarea 
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Write your article content here..."
                  className="w-full min-h-[300px] text-primary bg-surface border border-outline-variant/30 rounded-xl p-4 outline-none focus:ring-2 focus:ring-primary-container/20 font-medium leading-relaxed resize-y" 
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Additional Media (Photos & Video)</label>
                <div className="grid grid-cols-2 gap-4">
                  {/* Multiple Photos */}
                  <div className="relative h-24 border-2 border-dashed border-outline-variant/50 rounded-xl hover:border-primary/30 transition-colors bg-white overflow-hidden flex flex-col items-center justify-center cursor-pointer group">
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple
                      onChange={handleMultiImageUpload}
                      disabled={isUploadingMedia}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                    />
                    <div className="flex flex-col items-center justify-center p-4">
                      {isUploadingMedia ? (
                         <Loader2 className="w-6 h-6 text-primary mb-1 animate-spin" />
                      ) : (
                         <ImageIcon className="w-6 h-6 text-secondary mb-1 group-hover:text-primary transition-colors" />
                      )}
                      <span className="text-xs font-bold text-secondary">Upload Multiple Photos</span>
                      <span className="text-[10px] text-slate-400 mt-1">Automatically compressed</span>
                    </div>
                  </div>

                  {/* Video */}
                  <div className="relative">
                    <div className={`relative h-24 border-2 border-dashed border-outline-variant/50 rounded-xl hover:border-primary/30 transition-colors bg-white overflow-hidden flex flex-col items-center justify-center cursor-pointer group ${videoFile || videoUrl ? 'border-primary/50 bg-primary/5' : ''}`}>
                      <input 
                        type="file" 
                        accept="video/*" 
                        onChange={handleVideoUpload}
                        disabled={isUploadingMedia}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                      />
                      <div className="flex flex-col items-center justify-center p-4">
                        {isUploadingMedia ? (
                           <Loader2 className="w-6 h-6 text-primary mb-1 animate-spin" />
                        ) : (
                           <Film className={`w-6 h-6 mb-1 transition-colors ${videoFile || videoUrl ? 'text-primary' : 'text-secondary group-hover:text-primary'}`} />
                        )}
                        <span className={`text-xs font-bold ${videoFile || videoUrl ? 'text-primary' : 'text-secondary'}`}>
                          {videoFile ? 'Video Selected' : videoUrl ? 'Video Uploaded' : 'Upload Video File'}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-1">Direct upload (Max 100MB)</span>
                      </div>
                    </div>
                    {(videoFile || videoUrl) && (
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          setVideoFile(null);
                          setVideoUrl(null);
                        }}
                        className="absolute -top-2 -right-2 bg-error text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-colors z-20"
                        title="Remove Video"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {images.length > 0 && (
                  <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border border-outline-variant/30">
                        <img src={img} className="w-full h-full object-cover" alt="Uploaded preview" />
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            setImages(images.filter((_, i) => i !== idx));
                          }}
                          className="absolute -top-2 -right-2 bg-error text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition-colors z-20"
                          title="Remove Photo"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-6 border-t border-outline-variant/30 bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
              <button 
                onClick={closeModal}
                className="px-6 py-2 rounded-xl text-sm font-bold text-secondary hover:bg-outline-variant/20 transition-colors"
              >
                Cancel
              </button>
              <button 
                disabled={saving || isUploadingMedia}
                onClick={() => handleSave('DRAFT')}
                className="px-6 py-2 rounded-xl text-sm font-bold text-primary bg-white border border-primary/20 hover:bg-primary/5 transition-colors flex items-center gap-2"
              >
                {saving || isUploadingMedia ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
                Save as Draft
              </button>
              <button 
                disabled={saving || isUploadingMedia}
                onClick={() => handleSave('PUBLISHED')}
                className="px-6 py-2 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary/90 transition-colors shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                {saving || isUploadingMedia ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Publish Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
