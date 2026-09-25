import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Bell, 
  Lock, 
  QrCode, 
  Smartphone, 
  Check, 
  Save, 
  Zap,
  Trash2
} from 'lucide-react';
import { UserProfile } from '../types';

interface SettingsModalProps {
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  onClose: () => void;
  onTriggerTestPush: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  user,
  onUpdateUser,
  onClose,
  onTriggerTestPush
}) => {
  const [mfaEnabled, setMfaEnabled] = useState(user.mfaEnabled ?? false);
  const [mfaMethod, setMfaMethod] = useState<'totp' | 'sms'>(user.mfaMethod === 'sms' ? 'sms' : 'totp');
  const [gameScores, setGameScores] = useState(user.notificationPrefs?.gameScores ?? true);
  const [newGalleries, setNewGalleries] = useState(user.notificationPrefs?.newGalleries ?? true);
  const [schoolAnnouncements, setSchoolAnnouncements] = useState(user.notificationPrefs?.schoolAnnouncements ?? true);
  const [creditsAttribution, setCreditsAttribution] = useState(user.notificationPrefs?.creditsAttribution ?? true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...user,
      mfaEnabled,
      mfaMethod,
      notificationPrefs: {
        gameScores,
        newGalleries,
        schoolAnnouncements,
        creditsAttribution
      }
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div id="settings-modal" className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#142019] border border-[#E8EFE8] dark:border-[#283a2d] rounded-3xl w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E8EFE8] dark:border-[#283a2d] flex items-center justify-between bg-[#EBF1EA]/60 dark:bg-[#18251c]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#344C3D] text-white flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#BFCFBB]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#243328] dark:text-[#E2EBE2]">
                Account Security & Push Notifications
              </h3>
              <p className="text-xs text-[#738A6E] dark:text-[#8EA58C]">
                Configure Multi-Factor Authentication (MFA) and fine-grained notifications
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

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {saveSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Settings updated successfully!</span>
            </div>
          )}

          {/* Section 1: Multi-Factor Authentication (MFA) */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#243328] dark:text-[#E2EBE2] flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#344C3D] dark:text-[#BFCFBB]" />
              <span>Two-Factor Authentication (MFA)</span>
            </h4>

            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#18251c] border border-stone-200 dark:border-stone-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#243328] dark:text-[#E2EBE2] block">
                    Require MFA for Contributor Actions
                  </span>
                  <span className="text-[11px] text-[#738A6E]">
                    Adds an extra layer of security when publishing high-res galleries or managing media
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mfaEnabled}
                    onChange={(e) => setMfaEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#344C3D]"></div>
                </label>
              </div>

              {mfaEnabled && (
                <div className="pt-3 border-t border-stone-200 dark:border-stone-800 space-y-3">
                  <div className="flex items-center gap-4 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="mfaMethod"
                        value="totp"
                        checked={mfaMethod === 'totp'}
                        onChange={() => setMfaMethod('totp')}
                        className="text-[#344C3D]"
                      />
                      <span className="font-semibold text-[#243328] dark:text-[#E2EBE2]">
                        Google Authenticator / Authy (TOTP)
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="mfaMethod"
                        value="sms"
                        checked={mfaMethod === 'sms'}
                        onChange={() => setMfaMethod('sms')}
                        className="text-[#344C3D]"
                      />
                      <span className="font-semibold text-[#243328] dark:text-[#E2EBE2]">
                        SMS Verification Code
                      </span>
                    </label>
                  </div>

                  {mfaMethod === 'totp' && (
                    <div className="p-3 rounded-xl bg-white dark:bg-[#111a14] border border-stone-200 dark:border-stone-800 flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#EBF1EA] dark:bg-[#1E2E24] rounded-lg flex items-center justify-center shrink-0">
                        <QrCode className="w-8 h-8 text-[#344C3D] dark:text-[#BFCFBB]" />
                      </div>
                      <div className="text-[11px] text-[#738A6E]">
                        <span className="font-mono font-bold text-[#243328] dark:text-[#E2EBE2] block">
                          SECRET KEY: PINE-CRES-T202-6ATH
                        </span>
                        <span>Scan with your authenticator app or enter 6-digit code during sign-in.</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Fine-Grained Push Notifications */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#243328] dark:text-[#E2EBE2] flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#344C3D] dark:text-[#BFCFBB]" />
                <span>Fine-Grained Push Notification Controls</span>
              </h4>

              <button
                type="button"
                id="test-push-notification-btn"
                onClick={onTriggerTestPush}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EBF1EA] dark:bg-[#1E2E24] text-[#344C3D] dark:text-[#BFCFBB] text-[11px] font-bold border border-[#BFCFBB]/40 hover:bg-[#344C3D] hover:text-white transition-colors"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Trigger Test Alert</span>
              </button>
            </div>

            <div className="divide-y divide-stone-200 dark:divide-stone-800 rounded-2xl bg-stone-50 dark:bg-[#18251c] border border-stone-200 dark:border-stone-800">
              
              <div className="p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#243328] dark:text-[#E2EBE2] block">
                    Live Game Scores & Tournament Updates
                  </span>
                  <span className="text-[11px] text-[#738A6E]">
                    Instant notifications when varsity games finish or reach clutch moments
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={gameScores}
                  onChange={(e) => setGameScores(e.target.checked)}
                  className="w-4 h-4 rounded text-[#344C3D]"
                />
              </div>

              <div className="p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#243328] dark:text-[#E2EBE2] block">
                    New High-Res Photo Gallery Drops
                  </span>
                  <span className="text-[11px] text-[#738A6E]">
                    Get notified immediately when photographers upload albums from recent events
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={newGalleries}
                  onChange={(e) => setNewGalleries(e.target.checked)}
                  className="w-4 h-4 rounded text-[#344C3D]"
                />
              </div>

              <div className="p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#243328] dark:text-[#E2EBE2] block">
                    School & Athletic Department Bulletins
                  </span>
                  <span className="text-[11px] text-[#738A6E]">
                    Weather delays, ticket announcements, and playoff schedules
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={schoolAnnouncements}
                  onChange={(e) => setSchoolAnnouncements(e.target.checked)}
                  className="w-4 h-4 rounded text-[#344C3D]"
                />
              </div>

              <div className="p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#243328] dark:text-[#E2EBE2] block">
                    Photographer Credit & Attribution Mentions
                  </span>
                  <span className="text-[11px] text-[#738A6E]">
                    Alerts when your photos receive featured placement or high download milestones
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={creditsAttribution}
                  onChange={(e) => setCreditsAttribution(e.target.checked)}
                  className="w-4 h-4 rounded text-[#344C3D]"
                />
              </div>

            </div>
          </div>

          {/* Footer Save Button */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8EFE8] dark:border-[#283a2d]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:underline"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#344C3D] hover:bg-[#223329] text-white text-xs font-bold shadow-md transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Preferences</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
