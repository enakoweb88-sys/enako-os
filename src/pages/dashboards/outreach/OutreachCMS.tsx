import { PenTool } from 'lucide-react';

export default function OutreachCMS() {
  return (
    <div className="p-6 pb-20">
      <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm flex flex-col items-center justify-center py-20">
        <PenTool className="w-16 h-16 text-outline-variant mb-4" />
        <h3 className="text-xl font-bold text-primary mb-2">Content Management System</h3>
        <p className="text-secondary text-sm mb-6 max-w-md text-center">Write blog posts, upload images/videos, and manage content on the main charity website directly from here.</p>
        <button className="bg-primary text-white px-6 py-2.5 rounded-lg font-bold">Write New Post</button>
      </div>
    </div>
  );
}
