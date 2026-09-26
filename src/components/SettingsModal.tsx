import React from 'react';
import {
  X,
  Sliders,
  Sun,
  Moon,
  Sparkles,
  Zap,
  Palette,
  Layers,
  RotateCcw,
  Check
} from 'lucide-react';

export interface AppVisualSettings {
  blurIntensity: number; // 0 to 28 px
  liquidGlassIntensity: number; // 40 to 96 (%)
  glassSpecularBorder: number; // 5 to 35 (%)
  isDarkMode: boolean;
  lightSurfaceColor: string;
  darkSurfaceColor: string;
  accentColor: string;
  accentName: string;
  smoothScrollEnabled: boolean;
  ambientOrbsEnabled: boolean;
  enhancedAnimations: boolean;
}

export const DEFAULT_VISUAL_SETTINGS: AppVisualSettings = {
  blurIntensity: 10,
  liquidGlassIntensity: 82,
  glassSpecularBorder: 14,
  isDarkMode: false,
  lightSurfaceColor: '#fafaf9',
  darkSurfaceColor: '#000000',
  accentColor: '#10b981',
  accentName: 'Emerald',
  smoothScrollEnabled: true,
  ambientOrbsEnabled: false,
  enhancedAnimations: true
};

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppVisualSettings;
  onUpdateSettings: (next: Partial<AppVisualSettings>) => void;
  onResetSettings: () => void;
}

const ACCENT_PRESETS = [
  { name: 'Emerald', hex: '#10b981', soft: 'rgba(16, 185, 129, 0.18)' },
  { name: 'Sapphire', hex: '#3b82f6', soft: 'rgba(59, 130, 246, 0.18)' },
  { name: 'Amber Gold', hex: '#f59e0b', soft: 'rgba(245, 158, 11, 0.18)' },
  { name: 'Crimson Rose', hex: '#f43f5e', soft: 'rgba(244, 63, 94, 0.18)' },
  { name: 'Violet Iris', hex: '#8b5cf6', soft: 'rgba(139, 92, 246, 0.18)' },
  { name: 'Cyan Optic', hex: '#06b6d4', soft: 'rgba(6, 182, 212, 0.18)' },
  { name: 'Monochrome', hex: '#18181b', soft: 'rgba(24, 24, 27, 0.16)' }
];

const LIGHT_SURFACE_PRESETS = [
  { name: 'Editorial Stone', hex: '#fafaf9' },
  { name: 'Pure Daylight', hex: '#ffffff' },
  { name: 'Warm Parchment', hex: '#f5f2eb' },
  { name: 'Sage Mist', hex: '#f1f6f2' },
  { name: 'Cool Alabaster', hex: '#f1f5f9' }
];

