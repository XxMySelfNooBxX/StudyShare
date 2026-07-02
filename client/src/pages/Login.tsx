import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { m } from 'framer-motion';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Mock authentication
    setTimeout(() => {
      setIsLoading(false);
      navigate('/dashboard');
    }, 800);
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <m.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="p-8 bg-cardBg rounded-xl shadow-2xl w-full max-w-md border border-slate-700/50"
      >
        <h1 className="text-3xl font-bold mb-6 text-center text-white">
          Study<span className="text-brandAccent">Share</span>
        </h1>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Email</label>
            <input 
              type="email" 
              required
              className="w-full bg-slate-900/50 border border-slate-700 rounded-md px-4 py-2 focus:outline-none focus:border-brandAccent transition-colors text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Password</label>
            <input 
              type="password" 
              required
              className="w-full bg-slate-900/50 border border-slate-700 rounded-md px-4 py-2 focus:outline-none focus:border-brandAccent transition-colors text-white"
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-brandAccent hover:bg-emerald-400 text-slate-900 font-semibold rounded-md px-4 py-2 mt-4 transition-colors flex justify-center items-center"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : 'Sign In'}
          </button>
        </form>
      </m.div>
    </div>
  );
};

export default Login;
