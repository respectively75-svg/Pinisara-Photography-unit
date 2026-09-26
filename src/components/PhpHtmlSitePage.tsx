import React, { useEffect, useState } from 'react';
import {
  Download,
  Code2,
  Eye,
  Copy,
  Check,
  FileCode,
  Server,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export const PhpHtmlSitePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'preview' | 'php' | 'html'>('preview');
  const [phpSource, setPhpSource] = useState<string>('Loading index.php source...');
  const [htmlSource, setHtmlSource] = useState<string>('Loading index.html source...');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/php-site/source')
      .then((res) => res.json())
      .then((data) => {
        if (data.phpSource) setPhpSource(data.phpSource);
        if (data.htmlSource) setHtmlSource(data.htmlSource);
      })
      .catch(() => {
        setPhpSource('// Download index.php using the Download button above.');
      });
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl liquid-glass space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-700 dark:text-emerald-400">
              <Server className="w-3.5 h-3.5" />
              <span>PHP 8+ &amp; HTML5 STANDALONE EDITION · PINISARA PHOTOGRAPHY</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 dark:text-white tracking-tight">
              Complete PHP / HTML5 Site Bundle
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
              Your entire Pinisara Photography archive—including the <strong>Monograph Bookshelf</strong>,{' '}
              <strong>Seamless Editorial Scroll Library</strong>, <strong>High Contrast Low-Light Mode</strong>,{' '}
              <strong>CSS <code className="font-mono">object-fit</code> &amp; Aspect-Ratio Auto-Crop Studio</strong>,{' '}
              <strong>Liquid Glass Dock</strong>, and <strong>Google + 2FA Account Verification</strong>—is compiled into a self-contained{' '}
              <code className="font-mono px-1.5 py-0.5 rounded bg-stone-200/70 dark:bg-white/10">index.php</code> and{' '}
              <code className="font-mono px-1.5 py-0.5 rounded bg-stone-200/70 dark:bg-white/10">index.html</code>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href="/api/php-site/download-php"
              download="index.php"
              className="px-4 py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-semibold flex items-center gap-2 hover:opacity-85 transition-all shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download index.php</span>
            </a>

            <a
              href="/api/php-site/download-html"
              download="index.html"
              className="px-4 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download index.html</span>
            </a>
          </div>
        </div>

        {/* Quick Run Instructions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-stone-200/80 dark:border-white/10 text-xs">
          <div className="p-3.5 rounded-2xl glass-pill space-y-1">
            <div className="font-mono text-[11px] font-semibold text-stone-900 dark:text-white">
              1. Run with PHP Built-in Server
            </div>
            <code className="block font-mono text-[11px] text-emerald-700 dark:text-emerald-400">
              php -S localhost:8080 index.php
            </code>
          </div>
          <div className="p-3.5 rounded-2xl glass-pill space-y-1">
            <div className="font-mono text-[11px] font-semibold text-stone-900 dark:text-white">
              2. Apache / XAMPP / cPanel Ready
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              Drop <code className="font-mono">index.php</code> into <code className="font-mono">htdocs/</code> or <code className="font-mono">public_html/</code>. Auto-creates <code className="font-mono">pinisara_data.json</code>.
            </p>
          </div>
          <div className="p-3.5 rounded-2xl glass-pill space-y-1">
            <div className="font-mono text-[11px] font-semibold text-stone-900 dark:text-white">
              3. Pure HTML5 Serverless Mode
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              Open <code className="font-mono">index.html</code> directly in any browser with zero server setup required.
            </p>
          </div>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl glass-pill">
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-2 transition-all ${
              activeTab === 'preview'
                ? 'bg-black text-white dark:bg-white dark:text-black font-semibold'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Live Interactive HTML/PHP Preview</span>
          </button>

          <button
            onClick={() => setActiveTab('php')}
            className={`px-4 py-2 rounded-xl text-xs font-mono flex items-center gap-2 transition-all ${
              activeTab === 'php'
                ? 'bg-black text-white dark:bg-white dark:text-black font-semibold'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>index.php Source</span>
          </button>

          <button
            onClick={() => setActiveTab('html')}
            className={`px-4 py-2 rounded-xl text-xs font-mono flex items-center gap-2 transition-all ${
              activeTab === 'html'
                ? 'bg-black text-white dark:bg-white dark:text-black font-semibold'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>index.html Source</span>
          </button>
        </div>

        {activeTab !== 'preview' && (
          <button
            onClick={() => handleCopy(activeTab === 'php' ? phpSource : htmlSource)}
            className="px-4 py-2 rounded-full glass-pill text-xs font-mono flex items-center gap-2 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard!' : `Copy ${activeTab === 'php' ? 'index.php' : 'index.html'}`}</span>
          </button>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === 'preview' && (
        <div className="rounded-3xl overflow-hidden border border-stone-200/90 dark:border-white/15 shadow-2xl bg-black">
          <div className="px-4 py-2.5 bg-stone-900 border-b border-white/10 flex items-center justify-between text-xs font-mono text-stone-400">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
              <span className="ml-2 text-stone-300">/php-site/index.html (Standalone PHP/HTML5 Engine)</span>
            </div>
            <span className="text-emerald-400">Interactive Sandbox</span>
          </div>
          <iframe
            src="/php-site/index.html"
            title="Pinisara Photography PHP/HTML5 Standalone Site"
            className="w-full h-[78vh] border-0 bg-black"
          />
        </div>
      )}

      {activeTab === 'php' && (
        <div className="rounded-3xl overflow-hidden border border-stone-200/90 dark:border-white/15 bg-stone-950 text-stone-200 shadow-2xl">
          <div className="px-5 py-3 bg-stone-900 border-b border-white/10 flex items-center justify-between text-xs font-mono">
            <span className="text-emerald-400">public/php-site/index.php</span>
            <span className="text-stone-400">PHP 8+ + HTML5 + Tailwind CSS + Vanilla JS</span>
          </div>
          <pre className="p-5 text-xs font-mono overflow-x-auto max-h-[72vh] leading-relaxed select-all">
            <code>{phpSource}</code>
          </pre>
        </div>
      )}

      {activeTab === 'html' && (
        <div className="rounded-3xl overflow-hidden border border-stone-200/90 dark:border-white/15 bg-stone-950 text-stone-200 shadow-2xl">
          <div className="px-5 py-3 bg-stone-900 border-b border-white/10 flex items-center justify-between text-xs font-mono">
            <span className="text-emerald-400">public/php-site/index.html</span>
            <span className="text-stone-400">Pure HTML5 + Tailwind CSS + Vanilla JS</span>
          </div>
          <pre className="p-5 text-xs font-mono overflow-x-auto max-h-[72vh] leading-relaxed select-all">
            <code>{htmlSource}</code>
          </pre>
        </div>
      )}
    </section>
  );
};
