import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const { login, error: authError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        navigate('/');
      }
    } catch (err: any) {
      setLocalError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const displayError = localError || authError;

  return (
    <div className="flex justify-center items-center py-16">
      <div className="glass-card w-full max-w-[450px] p-10 rounded-2xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-black mb-2 tracking-tight">Welcome Back</h2>
          <p className="text-slate-400 text-sm">Enter your credentials to access your account.</p>
        </div>

        {displayError && (
          <div className="bg-red-500/10 border border-red-500/25 text-red-400 px-4 py-3 rounded-lg text-xs font-semibold mb-6">
            ⚠️ {displayError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5 mb-5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider" htmlFor="email">
              Email Address
            </label>
            <input 
              id="email"
              type="email" 
              required
              className="form-control w-full text-sm py-2.5 px-3.5" 
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="flex flex-col gap-1.5 mb-8">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider" htmlFor="password">
                Password
              </label>
              <a href="#forgot" className="text-xs text-indigo-400 font-bold hover:text-indigo-300 transition-colors">
                Forgot Password?
              </a>
            </div>
            <input 
              id="password"
              type="password" 
              required
              className="form-control w-full text-sm py-2.5 px-3.5" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary w-full py-3 text-sm mb-6 cursor-pointer"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center text-slate-400 text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
