import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, AlertCircle, Loader } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // TODO: Replace with actual API call to your backend
      // const response = await fetch('http://localhost:5000/api/v1/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password }),
      // });

      // Temporary mock authentication for development
      if (email && password.length >= 6) {
        const mockToken = btoa(`${email}:${Date.now()}`);
        localStorage.setItem('authToken', mockToken);
        localStorage.setItem('user', JSON.stringify({ email, role: 'CEO' }));
        navigate('/app/dashboard');
      } else {
        setError('Please enter valid credentials (min 6 char password)');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white border border-outline-variant/30 rounded-3xl p-8 shadow-xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-4xl font-black text-primary mb-2">
              ENAKO OS
            </h1>
            <p className="text-secondary text-sm">
              Enterprise operations system. Sign in to your account.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-center gap-3 bg-error/10 text-error px-4 py-3 rounded-xl border border-error/20"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-bold">{error}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-xs font-black text-primary uppercase tracking-[0.15em] mb-3">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@enako.com"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-primary placeholder-secondary/50 outline-none transition-colors focus:border-primary focus:bg-white"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-xs font-black text-primary uppercase tracking-[0.15em] mb-3">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-primary placeholder-secondary/50 outline-none transition-colors focus:border-primary focus:bg-white"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-xl font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:shadow-lg transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-8 border-t border-outline-variant/20">
            <p className="text-xs text-secondary text-center">
              For development: Use any email and password (6+ chars)
            </p>
          </div>
        </div>

        {/* Development Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-primary/10 border border-primary/20 rounded-xl p-4 text-center text-xs text-primary"
        >
          🔒 This is a development login. Connect to your backend auth API when ready.
        </motion.div>
      </motion.div>
    </div>
  );
}
