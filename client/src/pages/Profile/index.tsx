import React, { useState, useEffect } from 'react';
import authService from '../../services/authService';
import type { UserData } from '../../services/authService';

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<Omit<UserData, 'token'> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const result = await authService.getProfile();
        if (result.success && result.data) {
          setProfile(result.data);
        } else {
          setError(result.message || 'Failed to retrieve profile info');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="max-w-2xl mx-auto py-10">
      <div className="mb-12 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight">Your Profile</h1>
        <p className="text-slate-400">View and manage your account credentials.</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="gradient-text text-xl font-bold animate-pulse">Loading profile data...</div>
        </div>
      ) : error ? (
        <div className="glass-card p-12 text-center rounded-2xl">
          <h3 className="text-red-400 text-lg font-bold mb-2">Error</h3>
          <p className="text-slate-400 text-sm">{error}</p>
        </div>
      ) : !profile ? (
        <div className="glass-card p-12 text-center rounded-2xl">
          <h3 className="text-slate-400 text-lg font-bold">No profile loaded</h3>
        </div>
      ) : (
        <div className="glass-card p-10 rounded-3xl flex flex-col items-center">
          {/* User Avatar Circle */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl font-black shadow-lg mb-6 uppercase">
            {profile.name.charAt(0)}
          </div>

          <h2 className="text-2xl font-bold text-slate-100 mb-1">{profile.name}</h2>
          <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase mb-8">
            Role: {profile.role}
          </span>

          <div className="w-full border-t border-white/8 pt-8 flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account ID</span>
              <span className="text-sm font-semibold text-slate-200">{profile._id}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</span>
              <span className="text-sm font-semibold text-slate-200">{profile.email}</span>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Security Access</span>
              <span className="text-sm font-semibold text-slate-200 uppercase tracking-wider text-indigo-400">
                {profile.role === 'admin' ? '✓ Administrator' : '✓ Standard User'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
