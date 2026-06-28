import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const { register, error: authError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const success = await register(name, email, password);
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
    <div className="flex justify-center items-center py-10">
      <div className="glass-card w-full max-w-[480px] p-10 rounded-2xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-black mb-2 tracking-tight">Create Account</h2>
          <p className="text-slate-400 text-sm">Sign up to start configuring your cart and tracking orders.</p>
        </div>

        {displayError && (
          <div className="bg-red-500/10 border border-red-500/25 text-red-400 px-4 py-3 rounded-lg text-xs font-semibold mb-6">
            ⚠️ {displayError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5 mb-5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider" htmlFor="name">
              Full Name
            </label>
            <input 
              id="name"
              type="text" 
              required
              className="form-control w-full text-sm py-2.5 px-3.5" 
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>

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

          <div className="flex flex-col gap-1.5 mb-5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider" htmlFor="password">
              Password
            </label>
            <input 
              id="password"
              type="password" 
              required
              className="form-control w-full text-sm py-2.5 px-3.5" 
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="flex flex-col gap-1.5 mb-8">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input 
              id="confirmPassword"
              type="password" 
              required
              className="form-control w-full text-sm py-2.5 px-3.5" 
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary w-full py-3 text-sm mb-6 cursor-pointer"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="text-center text-slate-400 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
