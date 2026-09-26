import React, { useState } from 'react';
import {
  X,
  User,
  Camera,
  Upload,
  Check,
  Coins,
  Sparkles,
  ShieldCheck,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  Zap,
  Lock,
  Smartphone,
  Mail,
  KeyRound
} from 'lucide-react';
import { UserProfile } from '../types';
import { DEMO_ACCOUNTS } from '../data/mockData';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserProfile;
  onSwitchUser: (user: UserProfile) => void;
  onNavigateToUpload: () => void;
  onCreateAccount: (newUser: UserProfile) => void;
  onUpdateCredits?: (newAmount: number) => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  currentUser = DEMO_ACCOUNTS[0],
  onSwitchUser,
  onNavigateToUpload,
  onCreateAccount,
  onUpdateCredits
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'credits' | 'switch' | 'register'>('profile');
  const [claimedToday, setClaimedToday] = useState<boolean>(false);
  const [claimFeedback, setClaimFeedback] = useState<string | null>(null);

  // Google Account + 2-Factor Authentication (2FA) state for BOTH Creator and Viewer accounts
  const [accountType, setAccountType] = useState<'general' | 'creator'>('creator');
  const [authStep, setAuthStep] = useState<'google_details' | 'two_factor'>('google_details');
  const [googleName, setGoogleName] = useState('');
  const [googleEmail, setGoogleEmail] = useState('');
  const [googlePassword, setGooglePassword] = useState('');
  const [newCamera, setNewCamera] = useState('Canon EOS Kiss F');
  const [newLens, setNewLens] = useState('18-55mm IS Kit Lens');
  const [newAffiliation, setNewAffiliation] = useState('Pinisara Photography · Pinnawala Central College');
  const [newBio, setNewBio] = useState('');

  // 2FA verification state (used for both new Creator/Viewer accounts and switching accounts)
  const [pendingSwitchAccount, setPendingSwitchAccount] = useState<UserProfile | null>(null);
  const [twoFactorMethod, setTwoFactorMethod] = useState<'totp' | 'sms'>('totp');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorError, setTwoFactorError] = useState('');
  const [googleAuthError, setGoogleAuthError] = useState('');

  if (!isOpen) return null;

  const currentCredits = currentUser?.credits ?? 0;

  const handleClaimDailyCredits = () => {
    if (claimedToday) return;
    const bonus = 25;
    const newTotal = currentCredits + bonus;
    if (onUpdateCredits) {
      onUpdateCredits(newTotal);
    } else {
      currentUser.credits = newTotal;
    }
    setClaimedToday(true);
    setClaimFeedback(`+${bonus} Credits added to your balance!`);
    setTimeout(() => setClaimFeedback(null), 3500);
  };

  // Step 1: Validate Google Account Details before proceeding to mandatory 2FA
  const handleProceedTo2FA = (e: React.FormEvent) => {
    e.preventDefault();
    setGoogleAuthError('');

    const cleanEmail = googleEmail.trim().toLowerCase();
    if (!googleName.trim() || !cleanEmail) {
      setGoogleAuthError('Please enter your Google Account name and email address.');
      return;
    }
    if (!cleanEmail.includes('@')) {
      setGoogleAuthError('Please enter a valid Google Account email (e.g. name@gmail.com).');
      return;
    }
    if (googlePassword.trim().length < 4) {
      setGoogleAuthError('Please enter your Google Account password to continue to 2FA.');
      return;
    }

    setTwoFactorCode('');
    setTwoFactorError('');
    setAuthStep('two_factor');
  };

  // Step 2: Complete 2-Factor Authentication for Creator or Viewer account
  const handleVerify2FAAndComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (twoFactorCode.trim().length < 6) {
      setTwoFactorError('Please enter your 6-digit 2-Factor Authentication code.');
      return;
    }

    if (pendingSwitchAccount) {
      const verifiedSwitchUser: UserProfile = {
        ...pendingSwitchAccount,
        mfaEnabled: true,
        mfaMethod: twoFactorMethod
      };
      onSwitchUser(verifiedSwitchUser);
      setPendingSwitchAccount(null);
      setTwoFactorCode('');
      setTwoFactorError('');
      setActiveTab('profile');
      return;
    }

    const isCreator = accountType === 'creator';
    const newUser: UserProfile = {
      userId: `usr_google_${Date.now()}`,
      displayName: googleName.trim(),
      email: googleEmail.trim(),
      role: isCreator ? 'photographer' : 'student',
      isCreator,
      camera: isCreator ? newCamera.trim() : undefined,
      lens: isCreator ? newLens.trim() : undefined,
      bio:
        newBio.trim() ||
        (isCreator
          ? `Student photographer shooting with ${newCamera} at Pinnawala Central College`
          : 'Verified Google Account community viewer at Pinnawala Central College'),
      affiliation:
        newAffiliation.trim() ||
        (isCreator ? 'Pinisara Photography Society' : 'Pinnawala Central College Viewer'),
      favorites: [],
      uploadedCount: 0,
      credits: isCreator ? 300 : 100,
      mfaEnabled: true,
      mfaMethod: twoFactorMethod
    };

    onCreateAccount(newUser);
    setAuthStep('google_details');
    setTwoFactorCode('');
    setTwoFactorError('');
    setActiveTab('profile');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div
      id="account-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/70 dark:bg-black/85 backdrop-blur-2xl flex items-center justify-center p-4 animate-apple-fade-in"
      onClick={onClose}
    >
      <div
        id="account-modal-dialog"
        className="liquid-glass rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-apple-scale-in text-stone-900 dark:text-white relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Tabs with Liquid Glass Segmented Control */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-stone-200/80 dark:border-white/15">
          <div className="flex items-center gap-1 p-1 glass-pill rounded-full text-xs font-medium">
            <button
              id="tab-account-profile"
              onClick={() => {
                setPendingSwitchAccount(null);
                setActiveTab('profile');
              }}
              className={`px-3 py-1.5 rounded-full transition-all duration-300 ${
                activeTab === 'profile'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs font-semibold'
                  : 'text-stone-600 dark:text-white/70 hover:text-black dark:hover:text-white'
              }`}
            >
              Account
            </button>
            <button
              id="tab-account-credits"
              onClick={() => {
                setPendingSwitchAccount(null);
                setActiveTab('credits');
              }}
              className={`px-3 py-1.5 rounded-full flex items-center gap-1 transition-all duration-300 ${
                activeTab === 'credits'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs font-semibold'
                  : 'text-stone-600 dark:text-white/70 hover:text-black dark:hover:text-white'
              }`}
            >
              <Coins className="w-3 h-3" />
              <span>Credits ({currentCredits})</span>
            </button>
            <button
              id="tab-account-switch"
              onClick={() => {
                setPendingSwitchAccount(null);
                setActiveTab('switch');
              }}
              className={`px-3 py-1.5 rounded-full transition-all duration-300 ${
                activeTab === 'switch'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs font-semibold'
                  : 'text-stone-600 dark:text-white/70 hover:text-black dark:hover:text-white'
              }`}
            >
              Switch (2FA)
            </button>
            <button
              id="tab-account-register"
              onClick={() => {
                setPendingSwitchAccount(null);
                setAuthStep('google_details');
                setActiveTab('register');
              }}
              className={`px-3 py-1.5 rounded-full transition-all duration-300 ${
                activeTab === 'register'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs font-semibold'
                  : 'text-stone-600 dark:text-white/70 hover:text-black dark:hover:text-white'
              }`}
            >
              + Google 2FA
            </button>
          </div>

          <button
            id="close-account-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-500 hover:text-black dark:text-white/70 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Tab 1: Current Account View (Shows Google Account + 2FA Status for both Creator & Viewer) */}
        {activeTab === 'profile' && (
          <div className="p-6 space-y-5 animate-apple-fade-in">
            {/* User Identity Card */}
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-coolvetica text-xl font-bold shrink-0 shadow-md">
                {getInitials(currentUser.displayName)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-source-serif font-semibold text-xl text-stone-900 dark:text-white truncate">
                    {currentUser?.displayName || 'User'}
                  </h2>
                  {currentUser?.isCreator ? (
                    <span className="px-2.5 py-0.5 rounded-full glass-pill text-stone-900 dark:text-white text-[10px] font-mono font-semibold uppercase tracking-wider flex items-center gap-1">
                      <Camera className="w-3 h-3" />
                      Creator Account
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full glass-pill text-stone-800 dark:text-white text-[10px] font-mono font-semibold uppercase tracking-wider flex items-center gap-1">
                      <User className="w-3 h-3" />
                      Viewer Account
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-500 dark:text-white/70 font-mono mt-0.5 truncate">
                  Google Account: {currentUser?.email || 'verified@gmail.com'}
                </p>
                <p className="text-xs text-stone-600 dark:text-white/80 mt-2 line-clamp-2">
                  {currentUser?.bio || ''}
                </p>
              </div>
            </div>

            {/* Google Account + 2-Factor Authentication Security Badge (For BOTH Creator and Viewer) */}
            <div className="p-4 rounded-2xl glass-pill space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-white shrink-0" />
                  <span className="text-xs font-semibold text-stone-900 dark:text-white">
                    Google Account & 2-Factor Authentication
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-black text-white dark:bg-white dark:text-black text-[10px] font-mono font-bold">
                  2FA VERIFIED ✓
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-mono text-stone-600 dark:text-white/75">
                <div className="p-2 rounded-xl bg-white/60 dark:bg-white/5 border border-stone-200/60 dark:border-white/10">
                  <span className="block text-[9px] uppercase opacity-60">Google Identity</span>
                  <span className="font-semibold truncate block text-stone-900 dark:text-white">
                    {currentUser.email}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-white/60 dark:bg-white/5 border border-stone-200/60 dark:border-white/10">
                  <span className="block text-[9px] uppercase opacity-60">2FA Protection</span>
                  <span className="font-semibold block text-stone-900 dark:text-white">
                    {currentUser.isCreator ? 'Creator 2FA (TOTP)' : 'Viewer 2FA (TOTP)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Credits Balance Glance */}
            <div
              onClick={() => setActiveTab('credits')}
              className="p-4 rounded-2xl glass-pill flex items-center justify-between cursor-pointer hover:scale-[1.01] transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-stone-900 dark:text-white">Credits Balance</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-stone-200 dark:bg-white/15 text-stone-900 dark:text-white font-mono font-bold">
                      Active
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-white/65">
                    Earn credits on every photo you publish
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono text-xl font-bold text-stone-900 dark:text-white">
                  {currentCredits}
                </span>
                <span className="text-[10px] text-stone-400 dark:text-white/55 block font-mono">
                  View wallet →
                </span>
              </div>
            </div>

            {/* Creator Equipment Card (if creator) */}
            {currentUser?.isCreator ? (
              <div className="p-4 rounded-2xl glass-pill space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[11px] font-semibold text-stone-700 dark:text-white/80 uppercase tracking-wider flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5" />
                    Camera / Phone
                  </span>
                  <span className="font-mono text-stone-900 dark:text-white font-bold bg-white/80 dark:bg-white/10 px-2.5 py-0.5 rounded-md border border-stone-200 dark:border-white/20">
                    {currentUser?.camera || 'Canon DSLR'}
                  </span>
                </div>
                {currentUser?.lens && (
                  <div className="text-[11px] text-stone-600 dark:text-white/75 font-mono">
                    <span className="opacity-70">Lens: </span>
                    {currentUser.lens}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-2xl glass-pill text-xs text-stone-600 dark:text-white/75 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-stone-900 dark:text-white">Account Mode:</span>
                  <span className="font-mono">Verified Viewer (Google + 2FA)</span>
                </div>
                <p className="text-[11px]">
                  Your Viewer account is secured with Google Account details and 2-Factor Authentication. To publish photos, switch to or register a Creator Account.
                </p>
              </div>
            )}

            {/* Upload Action Button for Creators */}
            {currentUser?.isCreator ? (
              <button
                id="account-upload-action-btn"
                onClick={() => {
                  onClose();
                  onNavigateToUpload();
                }}
                className="w-full py-3 px-4 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-semibold text-xs flex items-center justify-center gap-2 shadow-md hover:opacity-90 transition-all"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Photos to Pinisara Gallery (+50 cr)</span>
              </button>
            ) : (
              <div className="p-3.5 rounded-2xl glass-pill flex items-center justify-between gap-3">
                <div className="text-xs">
                  <p className="font-semibold text-stone-900 dark:text-white">Want to upload photos?</p>
                  <p className="text-[11px] text-stone-500 dark:text-white/65">
                    Sign in with a Google + 2FA Creator Account.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('switch')}
                  className="px-3.5 py-1.5 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-semibold shrink-0"
                >
                  Switch Account
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Credits Balance */}
        {activeTab === 'credits' && (
          <div className="p-6 space-y-5 animate-apple-fade-in">
            <div className="rounded-3xl p-6 bg-black text-white relative overflow-hidden shadow-xl border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-white/15 text-white flex items-center justify-center">
                    <Coins className="w-4 h-4" />
                  </div>
                  <span className="font-mono text-xs uppercase tracking-wider text-white/80 font-semibold">
                    Pinisara Pass · Google 2FA Secured
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-white/15 text-white text-[10px] font-mono">
                  {currentUser.isCreator ? 'Creator Tier' : 'Viewer Tier'}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-white/60 font-mono uppercase tracking-wider">
                  Available Credits Balance
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-4xl sm:text-5xl font-bold tracking-tight text-white">
                    {currentCredits}
                  </span>
                  <span className="text-white/80 font-mono text-sm font-semibold">CREDITS</span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-white/15 flex items-center justify-between text-xs text-white/70">
                <span>Google: {currentUser.email}</span>
                <span className="font-mono text-[10px]">2FA Active</span>
              </div>
            </div>

            <div>
              <button
                onClick={handleClaimDailyCredits}
                disabled={claimedToday}
                className={`w-full py-3 px-4 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  claimedToday
                    ? 'glass-pill text-stone-400 dark:text-white/40 cursor-default'
                    : 'bg-black dark:bg-white text-white dark:text-black shadow-md'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {claimedToday ? 'Daily Bonus Claimed ✓' : 'Claim Daily Bonus (+25 Credits)'}
                </span>
              </button>
              {claimFeedback && (
                <p className="text-xs text-center text-stone-900 dark:text-white font-medium mt-2 animate-apple-fade-in">
                  {claimFeedback}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-2xl glass-pill space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-[11px]">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Publishing Photos</span>
                </div>
                <p className="text-[11px] text-stone-600 dark:text-white/70">
                  +50 Credits awarded for each photo uploaded by a verified Creator.
                </p>
              </div>

              <div className="p-3 rounded-2xl glass-pill space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-[11px]">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Free Downloads</span>
                </div>
                <p className="text-[11px] text-stone-600 dark:text-white/70">
                  Always 0 credits for students and teachers to download any photo.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Switch Account (Requires 2-Factor Verification for both Creator & Viewer accounts) */}
        {activeTab === 'switch' && (
          <div className="p-6 space-y-4 max-h-[460px] overflow-y-auto animate-apple-fade-in">
            {!pendingSwitchAccount ? (
              <>
                <div className="text-xs text-stone-600 dark:text-white/75">
                  Select a **Creator** or **Viewer** Google Account below. Switching requires **2-Factor Authentication (2FA)** verification:
                </div>

                <div className="space-y-2">
                  {DEMO_ACCOUNTS.map((acc) => {
                    const isSelected = acc.userId === currentUser.userId;
                    return (
                      <button
                        key={acc.userId}
                        onClick={() => {
                          if (isSelected) {
                            setActiveTab('profile');
                          } else {
                            setPendingSwitchAccount(acc);
                            setTwoFactorCode('');
                            setTwoFactorError('');
                          }
                        }}
                        className={`w-full p-3.5 rounded-2xl text-left border flex items-center justify-between gap-3 transition-all ${
                          isSelected
                            ? 'border-black dark:border-white bg-black/5 dark:bg-white/15'
                            : 'glass-pill hover:border-stone-400 dark:hover:border-white/40'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-coolvetica text-sm font-bold shrink-0">
                            {getInitials(acc.displayName)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-xs text-stone-900 dark:text-white truncate">
                                {acc.displayName}
                              </span>
                              <span className="font-mono text-[9px] px-2 py-0.5 rounded-full glass-pill font-semibold">
                                {acc.isCreator ? 'Creator · 2FA' : 'Viewer · 2FA'}
                              </span>
                            </div>
                            <div className="text-[11px] text-stone-500 dark:text-white/65 font-mono truncate">
                              {acc.email} · {acc.isCreator ? acc.camera : 'Community Viewer'}
                            </div>
                          </div>
                        </div>

                        {isSelected ? (
                          <div className="w-6 h-6 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <span className="text-xs font-mono font-semibold underline shrink-0">
                            Verify 2FA →
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setPendingSwitchAccount(null);
                      setAuthStep('google_details');
                      setActiveTab('register');
                    }}
                    className="w-full py-2.5 px-4 rounded-xl border border-dashed border-stone-300 dark:border-white/30 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-white/40 dark:hover:bg-white/10 transition-all"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Connect Another Google Account (Creator or Viewer)</span>
                  </button>
                </div>
              </>
            ) : (
              /* 2FA Challenge when Switching to a Creator or Viewer Account */
              <form onSubmit={handleVerify2FAAndComplete} className="space-y-4">
                <div className="p-4 rounded-2xl glass-pill flex items-start gap-3">
                  <ShieldCheck className="w-6 h-6 text-stone-900 dark:text-white shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <span className="font-bold block text-stone-900 dark:text-white">
                      2-Factor Authentication Required ({pendingSwitchAccount.isCreator ? 'Creator' : 'Viewer'})
                    </span>
                    <span className="text-[11px] text-stone-600 dark:text-white/75 block">
                      Google Account: <strong>{pendingSwitchAccount.email}</strong>
                    </span>
                    <span className="text-[11px] text-stone-500 dark:text-white/65 block">
                      Enter the 6-digit verification code from your Google Authenticator app or SMS.
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-stone-500 dark:text-white/70 mb-1.5">
                    6-Digit 2FA Verification Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={twoFactorCode}
                    onChange={(e) => {
                      setTwoFactorCode(e.target.value.replace(/\D/g, ''));
                      setTwoFactorError('');
                    }}
                    placeholder="• • • • • •"
                    className="w-full py-3 text-center text-lg tracking-[0.4em] font-mono rounded-2xl glass-pill text-stone-900 dark:text-white focus:outline-none"
                  />
                  {twoFactorError && (
                    <p className="text-[11px] text-rose-500 mt-1">{twoFactorError}</p>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      setTwoFactorCode('123456');
                      setTwoFactorError('');
                    }}
                    className="font-mono font-semibold underline text-stone-900 dark:text-white"
                  >
                    Autofill 2FA Code (123456)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingSwitchAccount(null)}
                    className="text-stone-500 dark:text-white/60 hover:underline"
                  >
                    ← Back to accounts
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-2xl bg-black dark:bg-white text-white dark:text-black text-xs font-semibold flex items-center justify-center gap-2 shadow-md"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Verify 2FA & Switch to {pendingSwitchAccount.displayName}</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* Tab 4: Secure Google Account + 2-Factor Authentication Setup (For Creator AND Viewer) */}
        {activeTab === 'register' && (
          <div className="p-6 space-y-4 max-h-[480px] overflow-y-auto animate-apple-fade-in">
            {/* Step Indicator */}
            <div className="flex items-center justify-between text-[11px] font-mono pb-2 border-b border-stone-200/70 dark:border-white/15">
              <span className={authStep === 'google_details' ? 'font-bold text-stone-900 dark:text-white' : 'opacity-60'}>
                1. Google Account Details
              </span>
              <span>→</span>
              <span className={authStep === 'two_factor' ? 'font-bold text-stone-900 dark:text-white' : 'opacity-60'}>
                2. 2-Factor Authentication (2FA)
              </span>
            </div>

            {authStep === 'google_details' ? (
              <form onSubmit={handleProceedTo2FA} className="space-y-3.5">
                {/* Account Type Selector: Creator vs Viewer (Both require Google + 2FA) */}
                <div className="grid grid-cols-2 gap-2 p-1 glass-pill rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setAccountType('creator')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      accountType === 'creator'
                        ? 'bg-black dark:bg-white text-white dark:text-black shadow-xs'
                        : 'text-stone-600 dark:text-white/70'
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Creator (Google + 2FA)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountType('general')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      accountType === 'general'
                        ? 'bg-black dark:bg-white text-white dark:text-black shadow-xs'
                        : 'text-stone-600 dark:text-white/70'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Viewer (Google + 2FA)</span>
                  </button>
                </div>

                {/* Quick Fill Demo Google Account Button */}
                <div className="flex items-center justify-between p-2.5 rounded-2xl glass-pill text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-white text-black font-bold flex items-center justify-center text-xs shadow-2xs border border-stone-200">
                      G
                    </div>
                    <span className="text-[11px] font-medium">
                      Google Account Sign-In ({accountType === 'creator' ? 'Creator' : 'Viewer'})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setGoogleName(accountType === 'creator' ? 'Hasaranga Jayawardhana' : 'Nethmi Perera');
                      setGoogleEmail(
                        accountType === 'creator'
                          ? 'hasaranga.pinisara@gmail.com'
                          : 'nethmi.viewer@gmail.com'
                      );
                      setGooglePassword('Pinnawala2026!');
                      setGoogleAuthError('');
                    }}
                    className="text-[11px] font-mono font-semibold underline"
                  >
                    Autofill Google Details
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-stone-500 dark:text-white/70 mb-1">
                      Google Account Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-60" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Kasun Bandara"
                        value={googleName}
                        onChange={(e) => setGoogleName(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl glass-pill text-stone-900 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-stone-500 dark:text-white/70 mb-1">
                      Google Account Email (@gmail.com) *
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-60" />
                      <input
                        type="email"
                        required
                        placeholder="yourname@gmail.com"
                        value={googleEmail}
                        onChange={(e) => setGoogleEmail(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl glass-pill text-stone-900 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-stone-500 dark:text-white/70 mb-1">
                      Google Account Password *
                    </label>
                    <div className="relative">
                      <KeyRound className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-60" />
                      <input
                        type="password"
                        required
                        placeholder="Enter Google password"
                        value={googlePassword}
                        onChange={(e) => setGooglePassword(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl glass-pill text-stone-900 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Creator Specific Camera Fields */}
                  {accountType === 'creator' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-mono uppercase text-stone-500 dark:text-white/70 mb-1">
                          Camera or Phone *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Canon 2000D / iPhone 13"
                          value={newCamera}
                          onChange={(e) => setNewCamera(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl glass-pill text-stone-900 dark:text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono uppercase text-stone-500 dark:text-white/70 mb-1">
                          Lens / Setup
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 50mm f/1.8 STM"
                          value={newLens}
                          onChange={(e) => setNewLens(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl glass-pill text-stone-900 dark:text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {googleAuthError && (
                  <p className="text-[11px] text-rose-500 font-medium">{googleAuthError}</p>
                )}

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-2xl bg-black dark:bg-white text-white dark:text-black text-xs font-semibold flex items-center justify-center gap-2 shadow-md"
                >
                  <span>Continue to Step 2: 2-Factor Authentication</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              /* Step 2: Mandatory 2-Factor Authentication for Creator or Viewer */
              <form onSubmit={handleVerify2FAAndComplete} className="space-y-4">
                <div className="p-4 rounded-2xl glass-pill space-y-1.5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-stone-900 dark:text-white" />
                    <span className="text-xs font-bold text-stone-900 dark:text-white">
                      Step 2: Verify 2-Factor Authentication ({accountType === 'creator' ? 'Creator' : 'Viewer'})
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 dark:text-white/75">
                    Google Account: <strong>{googleEmail}</strong>
                  </p>
                  <p className="text-[11px] text-stone-500 dark:text-white/65">
                    Both Creator and Viewer accounts require 2-step verification to keep our school gallery safe.
                  </p>
                </div>

                {/* Choose 2FA Method */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTwoFactorMethod('totp')}
                    className={`p-2.5 rounded-xl text-xs font-mono flex items-center justify-center gap-1.5 border ${
                      twoFactorMethod === 'totp'
                        ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-semibold'
                        : 'glass-pill'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Google Authenticator</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTwoFactorMethod('sms')}
                    className={`p-2.5 rounded-xl text-xs font-mono flex items-center justify-center gap-1.5 border ${
                      twoFactorMethod === 'sms'
                        ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-semibold'
                        : 'glass-pill'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>SMS / Phone Code</span>
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-stone-500 dark:text-white/70 mb-1.5">
                    Enter 6-Digit 2FA Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={twoFactorCode}
                    onChange={(e) => {
                      setTwoFactorCode(e.target.value.replace(/\D/g, ''));
                      setTwoFactorError('');
                    }}
                    placeholder="• • • • • •"
                    className="w-full py-3 text-center text-lg tracking-[0.4em] font-mono rounded-2xl glass-pill text-stone-900 dark:text-white focus:outline-none"
                  />
                  {twoFactorError && (
                    <p className="text-[11px] text-rose-500 mt-1">{twoFactorError}</p>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      setTwoFactorCode('123456');
                      setTwoFactorError('');
                    }}
                    className="font-mono font-semibold underline text-stone-900 dark:text-white"
                  >
                    Autofill 2FA Code (123456)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthStep('google_details')}
                    className="text-stone-500 dark:text-white/60 hover:underline"
                  >
                    ← Edit Google Account
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-2xl bg-black dark:bg-white text-white dark:text-black text-xs font-semibold flex items-center justify-center gap-2 shadow-md"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    Complete 2FA & Activate {accountType === 'creator' ? 'Creator' : 'Viewer'} Account
                  </span>
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