const DARK_SURFACE_PRESETS = [
  { name: 'OLED Pitch Black', hex: '#000000' },
  { name: 'Obsidian Studio', hex: '#0b0c0e' },
  { name: 'Deep Evergreen', hex: '#07110c' },
  { name: 'Midnight Slate', hex: '#070b14' },
  { name: 'Warm Espresso', hex: '#110d0b' }
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetSettings
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="settings-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-md flex items-center justify-center p-4 animate-apple-fade-in"
      onClick={onClose}
    >
      <div
        id="settings-modal-dialog"
        className="liquid-glass rounded-3xl max-w-lg w-full max-h-[88vh] overflow-y-auto shadow-2xl animate-spring-pop text-stone-900 dark:text-white border border-stone-200/80 dark:border-white/15"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 border-b border-stone-200/80 dark:border-white/15 liquid-glass">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm"
              style={{ backgroundColor: settings.accentColor }}
            >
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-source-serif font-semibold text-base text-stone-900 dark:text-white">
                Visual & Performance Settings
              </h2>
              <p className="text-[11px] font-mono text-stone-500 dark:text-white/60">
                Blur · Liquid Glass · Theme Colors · 120Hz Smoothness
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onResetSettings}
              className="px-2.5 py-1.5 rounded-full glass-pill text-[11px] font-mono font-medium flex items-center gap-1 hover:scale-105 transition-transform"
              title="Reset to optimal fast defaults"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full glass-pill text-stone-500 hover:text-black dark:text-white/70 dark:hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* 1. Optical Blur & Liquid Glass Intensity */}
          <div className="p-4 rounded-2xl glass-pill space-y-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4" style={{ color: settings.accentColor }} />
              <h3 className="text-xs font-bold uppercase tracking-wider font-mono">
                Optical Blur & Liquid Glass
              </h3>
            </div>

            {/* Blur Intensity Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">Blur Intensity</span>
                <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded-full glass-pill">
                  {settings.blurIntensity}px{' '}
                  {settings.blurIntensity <= 6
                    ? '(Ultra Fast)'
                    : settings.blurIntensity <= 12
                    ? '(Balanced)'
                    : '(Deep Frosted)'}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={28}
                step={2}
                value={settings.blurIntensity}
                onChange={(e) => onUpdateSettings({ blurIntensity: Number(e.target.value) })}
                className="w-full accent-emerald-500 cursor-pointer h-1.5 rounded-lg"
                style={{ accentColor: settings.accentColor }}
              />
              <div className="flex justify-between text-[10px] font-mono text-stone-400 dark:text-white/50">
                <button onClick={() => onUpdateSettings({ blurIntensity: 0 })} className="hover:underline">
                  0px (Zero Lag)
                </button>
                <button onClick={() => onUpdateSettings({ blurIntensity: 8 })} className="hover:underline">
                  8px (Crisp)
                </button>
                <button onClick={() => onUpdateSettings({ blurIntensity: 14 })} className="hover:underline">
                  14px (Glass)
                </button>
                <button onClick={() => onUpdateSettings({ blurIntensity: 24 })} className="hover:underline">
                  24px (Max)
                </button>
              </div>
            </div>

            {/* Liquid Glass Opacity / Intensity */}
            <div className="space-y-1.5 pt-2 border-t border-stone-200/60 dark:border-white/10">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">Liquid Glass Intensity (Surface Density)</span>
                <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded-full glass-pill">
                  {settings.liquidGlassIntensity}%
                </span>
              </div>
              <input
                type="range"
                min={45}
                max={96}
                step={3}
                value={settings.liquidGlassIntensity}
                onChange={(e) => onUpdateSettings({ liquidGlassIntensity: Number(e.target.value) })}
                className="w-full cursor-pointer h-1.5 rounded-lg"
                style={{ accentColor: settings.accentColor }}
              />
            </div>

            {/* Specular Edge Highlight */}
            <div className="space-y-1.5 pt-2 border-t border-stone-200/60 dark:border-white/10">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">Liquid Glass Specular Rim</span>
                <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded-full glass-pill">
                  {settings.glassSpecularBorder}%
                </span>
              </div>
              <input
                type="range"
                min={4}
                max={32}
                step={2}
                value={settings.glassSpecularBorder}
                onChange={(e) => onUpdateSettings({ glassSpecularBorder: Number(e.target.value) })}
                className="w-full cursor-pointer h-1.5 rounded-lg"
                style={{ accentColor: settings.accentColor }}
              />
            </div>
          </div>

          {/* 2. Dark Mode / Light Mode & Surface Color Customization */}
          <div className="p-4 rounded-2xl glass-pill space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4" style={{ color: settings.accentColor }} />
                <h3 className="text-xs font-bold uppercase tracking-wider font-mono">
                  Theme Mode, Surface & Accent Colors
                </h3>
              </div>

              {/* Light / Dark Segmented Switch */}
              <div className="flex items-center gap-1 p-1 rounded-full glass-pill text-xs">
                <button
                  onClick={() => onUpdateSettings({ isDarkMode: false })}
                  className={`px-2.5 py-1 rounded-full flex items-center gap-1 transition-all ${
                    !settings.isDarkMode
                      ? 'bg-black text-white font-semibold shadow-xs'
                      : 'text-stone-500 dark:text-white/60'
                  }`}
                >
                  <Sun className="w-3 h-3" />
                  <span>Light</span>
                </button>
                <button
                  onClick={() => onUpdateSettings({ isDarkMode: true })}
                  className={`px-2.5 py-1 rounded-full flex items-center gap-1 transition-all ${
                    settings.isDarkMode
                      ? 'bg-white text-black font-semibold shadow-xs'
                      : 'text-stone-500 dark:text-white/60'
                  }`}
                >
                  <Moon className="w-3 h-3" />
                  <span>Dark</span>
                </button>
              </div>
            </div>

            {/* Accent Color Swatches */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">Primary Accent Color</span>
                <span className="font-mono text-[11px] opacity-75">{settings.accentName}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {ACCENT_PRESETS.map((preset) => {
                  const active = settings.accentColor.toLowerCase() === preset.hex.toLowerCase();
                  return (
                    <button
                      key={preset.name}
                      onClick={() =>
                        onUpdateSettings({ accentColor: preset.hex, accentName: preset.name })
                      }
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-medium flex items-center gap-1.5 border transition-all active:scale-95 ${
                        active
                          ? 'border-black dark:border-white scale-105 font-bold shadow-sm'
                          : 'border-stone-200/80 dark:border-white/15 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: preset.hex }}
                      >
                        {active && <Check className="w-2.5 h-2.5" />}
                      </span>
                      <span>{preset.name}</span>
                    </button>
                  );
                })}
                <label className="px-2.5 py-1 rounded-xl text-[11px] font-mono border border-dashed border-stone-300 dark:border-white/25 flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="color"
                    value={settings.accentColor}
                    onChange={(e) =>
                      onUpdateSettings({ accentColor: e.target.value, accentName: 'Custom' })
                    }
                    className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent"
                  />
                  <span>Custom</span>
                </label>
              </div>
            </div>

            {/* Surface Background Tone Selector */}
            <div className="space-y-2 pt-2 border-t border-stone-200/60 dark:border-white/10">
              <span className="text-xs font-medium block">
                {settings.isDarkMode ? 'Dark Mode Canvas Tone' : 'Light Mode Canvas Tone'}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(settings.isDarkMode ? DARK_SURFACE_PRESETS : LIGHT_SURFACE_PRESETS).map(
                  (surface) => {
                    const currentHex = settings.isDarkMode
                      ? settings.darkSurfaceColor
                      : settings.lightSurfaceColor;
                    const isSelected = currentHex.toLowerCase() === surface.hex.toLowerCase();
                    return (
                      <button
                        key={surface.name}
                        onClick={() =>
                          settings.isDarkMode
                            ? onUpdateSettings({ darkSurfaceColor: surface.hex })
                            : onUpdateSettings({ lightSurfaceColor: surface.hex })
                        }
                        className={`p-2 rounded-xl border text-left flex items-center gap-2 text-[11px] transition-all active:scale-95 ${
                          isSelected
                            ? 'border-black dark:border-white font-semibold shadow-xs'
                            : 'border-stone-200/70 dark:border-white/15 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-stone-300 dark:border-white/30 shrink-0"
                          style={{ backgroundColor: surface.hex }}
                        />
                        <span className="truncate">{surface.name}</span>
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          </div>

          {/* 3. Smoothness & Animation Switches */}
          <div className="p-4 rounded-2xl glass-pill space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" style={{ color: settings.accentColor }} />
              <h3 className="text-xs font-bold uppercase tracking-wider font-mono">
                Smoothness & Animation Switches
              </h3>
            </div>

            {/* Toggle 1: Spring Entrance & Hover Animations */}
            <div className="flex items-center justify-between py-1.5">
              <div>
                <p className="text-xs font-semibold">Spring Micro-Animations & Card Lift</p>
                <p className="text-[11px] text-stone-500 dark:text-white/60">
                  GPU-accelerated spring transitions and hover lift effects
                </p>
              </div>
              <button
                onClick={() =>
                  onUpdateSettings({ enhancedAnimations: !settings.enhancedAnimations })
                }
                style={{
                  backgroundColor: settings.enhancedAnimations ? settings.accentColor : undefined
                }}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 ${
                  settings.enhancedAnimations ? '' : 'bg-stone-300 dark:bg-white/20'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
                    settings.enhancedAnimations ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 2: Inertial Smooth Scroll */}
            <div className="flex items-center justify-between py-1.5 border-t border-stone-200/60 dark:border-white/10">
              <div>
                <p className="text-xs font-semibold">Velocity Inertia Smooth Scroll</p>
                <p className="text-[11px] text-stone-500 dark:text-white/60">
                  Exponential momentum decay on desktop scroll wheels
                </p>
              </div>
              <button
                onClick={() =>
                  onUpdateSettings({ smoothScrollEnabled: !settings.smoothScrollEnabled })
                }
                style={{
                  backgroundColor: settings.smoothScrollEnabled ? settings.accentColor : undefined
                }}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 ${
                  settings.smoothScrollEnabled ? '' : 'bg-stone-300 dark:bg-white/20'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
                    settings.smoothScrollEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 3: Ambient Lighting Orbs */}
            <div className="flex items-center justify-between py-1.5 border-t border-stone-200/60 dark:border-white/10">
              <div>
                <p className="text-xs font-semibold">Ambient Background Orbs</p>
                <p className="text-[11px] text-stone-500 dark:text-white/60">
                  Keep off for maximum battery life & zero GPU overhead
                </p>
              </div>
              <button
                onClick={() =>
                  onUpdateSettings({ ambientOrbsEnabled: !settings.ambientOrbsEnabled })
                }
                style={{
                  backgroundColor: settings.ambientOrbsEnabled ? settings.accentColor : undefined
                }}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 ${
                  settings.ambientOrbsEnabled ? '' : 'bg-stone-300 dark:bg-white/20'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
                    settings.ambientOrbsEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* 1-Click Ultra-Smooth Performance Preset */}
            <button
              onClick={() =>
                onUpdateSettings({
                  blurIntensity: 6,
                  liquidGlassIntensity: 90,
                  ambientOrbsEnabled: false,
                  enhancedAnimations: true
                })
              }
              className="w-full mt-2 py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 accent-glow-btn"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Apply 120fps Ultra-Smooth Preset (Low Blur + Spring Motion)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
