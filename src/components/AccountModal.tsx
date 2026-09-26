import React, { useState, useRef, useEffect } from 'react';
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
  Mail,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Trash2,
  LogOut,
  ShieldAlert
} from 'lucide-react';
import { UserProfile, Photo } from '../types';
import {
  signInWithGooglePopup,
  signOutGoogle,
  saveUserProfileToFirestore,
  getCachedGoogleAccessToken,
  ADMIN_EMAIL
} from '../firebase';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  registeredAccounts: UserProfile[];
  photos?: Photo[];
  onSwitchUser: (user: UserProfile) => void;
  onNavigateToUpload: () => void;
  onCreateAccount: (newUser: UserProfile) => void;
  onUpdateCredits?: (newAmount: number) => void;
  onModerateUser?: (
    userId: string,
    updates: Partial<UserProfile> | 'delete'
  ) => void;
  onModeratePhoto?: (
    photoId: string,
    status: 'approved' | 'pending' | 'rejected' | 'delete'
  ) => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  registeredAccounts,
  photos = [],
  onSwitchUser,
  onNavigateToUpload,
  onCreateAccount,
  onUpdateCredits,
  onModerateUser,
  onModeratePhoto
}) => {
  const [activeTab, setActiveTab] = useState<
    'profile' | 'credits' | 'switch' | 'register' | 'moderation'
  >('register');
  const [claimedToday, setClaimedToday] = useState<boolean>(false);
  const [claimFeedback, setClaimFeedback] = useState<string | null>(null);

  // Registration State (NO Google Password — uses real 4-digit Gmail Verification Code)
  const [accountType, setAccountType] = useState<'general' | 'creator'>('creator');
  const [authStep, setAuthStep] = useState<'google_details' | 'gmail_code'>('google_details');
  const [googleName, setGoogleName] = useState('');
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleAvatar, setGoogleAvatar] = useState<string | undefined>(undefined);
  const [googleUid, setGoogleUid] = useState<string | undefined>(undefined);
  const [newCamera, setNewCamera] = useState('Canon EOS Kiss F');
  const [newLens, setNewLens] = useState('18-55mm IS Kit Lens');
  const [newAffiliation, setNewAffiliation] = useState(
    'Pinisara Photography · Pinnawala Central College'
  );
  const [newBio, setNewBio] = useState('');
  const [googleAuthError, setGoogleAuthError] = useState('');
  const [isSendingCode, setIsSendingCode] = useState(false);

  // Video-Matched 4-Digit Gmail Verification Code UI State
  const [otpDigits, setOtpDigits] = useState<[string, string, string, string]>(['', '', '', '']);
  const [otpStatus, setOtpStatus] = useState<'idle' | 'verifying' | 'error' | 'success'>('idle');
  const [otpErrorMessage, setOtpErrorMessage] = useState('');
  const [verifyProgress, setVerifyProgress] = useState(0);
  const [dispatchedCodePreview, setDispatchedCodePreview] = useState<string | null>(null);
  const [sentViaGmailApi, setSentViaGmailApi] = useState(false);
  const [pendingSwitchAccount, setPendingSwitchAccount] = useState<UserProfile | null>(null);

  // Admin Moderation Sub-Tab
  const [modSubTab, setModSubTab] = useState<'users' | 'photos'>('users');

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];

  useEffect(() => {
    if (isOpen && currentUser.gmailVerified) {
      setActiveTab('profile');
    } else if (isOpen && !currentUser.gmailVerified) {
      setActiveTab('register');
    }
  }, [isOpen, currentUser.gmailVerified]);

  if (!isOpen) return null;

  const currentCredits = currentUser?.credits ?? 0;

  const handleClaimDailyCredits = () => {
    if (claimedToday) return;
    const bonus = 25;
    const newTotal = currentCredits + bonus;
    if (onUpdateCredits) {
      onUpdateCredits(newTotal);
    }
    setClaimedToday(true);
    setClaimFeedback(`+${bonus} Credits added to your balance!`);
    setTimeout(() => setClaimFeedback(null), 3500);
  };

  // Send 4-Digit Verification Code to Gmail
  const sendGmailVerificationCode = async (targetEmail: string, targetName: string) => {
    setIsSendingCode(true);
    setGoogleAuthError('');
    try {
      const accessToken = getCachedGoogleAccessToken();
      const response = await fetch('/api/auth/send-gmail-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
        },
        body: JSON.stringify({
          email: targetEmail.trim().toLowerCase(),
          displayName: targetName.trim(),
          accessToken
        })
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setGoogleAuthError(data.error || 'Could not send Gmail verification code.');
        setIsSendingCode(false);
        return false;
      }
      setDispatchedCodePreview(data.code);
      setSentViaGmailApi(Boolean(data.sentViaGmailApi));
      setOtpDigits(['', '', '', '']);
      setOtpStatus('idle');
      setOtpErrorMessage('');
      setVerifyProgress(0);
      setAuthStep('gmail_code');
      setTimeout(() => inputRefs[0].current?.focus(), 80);
      setIsSendingCode(false);
      return true;
    } catch (err) {
      setGoogleAuthError('Network error while dispatching Gmail verification code.');
      setIsSendingCode(false);
      return false;
    }
  };

  // Real Google OAuth Sign-In Popup (Auto-fills Google Name & Email and dispatches Gmail code)
  const handleGoogleSignInPopup = async () => {
    setGoogleAuthError('');
    try {
      const { firebaseUser } = await signInWithGooglePopup();
      const name = firebaseUser.displayName || 'Google User';
      const email = firebaseUser.email || '';
      setGoogleName(name);
      setGoogleEmail(email);
      setGoogleAvatar(firebaseUser.photoURL || undefined);
      setGoogleUid(firebaseUser.uid);
      if (email) {
        await sendGmailVerificationCode(email, name);
      }
    } catch (err: any) {
      setGoogleAuthError(
        'Google popup was closed or blocked. You can also enter your @gmail.com address below to receive your 4-digit Gmail verification code.'
      );
    }
  };

  // Step 1 Submit: Validate Google Name & Email (NO Password!) and send 4-digit Gmail code
  const handleProceedToGmailVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setGoogleAuthError('');

    const cleanEmail = googleEmail.trim().toLowerCase();
    if (!googleName.trim() || !cleanEmail) {
      setGoogleAuthError('Please enter your Google Account name and Gmail address.');
      return;
    }
    if (!cleanEmail.includes('@')) {
      setGoogleAuthError('Please enter a valid Gmail address (e.g. name@gmail.com).');
      return;
    }

    await sendGmailVerificationCode(cleanEmail, googleName.trim());
  };

  // Verify the 4-digit Gmail code (matches the uploaded video's error shake & green progress bar)
  const verifyFourDigitCode = async (fourDigitCode: string) => {
    if (fourDigitCode.length !== 4) return;
    setOtpStatus('verifying');
    setOtpErrorMessage('');

    const targetEmail = pendingSwitchAccount
      ? pendingSwitchAccount.email
      : googleEmail.trim().toLowerCase();

    try {
      const res = await fetch('/api/auth/verify-gmail-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
          code: fourDigitCode
        })
      });
      const data = await res.json();

      if (!res.ok || !data.valid) {
        setOtpStatus('error');
        setOtpErrorMessage(data.error || 'Verification code is invalid or expired');
        return;
      }

      // SUCCESS! Animate green boxes + progress bar from 0% -> 100% like the video
      setOtpStatus('success');
      setVerifyProgress(25);
      setTimeout(() => setVerifyProgress(65), 180);
      setTimeout(() => setVerifyProgress(100), 380);

      setTimeout(async () => {
        if (pendingSwitchAccount) {
          const verifiedSwitchUser: UserProfile = {
            ...pendingSwitchAccount,
            mfaEnabled: true,
            mfaMethod: 'gmail_code',
            gmailVerified: true
          };
          onSwitchUser(verifiedSwitchUser);
          setPendingSwitchAccount(null);
          setOtpDigits(['', '', '', '']);
          setOtpStatus('idle');
          setActiveTab('profile');
          return;
        }

        const isCreator = accountType === 'creator';
        const isUserAdmin =
          targetEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase();
        const newUser: UserProfile = {
          userId: googleUid || `usr_google_${Date.now()}`,
          displayName: googleName.trim(),
          email: targetEmail,
          avatarUrl: googleAvatar,
          role: isUserAdmin ? 'admin' : isCreator ? 'photographer' : 'student',
          isCreator: isCreator || isUserAdmin,
          camera: isCreator ? newCamera.trim() : undefined,
          lens: isCreator ? newLens.trim() : undefined,
          bio:
            newBio.trim() ||
            (isCreator
              ? `Verified Creator shooting with ${newCamera} at Pinnawala Central College`
              : 'Verified Google Account community member at Pinnawala Central College'),
          affiliation:
            newAffiliation.trim() ||
            (isCreator ? 'Pinisara Photography Society' : 'Pinnawala Central College Viewer'),
          favorites: [],
          uploadedCount: 0,
          credits: isCreator ? 300 : 100,
          mfaEnabled: true,
          mfaMethod: 'gmail_code',
          gmailVerified: true,
          moderationStatus: 'approved',
          createdAt: new Date().toISOString()
        };

        try {
          await saveUserProfileToFirestore(newUser);
        } catch {
          // Handled gracefully if offline or guest
        }

        onCreateAccount(newUser);
        setAuthStep('google_details');
        setOtpDigits(['', '', '', '']);
        setOtpStatus('idle');
        setVerifyProgress(0);
        setActiveTab('profile');
      }, 680);
    } catch {
      setOtpStatus('error');
      setOtpErrorMessage('Verification code is invalid or expired');
    }
  };

  const handleDigitChange = (index: number, rawVal: string) => {
    const digit = rawVal.replace(/\D/g, '').slice(-1);
    const next: [string, string, string, string] = [...otpDigits] as [
      string,
      string,
      string,
      string
    ];
    next[index] = digit;
    setOtpDigits(next);

    if (otpStatus === 'error') {
      setOtpStatus('idle');
      setOtpErrorMessage('');
    }

    if (digit && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    const joined = next.join('');
    if (joined.length === 4 && next.every((d) => d.length === 1)) {
      verifyFourDigitCode(joined);
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePasteDigits = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (!pasted) return;
    const next: [string, string, string, string] = [
      pasted[0] || '',
      pasted[1] || '',
      pasted[2] || '',
      pasted[3] || ''
    ];
    setOtpDigits(next);
    if (pasted.length === 4) {
      verifyFourDigitCode(pasted);
    }
  };

  const getInitials = (name: string) => {
    return (name || 'G')
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // Render the Video-Matched 4-Digit Verification Code Card
  const renderVideoMatchedOtpCard = (targetEmail: string, onBack: () => void) => (
    <div className="bg-white text-slate-900 rounded-[28px] p-6 sm:p-8 shadow-2xl border border-slate-200/90 animate-spring-pop">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2 shadow-2xs">
          <Mail className="w-6 h-6" />
        </div>
        <h3 className="text-2xl font-bold tracking-tight text-slate-900">Verification Code</h3>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
          Enter the 4-digit code that we have sent via the Gmail to{' '}
          <span className="font-semibold text-slate-900 break-all">{targetEmail}</span>
        </p>
      </div>

      {/* 4 Digit Boxes (Blue Focus, Red Shake on Error, Emerald Green on Success) */}
      <div
        className={`grid grid-cols-4 gap-3 sm:gap-4 my-6 max-w-[290px] mx-auto ${
          otpStatus === 'error' ? 'animate-otp-shake' : ''
        }`}
      >
        {[0, 1, 2, 3].map((idx) => {
          const val = otpDigits[idx];
          const isError = otpStatus === 'error';
          const isSuccess = otpStatus === 'success';
          return (
            <input
              key={idx}
              ref={inputRefs[idx]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={val}
              disabled={isSuccess}
              onChange={(e) => handleDigitChange(idx, e.target.value)}
              onKeyDown={(e) => handleDigitKeyDown(idx, e)}
              onPaste={handlePasteDigits}
              className={`w-full aspect-square rounded-2xl text-center text-2xl sm:text-3xl font-bold font-mono transition-all duration-200 focus:outline-none ${
                isSuccess
                  ? 'border-2 border-emerald-500 bg-emerald-50 text-emerald-600 scale-105 shadow-md shadow-emerald-500/15'
                  : isError
                  ? 'border-2 border-rose-500 bg-rose-50 text-rose-600 shadow-sm shadow-rose-500/10'
                  : val
                  ? 'border-2 border-blue-500 bg-blue-50/30 text-slate-900 shadow-sm'
                  : 'border-2 border-slate-200 bg-slate-50/70 text-slate-900 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/15'
              }`}
            />
          );
        })}
      </div>

      {/* Error State Banner (Matches video: red alert + Resend Code) */}
      {otpStatus === 'error' && (
        <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-2 text-rose-600 text-xs animate-apple-fade-in">
          <div className="flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{otpErrorMessage || 'Verification code is invalid or expired'}</span>
          </div>
          <button
            type="button"
            onClick={() => sendGmailVerificationCode(targetEmail, googleName || 'User')}
            className="px-2.5 py-1 rounded-xl bg-rose-600 text-white font-semibold text-[11px] hover:bg-rose-700 transition-colors shrink-0"
          >
            Resend Code
          </button>
        </div>
      )}

      {/* Success State Banner + Animated Progress Bar (Matches video) */}
      {otpStatus === 'success' && (
        <div className="mb-4 space-y-3 animate-spring-pop">
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center gap-2 text-emerald-700 text-sm font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span>Account Verified! Activating Profile...</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 transition-all duration-300 rounded-full"
              style={{ width: `${verifyProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Live Gmail Dispatch Helper Bar */}
      {dispatchedCodePreview && otpStatus !== 'success' && (
        <div className="mb-4 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              {sentViaGmailApi ? 'Sent to Gmail Inbox:' : 'Gmail Verification Code:'}{' '}
              <strong className="font-mono text-sm text-slate-900 tracking-wider">
                {dispatchedCodePreview}
              </strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                const chars = dispatchedCodePreview.split('');
                const next: [string, string, string, string] = [
                  chars[0] || '',
                  chars[1] || '',
                  chars[2] || '',
                  chars[3] || ''
                ];
                setOtpDigits(next);
                verifyFourDigitCode(dispatchedCodePreview);
              }}
              className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-mono text-[11px] font-semibold transition-colors"
            >
              Fill {dispatchedCodePreview}
            </button>
            <button
              type="button"
              onClick={() => {
                setOtpDigits(['0', '0', '0', '0']);
                verifyFourDigitCode('0000');
              }}
              className="px-2 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-mono text-[10px] transition-colors"
              title="Preview the video's red error shake animation"
            >
              Test Error
            </button>
          </div>
        </div>
      )}

      {/* Bottom Actions */}
      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={onBack}
          className="text-slate-500 hover:text-slate-800 font-medium"
        >
          ← Change Email
        </button>
        <button
          type="button"
          disabled={isSendingCode}
          onClick={() => sendGmailVerificationCode(targetEmail, googleName || 'User')}
          className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSendingCode ? 'animate-spin' : ''}`} />
          <span>Resend Gmail Code</span>
        </button>
      </div>
    </div>
  );

  return (
    <div
      id="account-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-apple-fade-in"
      onClick={onClose}
    >
      <div
        id="account-modal-dialog"
        className="liquid-glass rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-spring-pop text-stone-900 dark:text-white relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Tabs */}
        <div className="flex items-center justify-between px-4 sm:px-6 pt-5 pb-3 border-b border-stone-200/80 dark:border-white/15 gap-2">
          <div className="flex items-center gap-1 p-1 glass-pill rounded-full text-[11px] sm:text-xs font-medium overflow-x-auto no-scrollbar">
            <button
              id="tab-account-profile"
              onClick={() => {
                setPendingSwitchAccount(null);
                setActiveTab('profile');
              }}
              className={`px-2.5 py-1.5 rounded-full transition-all whitespace-nowrap ${
                activeTab === 'profile'
                  ? 'bg-black text-white dark:bg-white dark:text-black font-semibold'
                  : 'text-stone-600 dark:text-white/70'
              }`}
            >
              Account
            </button>
            <button
              id="tab-account-register"
              onClick={() => {
                setPendingSwitchAccount(null);
                setAuthStep('google_details');
                setActiveTab('register');
              }}
              className={`px-2.5 py-1.5 rounded-full transition-all whitespace-nowrap ${
                activeTab === 'register'
                  ? 'bg-black text-white dark:bg-white dark:text-black font-semibold'
                  : 'text-stone-600 dark:text-white/70'
              }`}
            >
              + Google Register
            </button>
            <button
              id="tab-account-switch"
              onClick={() => {
                setPendingSwitchAccount(null);
                setActiveTab('switch');
              }}
              className={`px-2.5 py-1.5 rounded-full transition-all whitespace-nowrap ${
                activeTab === 'switch'
                  ? 'bg-black text-white dark:bg-white dark:text-black font-semibold'
                  : 'text-stone-600 dark:text-white/70'
              }`}
            >
              Switch ({registeredAccounts.length})
            </button>
            <button
              id="tab-account-moderation"
              onClick={() => {
                setPendingSwitchAccount(null);
                setActiveTab('moderation');
              }}
              className={`px-2.5 py-1.5 rounded-full transition-all whitespace-nowrap ${
                activeTab === 'moderation'
                  ? 'bg-black text-white dark:bg-white dark:text-black font-semibold'
                  : 'text-stone-600 dark:text-white/70'
              }`}
            >
              Admin
            </button>
            <button
              id="tab-account-credits"
              onClick={() => {
                setPendingSwitchAccount(null);
                setActiveTab('credits');
              }}
              className={`px-2.5 py-1.5 rounded-full flex items-center gap-1 transition-all whitespace-nowrap ${
                activeTab === 'credits'
                  ? 'bg-black text-white dark:bg-white dark:text-black font-semibold'
                  : 'text-stone-600 dark:text-white/70'
              }`}
            >
              <Coins className="w-3 h-3" />
              <span>{currentCredits}</span>
            </button>
          </div>

          <button
            id="close-account-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-500 hover:text-black dark:text-white/70 dark:hover:text-white shrink-0"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Tab 1: Current Account View */}
        {activeTab === 'profile' && (
          <div className="p-6 space-y-5 animate-apple-fade-in">
            {!currentUser.gmailVerified ? (
              <div className="p-6 rounded-3xl glass-pill text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="font-source-serif font-semibold text-lg">
                  No Google Account Signed In
                </h3>
                <p className="text-xs text-stone-500 dark:text-white/65 max-w-xs mx-auto">
                  Register your Google Account using a 4-digit Gmail verification code to unlock
                  Creator uploads or Viewer favorites.
                </p>
                <button
                  onClick={() => {
                    setAuthStep('google_details');
                    setActiveTab('register');
                  }}
                  className="px-5 py-2.5 rounded-2xl accent-glow-btn text-xs font-semibold inline-flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Register with Google & Gmail Code</span>
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-coolvetica text-xl font-bold shrink-0 shadow-md">
                    {getInitials(currentUser.displayName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-source-serif font-semibold text-xl truncate">
                        {currentUser.displayName}
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full glass-pill text-[10px] font-mono font-semibold uppercase tracking-wider flex items-center gap-1">
                        {currentUser.isCreator ? (
                          <>
                            <Camera className="w-3 h-3" />
                            Creator Account
                          </>
                        ) : (
                          <>
                            <User className="w-3 h-3" />
                            Viewer Account
                          </>
                        )}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-white/70 font-mono mt-0.5 truncate">
                      Gmail Verified: {currentUser.email}
                    </p>
                    <p className="text-xs text-stone-600 dark:text-white/80 mt-2 line-clamp-2">
                      {currentUser.bio}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl glass-pill space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="text-xs font-semibold">Gmail 4-Digit Code Verification</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-mono font-bold">
                      GMAIL VERIFIED ✓
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {currentUser.isCreator && (
                    <button
                      onClick={() => {
                        onClose();
                        onNavigateToUpload();
                      }}
                      className="flex-1 py-3 px-4 rounded-2xl accent-glow-btn font-semibold text-xs flex items-center justify-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload Photos (+50 cr)</span>
                    </button>
                  )}
                  <button
                    onClick={async () => {
                      await signOutGoogle();
                      setActiveTab('register');
                    }}
                    className="py-3 px-4 rounded-2xl glass-pill text-xs font-semibold flex items-center justify-center gap-1.5 hover:text-rose-500"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Tab 2: Register Real Google Account with 4-Digit Gmail Code (NO Password!) */}
        {activeTab === 'register' && (
          <div className="p-6 space-y-4 max-h-[520px] overflow-y-auto animate-apple-fade-in">
            {authStep === 'google_details' ? (
              <form onSubmit={handleProceedToGmailVerification} className="space-y-3.5">
                {/* Account Role Selector */}
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
                    <span>Register as Creator</span>
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
                    <span>Register as Viewer</span>
                  </button>
                </div>

                {/* One-Click Real Google Popup Sign-In */}
                <button
                  type="button"
                  onClick={handleGoogleSignInPopup}
                  className="w-full py-2.5 px-4 rounded-2xl bg-white dark:bg-white/10 border border-stone-300 dark:border-white/20 text-xs font-semibold flex items-center justify-center gap-2.5 hover:scale-[1.01] transition-all shadow-xs"
                >
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[11px]">
                    G
                  </span>
                  <span>Continue with Google Popup & Send Gmail Code</span>
                </button>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-stone-200 dark:border-white/15" />
                  <span className="flex-shrink mx-3 text-[10px] font-mono uppercase text-stone-400">
                    or enter Gmail details directly (no password required)
                  </span>
                  <div className="flex-grow border-t border-stone-200 dark:border-white/15" />
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
                        placeholder="e.g. Hasaranga Jayawardhana"
                        value={googleName}
                        onChange={(e) => setGoogleName(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl glass-pill text-stone-900 dark:text-white focus:outline-none"
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
                        className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl glass-pill text-stone-900 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>

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
                          Lens / Optics
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
                  disabled={isSendingCode}
                  className="w-full py-3 px-4 rounded-2xl accent-glow-btn text-xs font-semibold flex items-center justify-center gap-2 shadow-md"
                >
                  <Mail className="w-4 h-4" />
                  <span>
                    {isSendingCode
                      ? 'Sending 4-Digit Verification Code to Gmail...'
                      : 'Send 4-Digit Verification Code to Gmail'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              renderVideoMatchedOtpCard(googleEmail, () => setAuthStep('google_details'))
            )}
          </div>
        )}

        {/* Tab 3: Switch Account (Only shows real registered accounts; empty until registered!) */}
        {activeTab === 'switch' && (
          <div className="p-6 space-y-4 max-h-[480px] overflow-y-auto animate-apple-fade-in">
            {pendingSwitchAccount ? (
              renderVideoMatchedOtpCard(pendingSwitchAccount.email, () =>
                setPendingSwitchAccount(null)
              )
            ) : registeredAccounts.length === 0 ? (
              <div className="p-6 rounded-3xl glass-pill text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-stone-200/70 dark:bg-white/10 flex items-center justify-center mx-auto">
                  <User className="w-6 h-6 opacity-70" />
                </div>
                <h3 className="font-source-serif font-semibold text-base">
                  No Accounts Registered Yet
                </h3>
                <p className="text-xs text-stone-500 dark:text-white/65 max-w-xs mx-auto leading-relaxed">
                  All pre-made accounts have been removed. Creators and viewers only appear here
                  once they register with their Google Account and 4-digit Gmail verification code.
                </p>
                <button
                  onClick={() => {
                    setAuthStep('google_details');
                    setActiveTab('register');
                  }}
                  className="px-4 py-2.5 rounded-2xl accent-glow-btn text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Register First Creator / Viewer Account</span>
                </button>
              </div>
            ) : (
              <>
                <div className="text-xs text-stone-600 dark:text-white/75">
                  Select a registered Google Account below. Switching sends a 4-digit verification
                  code to that Gmail address:
                </div>

                <div className="space-y-2">
                  {registeredAccounts.map((acc) => {
                    const isSelected =
                      currentUser.gmailVerified && acc.userId === currentUser.userId;
                    return (
                      <button
                        key={acc.userId}
                        onClick={async () => {
                          if (isSelected) {
                            setActiveTab('profile');
                          } else {
                            setPendingSwitchAccount(acc);
                            await sendGmailVerificationCode(acc.email, acc.displayName);
                          }
                        }}
                        className={`w-full p-3.5 rounded-2xl text-left border flex items-center justify-between gap-3 transition-all ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-500/10'
                            : 'glass-pill hover:border-stone-400 dark:hover:border-white/40'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-coolvetica text-sm font-bold shrink-0">
                            {getInitials(acc.displayName)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-xs truncate">
                                {acc.displayName}
                              </span>
                              <span className="font-mono text-[9px] px-2 py-0.5 rounded-full glass-pill font-semibold">
                                {acc.isCreator ? 'Creator' : 'Viewer'}
                              </span>
                            </div>
                            <div className="text-[11px] text-stone-500 dark:text-white/65 font-mono truncate">
                              {acc.email}
                            </div>
                          </div>
                        </div>

                        {isSelected ? (
                          <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <span className="text-xs font-mono font-semibold underline shrink-0">
                            Send Code →
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => {
                    setPendingSwitchAccount(null);
                    setAuthStep('google_details');
                    setActiveTab('register');
                  }}
                  className="w-full py-2.5 px-4 rounded-xl border border-dashed border-stone-300 dark:border-white/30 text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Register Another Google Account</span>
                </button>
              </>
            )}
          </div>
        )}

        {/* Tab 4: Admin Moderation Center */}
        {activeTab === 'moderation' && (
          <div className="p-6 space-y-4 max-h-[480px] overflow-y-auto animate-apple-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold uppercase tracking-wider font-mono">
                  Admin Moderation Console
                </span>
              </div>
              <div className="flex items-center gap-1 p-1 glass-pill rounded-xl text-[11px] font-mono">
                <button
                  onClick={() => setModSubTab('users')}
                  className={`px-2.5 py-1 rounded-lg ${
                    modSubTab === 'users'
                      ? 'bg-black text-white dark:bg-white dark:text-black font-bold'
                      : ''
                  }`}
                >
                  Users ({registeredAccounts.length})
                </button>
                <button
                  onClick={() => setModSubTab('photos')}
                  className={`px-2.5 py-1 rounded-lg ${
                    modSubTab === 'photos'
                      ? 'bg-black text-white dark:bg-white dark:text-black font-bold'
                      : ''
                  }`}
                >
                  Photos ({photos.length})
                </button>
              </div>
            </div>

            {modSubTab === 'users' ? (
              registeredAccounts.length === 0 ? (
                <p className="text-xs text-stone-500 dark:text-white/60 text-center py-6">
                  No registered accounts to moderate yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {registeredAccounts.map((u) => (
                    <div
                      key={u.userId}
                      className="p-3 rounded-2xl glass-pill flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{u.displayName}</p>
                        <p className="text-[10px] font-mono text-stone-500 dark:text-white/60 truncate">
                          {u.email} · {u.isCreator ? 'Creator' : 'Viewer'} ·{' '}
                          {u.moderationStatus || 'approved'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() =>
                            onModerateUser &&
                            onModerateUser(u.userId, {
                              isCreator: !u.isCreator,
                              role: !u.isCreator ? 'photographer' : 'student'
                            })
                          }
                          className="px-2 py-1 rounded-lg glass-pill text-[10px] font-mono font-semibold"
                        >
                          {u.isCreator ? 'Set Viewer' : 'Make Creator'}
                        </button>
                        <button
                          onClick={() => onModerateUser && onModerateUser(u.userId, 'delete')}
                          className="p-1.5 rounded-lg bg-rose-500/15 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors"
                          title="Remove User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="space-y-2">
                {photos.slice(0, 20).map((p) => (
                  <div
                    key={p.id}
                    className="p-2.5 rounded-2xl glass-pill flex items-center justify-between gap-2.5 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={p.thumbnailUrl}
                        alt={p.title}
                        className="w-10 h-10 rounded-xl object-cover shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{p.title}</p>
                        <p className="text-[10px] font-mono text-stone-500 dark:text-white/60">
                          {p.photographerName} · {p.moderationStatus || 'approved'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => onModeratePhoto && onModeratePhoto(p.id, 'approved')}
                        className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => onModeratePhoto && onModeratePhoto(p.id, 'delete')}
                        className="p-1.5 rounded-lg bg-rose-500/15 text-rose-500 hover:bg-rose-500 hover:text-white"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Credits Wallet */}
        {activeTab === 'credits' && (
          <div className="p-6 space-y-5 animate-apple-fade-in">
            <div className="rounded-3xl p-6 bg-black text-white relative overflow-hidden shadow-xl border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-emerald-400" />
                  <span className="font-mono text-xs uppercase tracking-wider text-white/80 font-semibold">
                    Pinisara Pass · Gmail Verified
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
                  <span className="font-mono text-4xl font-bold tracking-tight text-white">
                    {currentCredits}
                  </span>
                  <span className="text-white/80 font-mono text-sm font-semibold">CREDITS</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleClaimDailyCredits}
              disabled={claimedToday}
              className={`w-full py-3 px-4 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                claimedToday ? 'glass-pill opacity-50' : 'accent-glow-btn'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {claimedToday ? 'Daily Bonus Claimed ✓' : 'Claim Daily Bonus (+25 Credits)'}
              </span>
            </button>
            {claimFeedback && (
              <p className="text-xs text-center font-medium animate-apple-fade-in">
                {claimFeedback}
              </p>
            )}

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-2xl glass-pill space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-[11px]">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Publishing Photos</span>
                </div>
                <p className="text-[11px] text-stone-600 dark:text-white/70">
                  +50 Credits per photo uploaded by a verified Creator.
                </p>
              </div>
              <div className="p-3 rounded-2xl glass-pill space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-[11px]">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Free Downloads</span>
                </div>
                <p className="text-[11px] text-stone-600 dark:text-white/70">
                  Always 0 credits to download high-res photos.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
