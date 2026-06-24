import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Terminal, ShieldCheck, Mail, Lock, User, Sparkles } from 'lucide-react';

export default function AuthUplink() {
  const { login, register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Demo accounts pre-seeded in the database
  const DEMO_ACCOUNTS = [
    { label: 'USER',       email: 'test@example.com',  password: 'password123', role: 'user' },
    { label: 'EDITOR',     email: 'editor@nexus.io',   password: 'password123', role: 'editor' },
    { label: 'SUPERADMIN', email: 'admin@nexus.io',    password: 'password123', role: 'superadmin' },
  ];

  const ROLE_COLORS = {
    user:       'border-soft-ash/40 text-soft-ash hover:border-soft-ash',
    editor:     'border-hazard/60   text-hazard   hover:border-hazard',
    superadmin: 'border-acid/60     text-acid     hover:border-acid',
  };

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        setSuccess('CONNECTION_ESTABLISHED. LOGGING IN...');
        setTimeout(() => navigate('/profile'), 1500);
      } else {
        await register(firstName, lastName, email, password);
        setSuccess('REGISTRATION_COMPLETE. WELCOME RUNNER...');
        setTimeout(() => navigate('/profile'), 1500);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMockGoogleSSO = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const mockIdToken = 'mock_google_oauth_token_' + Date.now();
      await loginWithGoogle(mockIdToken);
      setSuccess('GOOGLE_SSO_CONNECTION_STABLE. REDIRECTING...');
      setTimeout(() => navigate('/profile'), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail, demoPassword) => {
    setError('');
    setSuccess('');
    setLoading(true);
    setIsLogin(true);
    try {
      await login(demoEmail, demoPassword);
      setSuccess('DEMO_CONNECTION_ESTABLISHED. LOGGING IN...');
      setTimeout(() => navigate('/profile'), 1200);
    } catch (err) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[600px] flex items-center justify-center px-6 py-12 font-mono text-soft-ash bg-void">
      <div className="w-full max-w-md bg-sludge border border-acid/25 hover:border-acid/65 p-6 rounded clip-chamfer shadow-acid transition-all duration-300">
        
        {/* Module Header */}
        <div className="flex items-center justify-between border-b border-acid/20 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-acid animate-pulse" />
            <h2 className="font-display font-black text-sm tracking-widest text-acid">
              {isLogin ? 'SESSION_LOGIN_UPLINK' : 'CREATE_NEW_IDENTITY'}
            </h2>
          </div>
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setSuccess('');
            }}
            className="text-[10px] text-hazard hover:underline"
          >
            {isLogin ? 'GO_TO_REGISTER' : 'GO_TO_LOGIN'}
          </button>
        </div>

        {/* Auth Input form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {!isLogin && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] text-acid/80 uppercase">First_Name</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    placeholder="TRINITY"
                    className="w-full bg-void border border-acid/30 px-3 py-2 pl-8 rounded text-f0f0f0 outline-none focus:border-acid"
                  />
                  <User className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-soft-ash/55" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-acid/80 uppercase">Last_Name</label>
                <input 
                  type="text" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  placeholder="RUNNER"
                  className="w-full bg-void border border-acid/30 px-3 py-2 rounded text-f0f0f0 outline-none focus:border-acid"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[9px] text-acid/80 uppercase">Runner_Email</label>
            <div className="relative">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="runner@nexus.io"
                className="w-full bg-void border border-acid/30 px-3 py-2 pl-8 rounded text-f0f0f0 outline-none focus:border-acid"
              />
              <Mail className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-soft-ash/55" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] text-acid/80 uppercase">Uplink_Password</label>
            <div className="relative">
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="******"
                className="w-full bg-void border border-acid/30 px-3 py-2 pl-8 rounded text-f0f0f0 outline-none focus:border-acid"
              />
              <Lock className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-soft-ash/55" />
            </div>
          </div>

          {error && <div className="p-2.5 border border-blaze/40 bg-blaze/5 text-[11px] text-blaze font-bold rounded">{error}</div>}
          {success && <div className="p-2.5 border border-acid/40 bg-acid/5 text-[11px] text-acid font-bold rounded animate-pulse">{success}</div>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 mt-2 bg-acid text-void font-display font-black tracking-widest text-xs rounded shadow-acid hover:shadow-acid-intense active:scale-95 disabled:opacity-50 transition-all"
          >
            {loading ? 'TRANSMITTING_PACKETS...' : isLogin ? 'ESTABLISH_SESSION_LINK' : 'REGISTER_NEW_RUNNER'}
          </button>
        </form>

        {/* Demo Account Quick-Login */}
        <div className="relative my-6 text-center">
          <hr className="border-acid/15" />
          <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-3 bg-sludge text-[9px] text-soft-ash/50">// DEMO_ACCOUNTS //</span>
        </div>

        <div className="space-y-2">
          <p className="text-[9px] text-soft-ash/40 text-center mb-3">
            Pre-seeded accounts — all use password: <span className="text-acid font-bold">password123</span>
          </p>
          {DEMO_ACCOUNTS.map((acc) => (
            <button
              key={acc.email}
              onClick={() => handleDemoLogin(acc.email, acc.password)}
              disabled={loading}
              className={`w-full py-2 bg-void border text-xs font-bold rounded flex items-center justify-between px-4 transition-all duration-200 disabled:opacity-40 ${ROLE_COLORS[acc.role]}`}
            >
              <span className="font-mono text-[10px] opacity-70">{acc.email}</span>
              <span className="font-display tracking-widest text-[10px]">{acc.label} →</span>
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <hr className="border-acid/15" />
          <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-3 bg-sludge text-[9px] text-soft-ash/50">// OR //</span>
        </div>

        {/* Social Google OAuth button */}
        <button
          onClick={handleMockGoogleSSO}
          disabled={loading}
          className="w-full py-2.5 bg-void border border-hazard text-hazard hover:bg-hazard hover:text-void text-xs font-bold rounded flex items-center justify-center gap-2 shadow-hazard hover:shadow-hazard transition-all duration-300"
        >
          <Sparkles className="h-4 w-4" />
          UPLINK VIA GOOGLE_SSO
        </button>

      </div>
    </div>
  );
}
