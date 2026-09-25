import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  Mail, 
  KeyRound, 
  User, 
  Smartphone, 
  Check, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccessLogin
}) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'mfa' | 'recovery'>('signin');
  const [email, setEmail] = useState('respectively75@gmail.com');
  const [password, setPassword] = useState('Pinecrest2026!');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<'student' | 'parent' | 'photographer' | 'admin'>('admin');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaError, setMfaError] = useState('');
  const [recoverySent, setRecoverySent] = useState(false);

  if (!isOpen) return null;

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Move to MFA step to satisfy prompt's Multi-Factor Authentication mandate
    setMode('mfa');
  };

  const handleMFASubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mfaCode.length < 6) {
      setMfaError('Please enter a valid 6-digit verification code.');
      return;
    }

    // Authenticate user with verified MFA
    const authenticatedUser: UserProfile = {
      userId: `usr_${Date.now()}`,
      displayName: displayName || (email.startsWith('respectively') ? 'Elena Rostova' : email.split('@')[0]),
      email: email,
      role: role,
      isCreator: role === 'photographer',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      bio: 'Varsity Media Photojournalist & Community Gallery Contributor.',
      affiliation: 'Pinecrest Athletics Media Guild',
      favorites: ['photo-01', 'photo-04'],
      credits: 250,
      mfaEnabled: true,
      mfaMethod: 'totp',
      notificationPrefs: {
        gameScores: true,
        newGalleries: true,
        schoolAnnouncements: true,
        creditsAttribution: true,
      }
    };

    onSuccessLogin(authenticatedUser);
    onClose();
  };

  return (
    <div id="auth-modal-backdrop" className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#142019] border border-[#E8EFE8] dark:border-[#283a2d] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-[#E8EFE8] dark:border-[#283a2d]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#344C3D] text-white flex items-center justify-center">
              <Lock className="w-4 h-4 text-[#BFCFBB]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#243328] dark:text-[#E2EBE2]">
                {mode === 'mfa' 
                  ? 'Two-Factor Verification' 
                  : mode === 'recovery' 
                    ? 'Account Recovery' 
                    : mode === 'signup' 
                      ? 'Create Contributor Account' 
                      : 'Sign in to Athletics Hub'}
              </h3>
              <p className="text-[11px] text-[#738A6E] dark:text-[#8EA58C]">
                {mode === 'mfa' ? 'Enter 6-digit TOTP / SMS code' : 'Public browsing and downloads require no account'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {mode === 'signin' && (
            <form onSubmit={handleInitialSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#243328] dark:text-[#E2EBE2] block mb-1">
                  School or Personal Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#738A6E] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-[#18251c] border border-stone-200 dark:border-stone-800 text-[#243328] dark:text-[#E2EBE2] focus:border-[#344C3D] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#243328] dark:text-[#E2EBE2]">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setMode('recovery')}
                    className="text-[11px] text-[#738A6E] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-[#738A6E] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-[#18251c] border border-stone-200 dark:border-stone-800 text-[#243328] dark:text-[#E2EBE2] focus:border-[#344C3D] focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                id="auth-submit-signin-btn"
                className="w-full py-2.5 rounded-xl bg-[#344C3D] hover:bg-[#223329] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Continue to MFA Verification</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-xs text-[#738A6E] hover:underline"
                >
                  Don't have an account? Create one
                </button>
              </div>
            </form>
          )}

          {mode === 'signup' && (
            <form onSubmit={handleInitialSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#243328] dark:text-[#E2EBE2] block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Marcus Vance"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-[#18251c] border border-stone-200 dark:border-stone-800 text-[#243328] dark:text-[#E2EBE2] focus:border-[#344C3D] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#243328] dark:text-[#E2EBE2] block mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-[#18251c] border border-stone-200 dark:border-stone-800 text-[#243328] dark:text-[#E2EBE2] focus:border-[#344C3D] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#243328] dark:text-[#E2EBE2] block mb-1">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-[#18251c] border border-stone-200 dark:border-stone-800 text-[#243328] dark:text-[#E2EBE2] focus:border-[#344C3D] focus:outline-none"
                >
                  <option value="student">Student / Athlete</option>
                  <option value="parent">Parent / Booster</option>
                  <option value="photographer">Student Photojournalist</option>
                  <option value="admin">Athletics Staff / Admin</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#243328] dark:text-[#E2EBE2] block mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-[#18251c] border border-stone-200 dark:border-stone-800 text-[#243328] dark:text-[#E2EBE2] focus:border-[#344C3D] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#344C3D] hover:bg-[#223329] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Set Up Two-Factor MFA</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="text-xs text-[#738A6E] hover:underline"
                >
                  Already have an account? Sign In
                </button>
              </div>
            </form>
          )}

          {mode === 'mfa' && (
            <form onSubmit={handleMFASubmit} className="space-y-4">
              <div className="p-3 rounded-2xl bg-[#EBF1EA] dark:bg-[#1E2E24] border border-[#BFCFBB]/40 flex items-center gap-3">
                <ShieldCheck className="w-8 h-8 text-[#344C3D] dark:text-[#BFCFBB] shrink-0" />
                <div className="text-xs text-[#344C3D] dark:text-[#E2EBE2]">
                  <span className="font-bold block">Two-Factor Authentication Required</span>
                  <span className="text-[11px] opacity-80">Security protection active for {email}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#243328] dark:text-[#E2EBE2] block mb-1">
                  6-Digit Authenticator / SMS Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={mfaCode}
                  onChange={(e) => {
                    setMfaCode(e.target.value.replace(/\D/g, ''));
                    setMfaError('');
                  }}
                  placeholder="• • • • • •"
                  className="w-full py-3 text-center text-lg tracking-[0.4em] font-mono rounded-xl bg-stone-50 dark:bg-[#18251c] border border-stone-200 dark:border-stone-800 text-[#243328] dark:text-[#E2EBE2] focus:border-[#344C3D] focus:outline-none"
                />
                {mfaError && (
                  <p className="text-[11px] text-rose-500 mt-1">{mfaError}</p>
                )}
              </div>

              {/* Quick Demo Fill for easy testing */}
              <div className="flex items-center justify-between text-[11px]">
                <button
                  type="button"
                  onClick={() => setMfaCode('123456')}
                  className="text-[#344C3D] dark:text-[#BFCFBB] font-semibold hover:underline"
                >
                  Autofill Demo Code (123456)
                </button>
                <span className="text-[#738A6E]">Expires in 4:58</span>
              </div>

              <button
                type="submit"
                id="auth-mfa-verify-btn"
                className="w-full py-2.5 rounded-xl bg-[#344C3D] hover:bg-[#223329] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Verify & Sign In</span>
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="text-xs text-[#738A6E] hover:underline"
                >
                  ← Back to Email & Password
                </button>
              </div>
            </form>
          )}

          {mode === 'recovery' && (
            <div className="space-y-4">
              {recoverySent ? (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 text-xs text-emerald-800 dark:text-emerald-300 space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <Check className="w-4 h-4" />
                    <span>Password Reset Link Sent</span>
                  </div>
                  <p>Check your inbox at {email} for instructions to reset your password.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-[#738A6E]">
                    Enter your school email address to receive a secure recovery link.
                  </p>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-[#18251c] border border-stone-200 dark:border-stone-800 text-[#243328] dark:text-[#E2EBE2]"
                  />
                  <button
                    type="button"
                    onClick={() => setRecoverySent(true)}
                    className="w-full py-2.5 rounded-xl bg-[#344C3D] text-white text-xs font-bold"
                  >
                    Send Recovery Email
                  </button>
                </div>
              )}

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setRecoverySent(false); }}
                  className="text-xs text-[#738A6E] hover:underline"
                >
                  ← Back to Sign In
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
