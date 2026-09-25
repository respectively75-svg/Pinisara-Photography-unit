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
  ExternalLink,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  Award,
  Zap
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

  // Register New Account form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [accountType, setAccountType] = useState<'general' | 'creator'>('creator');
  const [newCamera, setNewCamera] = useState('Canon EOS R50');
  const [newLens, setNewLens] = useState('18-45mm f/4.5-6.3 IS STM');
  const [newAffiliation, setNewAffiliation] = useState('Pinisara Media Club');
  const [newBio, setNewBio] = useState('');

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

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    const isCreator = accountType === 'creator';
    const newUser: UserProfile = {
      userId: `usr_${Date.now()}`,
      displayName: newName.trim(),
      email: newEmail.trim(),
      role: isCreator ? 'photographer' : 'student',
      isCreator,
      camera: isCreator ? newCamera.trim() : undefined,
      lens: isCreator ? newLens.trim() : undefined,
      bio: newBio.trim() || (isCreator ? `Photojournalist shooting with ${newCamera}` : 'Sports enthusiast and student gallery supporter'),
      affiliation: newAffiliation.trim() || (isCreator ? 'Pinisara Photographers' : 'Student Supporter'),
      favorites: [],
      uploadedCount: 0,
      credits: isCreator ? 300 : 100
    };

    onCreateAccount(newUser);
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
      className="fixed inset-0 z-50 bg-black/60 dark:bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-apple-fade-in"
      onClick={onClose}
    >
      <div 
        id="account-modal-dialog"
        className="ultra-glass rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-apple-scale-in text-stone-900 dark:text-stone-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Tabs with Apple Segmented Control */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-stone-100 dark:border-white/10">
          <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-800/80 rounded-full text-xs font-medium">
            <button
              id="tab-account-profile"
              onClick={() => setActiveTab('profile')}
              className={`px-3 py-1.5 rounded-full transition-all duration-200 ${
                activeTab === 'profile'
                  ? 'bg-white dark:bg-stone-950 text-stone-900 dark:text-white shadow-xs font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              Account
            </button>
            <button
              id="tab-account-credits"
              onClick={() => setActiveTab('credits')}
              className={`px-3 py-1.5 rounded-full flex items-center gap-1 transition-all duration-200 ${
                activeTab === 'credits'
                  ? 'bg-white dark:bg-stone-950 text-amber-900 dark:text-amber-300 shadow-xs font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <Coins className="w-3 h-3 text-amber-500" />
              <span>Credits ({currentCredits})</span>
            </button>
            <button
              id="tab-account-switch"
              onClick={() => setActiveTab('switch')}
              className={`px-3 py-1.5 rounded-full transition-all duration-200 ${
                activeTab === 'switch'
                  ? 'bg-white dark:bg-stone-950 text-stone-900 dark:text-white shadow-xs font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              Switch
            </button>
            <button
              id="tab-account-register"
              onClick={() => setActiveTab('register')}
              className={`px-3 py-1.5 rounded-full transition-all duration-200 ${
                activeTab === 'register'
                  ? 'bg-white dark:bg-stone-950 text-stone-900 dark:text-white shadow-xs font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              + New
            </button>
          </div>

          <button
            id="close-account-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Tab 1: Current Account View */}
        {activeTab === 'profile' && (
          <div className="p-6 space-y-5 animate-apple-fade-in">
            {/* User Identity Card */}
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-black dark:bg-stone-800 text-white flex items-center justify-center font-coolvetica text-xl font-bold shrink-0 shadow-xs">
                {getInitials(currentUser.displayName)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-source-serif font-semibold text-xl text-stone-900 dark:text-white truncate">
                    {currentUser?.displayName || 'User'}
                  </h2>
                  {currentUser?.isCreator ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100/90 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-mono font-semibold uppercase tracking-wider flex items-center gap-1 border border-emerald-300/40 dark:border-emerald-700/40">
                      <Camera className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                      Creator
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-[10px] font-mono font-semibold uppercase tracking-wider flex items-center gap-1">
                      <User className="w-3 h-3 text-stone-600 dark:text-stone-400" />
                      Public Viewer
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 font-mono mt-0.5 truncate">
                  {currentUser?.email || ''}
                </p>
                <p className="text-xs text-stone-600 dark:text-stone-300 mt-2 line-clamp-2">
                  {currentUser?.bio || ''}
                </p>
              </div>
            </div>

            {/* Apple Wallet Style Credits Balance Glance */}
            <div 
              onClick={() => setActiveTab('credits')}
              className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/50 dark:border-amber-500/20 flex items-center justify-between cursor-pointer hover:border-amber-400 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 dark:bg-amber-500/30 flex items-center justify-center text-amber-700 dark:text-amber-300">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-stone-900 dark:text-white">Credits Balance</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-mono font-bold">Active</span>
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    Earn credits on every 4K capture you publish
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono text-xl font-bold text-amber-900 dark:text-amber-300">
                  {currentCredits}
                </span>
                <span className="text-[10px] text-stone-400 dark:text-stone-500 block font-mono">
                  View wallet →
                </span>
              </div>
            </div>

            {/* Creator Equipment Card (if creator) */}
            {currentUser?.isCreator ? (
              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/40 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[11px] font-semibold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                    Assigned Camera Body
                  </span>
                  <span className="font-mono text-emerald-800 dark:text-emerald-200 font-bold bg-white dark:bg-stone-900 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                    {currentUser?.camera || 'Standard DSLR'}
                  </span>
                </div>
                {currentUser?.lens && (
                  <div className="text-[11px] text-emerald-950 dark:text-emerald-200 font-mono">
                    <span className="text-emerald-700 dark:text-emerald-400">Optics: </span>{currentUser.lens}
                  </div>
                )}
                <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-between text-xs">
                  <span className="text-emerald-800 dark:text-emerald-400">Affiliation:</span>
                  <span className="font-medium text-emerald-950 dark:text-emerald-200">{currentUser?.affiliation}</span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-white/10 text-xs text-stone-600 dark:text-stone-300 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-stone-800 dark:text-stone-200">Account Type:</span>
                  <span className="font-mono text-stone-600 dark:text-stone-400">Free Community Viewer</span>
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  You can browse, favorite, and download uncompressed 4K captures freely. To upload and publish captures, switch to or create a Creator Account.
                </p>
              </div>
            )}

            {/* Upload Action Button for Creators */}
            {currentUser?.isCreator ? (
              <div className="space-y-2">
                <button
                  id="account-upload-action-btn"
                  onClick={() => {
                    onClose();
                    onNavigateToUpload();
                  }}
                  className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors active:scale-98"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Captures to Pinisara Gallery (+50 cr)</span>
                </button>
                <p className="text-[11px] text-center text-stone-400 dark:text-stone-500">
                  New uploads will be attributed directly to {currentUser.displayName} ({currentUser.camera}).
                </p>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/40 flex items-center justify-between gap-3">
                <div className="text-xs">
                  <p className="font-semibold text-emerald-950 dark:text-emerald-200">Are you a club photographer?</p>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400">Switch to a Creator Account to publish your photo sets.</p>
                </div>
                <button
                  onClick={() => setActiveTab('switch')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-700 dark:bg-emerald-600 text-white text-xs font-semibold shrink-0 hover:bg-emerald-800 transition-colors"
                >
                  Switch Now
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Credits Balance & Apple Wallet View */}
        {activeTab === 'credits' && (
          <div className="p-6 space-y-5 animate-apple-fade-in">
            {/* Apple Card Style Credits Header */}
            <div className="rounded-3xl p-6 bg-gradient-to-br from-stone-900 to-black text-white relative overflow-hidden shadow-xl border border-white/10">
              <div className="absolute top-0 right-0 w-44 h-44 bg-amber-500/15 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Coins className="w-4 h-4" />
                  </div>
                  <span className="font-mono text-xs uppercase tracking-wider text-stone-300 font-semibold">
                    Pinisara Pass
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-stone-200 text-[10px] font-mono">
                  {currentUser.isCreator ? 'Creator Tier' : 'Viewer Tier'}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-stone-400 font-mono uppercase tracking-wider">
                  Available Credits Balance
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-4xl sm:text-5xl font-bold tracking-tight text-white">
                    {currentCredits}
                  </span>
                  <span className="text-amber-400 font-mono text-sm font-semibold">
                    CREDITS
                  </span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-stone-400">
                <span>Holder: {currentUser.displayName}</span>
                <span className="font-mono text-[10px]">ID: {currentUser.userId}</span>
              </div>
            </div>

            {/* Daily Bonus Claim Button */}
            <div>
              <button
                onClick={handleClaimDailyCredits}
                disabled={claimedToday}
                className={`w-full py-3 px-4 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  claimedToday 
                    ? 'bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500 cursor-default'
                    : 'bg-amber-500 hover:bg-amber-600 text-stone-950 shadow-md active:scale-98'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>{claimedToday ? 'Daily Bonus Claimed for Today ✓' : 'Claim Daily Creator Bonus (+25 Credits)'}</span>
              </button>
              {claimFeedback && (
                <p className="text-xs text-center text-emerald-600 dark:text-emerald-400 font-medium mt-2 animate-apple-fade-in">
                  {claimFeedback}
                </p>
              )}
            </div>

            {/* Credits Rules & Utility */}
            <div className="space-y-2 text-xs">
              <span className="font-mono text-[11px] text-stone-500 dark:text-stone-400 uppercase tracking-wider font-semibold block">
                How Credits Work
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-white/10 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold text-[11px]">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Publishing 4K Photo</span>
                  </div>
                  <p className="text-[11px] text-stone-600 dark:text-stone-400">
                    +50 Credits awarded upon publishing a high-res capture to the public archive.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-white/10 space-y-1">
                  <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400 font-semibold text-[11px]">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Free Community Downloads</span>
                  </div>
                  <p className="text-[11px] text-stone-600 dark:text-stone-400">
                    Always 0 credits for students, athletes, and families to download original 4K files.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Switch Account */}
        {activeTab === 'switch' && (
          <div className="p-6 space-y-4 max-h-[420px] overflow-y-auto animate-apple-fade-in">
            <div className="text-xs text-stone-500 dark:text-stone-400">
              Select an existing Pinisara Photographers creator or public account:
            </div>

            <div className="space-y-2">
              {DEMO_ACCOUNTS.map((acc) => {
                const isSelected = acc.userId === currentUser.userId;
                return (
                  <button
                    key={acc.userId}
                    onClick={() => {
                      onSwitchUser(acc);
                      setActiveTab('profile');
                    }}
                    className={`w-full p-3.5 rounded-2xl text-left border flex items-center justify-between gap-3 transition-all ${
                      isSelected
                        ? 'border-stone-900 dark:border-white bg-stone-50 dark:bg-stone-800/80 ring-1 ring-black dark:ring-white'
                        : 'border-stone-200 dark:border-white/10 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-stone-50/50 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-coolvetica text-sm font-bold shrink-0 ${
                        acc.isCreator ? 'bg-black dark:bg-stone-700 text-white' : 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                      }`}>
                        {getInitials(acc.displayName)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-xs text-stone-900 dark:text-white truncate">
                            {acc.displayName}
                          </span>
                          {acc.isCreator && (
                            <span className="font-mono text-[9px] px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded font-medium">
                              Creator
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-stone-500 dark:text-stone-400 font-mono truncate">
                          {acc.isCreator ? acc.camera : 'Public Account'} · {acc.credits ?? 0} cr
                        </div>
                      </div>
                    </div>

                    {isSelected ? (
                      <div className="w-6 h-6 rounded-full bg-black dark:bg-white text-white dark:text-stone-900 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                        Select
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-2">
              <button
                onClick={() => setActiveTab('register')}
                className="w-full py-2.5 px-4 rounded-xl border border-dashed border-stone-300 dark:border-stone-700 hover:border-black dark:hover:border-white text-xs font-semibold text-stone-700 dark:text-stone-300 hover:text-black dark:hover:text-white flex items-center justify-center gap-2 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create a New Account</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 4: Create / Register New Account */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="p-6 space-y-4 max-h-[460px] overflow-y-auto animate-apple-fade-in">
            <div className="text-xs text-stone-600 dark:text-stone-400">
              Create a new public account or photographer creator profile with photo uploading privileges and starter credits.
            </div>

            {/* Account Type Selector */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 dark:bg-stone-800 rounded-2xl">
              <button
                type="button"
                onClick={() => setAccountType('creator')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  accountType === 'creator'
                    ? 'bg-black dark:bg-white text-white dark:text-stone-900 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-black dark:hover:text-white'
                }`}
              >
                <Camera className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
                <span>Creator (+300 cr)</span>
              </button>
              <button
                type="button"
                onClick={() => setAccountType('general')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  accountType === 'general'
                    ? 'bg-black dark:bg-white text-white dark:text-stone-900 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-black dark:hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Viewer (+100 cr)</span>
              </button>
            </div>

            {/* Name and Email */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono uppercase text-stone-500 dark:text-stone-400 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kasun Bandara"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white focus:bg-white dark:focus:bg-stone-900 focus:border-black dark:focus:border-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-stone-500 dark:text-stone-400 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="kasun@pinisara.org"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white focus:bg-white dark:focus:bg-stone-900 focus:border-black dark:focus:border-white focus:outline-none"
                />
              </div>

              {/* Creator Specific Fields */}
              {accountType === 'creator' && (
                <>
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-stone-500 dark:text-stone-400 mb-1">
                      Camera Model (Used for metadata & attribution)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sony A7 III, Canon R50, iPhone 14 Pro"
                      value={newCamera}
                      onChange={(e) => setNewCamera(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white focus:bg-white dark:focus:bg-stone-900 focus:border-black dark:focus:border-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-stone-500 dark:text-stone-400 mb-1">
                      Lens / Optics Setup
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 24-70mm f/2.8 GM · 70-200mm f/4"
                      value={newLens}
                      onChange={(e) => setNewLens(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white focus:bg-white dark:focus:bg-stone-900 focus:border-black dark:focus:border-white focus:outline-none"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-[11px] font-mono uppercase text-stone-500 dark:text-stone-400 mb-1">
                  Bio / Role
                </label>
                <input
                  type="text"
                  placeholder={accountType === 'creator' ? 'Track & field photojournalist' : 'Alumni & athletics supporter'}
                  value={newBio}
                  onChange={(e) => setNewBio(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white focus:bg-white dark:focus:bg-stone-900 focus:border-black dark:focus:border-white focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-2xl bg-black dark:bg-white hover:bg-stone-800 dark:hover:bg-stone-200 text-white dark:text-stone-900 text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <span>{accountType === 'creator' ? 'Create Creator Account & Enable Uploads' : 'Create Standard Account'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
