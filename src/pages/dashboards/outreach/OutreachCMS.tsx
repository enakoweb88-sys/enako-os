import React, { useState, useEffect } from 'react';
import { PenTool, Plus, Image as ImageIcon, Send, X, Clock, CheckCircle2 } from 'lucide-react';
import { outreachAPI } from '../../../lib/api/outreach';
import { toast } from 'sonner';

export default function OutreachCMS() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coverImageBase64, setCoverImageBase64] = useState('');
  const [coverImagePreview, setCoverImagePreview] = useState('');
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error('Image must be under 5MB');

    const reader = new FileReader();
    reader.onload = (ev) => {
      setCoverImageBase64(ev.target?.result as string);
      setCoverImagePreview(URL.createObjectURL(file));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (status: string) => {
    if (!title || !content) return toast.error('Title and content are required');
    setSaving(true);
    try {
      await outreachAPI.createPost({
        title,
        content,
        coverImageBase64,
        status,
        author: 'ENAKO OS Outreach Manager'
      });
      toast.success(status === 'PUBLISHED' ? 'Post published!' : 'Draft saved');
      setShowModal(false);
      setTitle('');
      setContent('');
      setCoverImageBase64('');
      setCoverImagePreview('');
      fetchPosts();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save post');
    } finally {
      setSaving(false);
    }
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
          onClick={() => setShowModal(true)}
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
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      post.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {post.status}
                    </span>
                  </div>
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
            <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low shrink-0">
              <h3 className="text-lg font-bold text-primary flex items-center gap-2"><PenTool className="w-5 h-5" /> Draft New Post</h3>
              <button onClick={() => !saving && setShowModal(false)} disabled={saving}><X className="w-5 h-5 text-secondary" /></button>
            </div>
            
            <div className="p-8 overflow-y-auto space-y-6 flex-1">
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
            </div>

            <div className="p-6 border-t border-outline-variant/20 bg-surface-container-low shrink-0 flex gap-4 justify-end">
              <button 
                onClick={() => handleSave('DRAFT')}
                disabled={saving}
                className="px-6 py-3 bg-white border border-outline-variant/30 text-secondary rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-surface-container transition-all flex items-center gap-2"
              >
                <Clock className="w-4 h-4" />
                Save as Draft
              </button>
              <button 
                onClick={() => handleSave('PUBLISHED')}
                disabled={saving}
                className="px-6 py-3 bg-primary text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Publish to Website
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
