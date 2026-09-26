import React from 'react';
import { Camera, Smartphone, ArrowRight, ShieldCheck } from 'lucide-react';
import { CreatorProfile, Photo } from '../types';

interface PhotographersPageProps {
  creators: CreatorProfile[];
  photos: Photo[];
  onSelectPhotographer: (creatorId: string) => void;
  onSelectPhoto: (photo: Photo) => void;
}

export const PhotographersPage: React.FC<PhotographersPageProps> = ({
  creators,
  photos,
  onSelectPhotographer,
  onSelectPhoto
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div id="photographers-team-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full animate-apple-fade-in">
      {/* Editorial Header */}
      <div className="max-w-3xl mb-12">
        <div className="flex items-center gap-2 mb-3">
          <span className="font-coolvetica text-xs uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
            Pinisara Photography
          </span>
          <span className="font-tempting italic text-stone-500 dark:text-stone-400 text-sm">
            Pinnawala Central College · Visual Storytellers
          </span>
        </div>

        <h1 className="font-source-serif font-normal text-3xl sm:text-5xl text-stone-900 dark:text-white tracking-tight leading-tight">
          The Photography Collective
        </h1>

        <p className="mt-3 text-stone-600 dark:text-stone-400 text-sm sm:text-base leading-relaxed">
          Four dedicated student photojournalists of Pinisara Photography at Pinnawala Central College capturing the energy, decisive plays, and historic milestones of athletics and school life in 4K resolution.
        </p>
      </div>

      {/* Photographers Showcase Cards (NO FACES - Clean Monogram & Camera Glyph) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {creators.map((creator) => {
          const creatorPhotos = photos.filter(
            (p) => p.photographerId === creator.id || p.photographerName.toLowerCase().includes(creator.name.toLowerCase())
          );
          const isMobile = creator.camera.includes('iPhone') || creator.camera.includes('Samsung');

          return (
            <div
              key={creator.id}
              id={`photographer-card-${creator.id}`}
              className="rounded-3xl ultra-glass p-6 sm:p-8 flex flex-col justify-between shadow-lg hover:border-emerald-500 dark:hover:border-emerald-400 hover:shadow-2xl transition-all duration-300 group"
            >
              <div>
                {/* Header with Monogram & Camera Body Badge */}
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div className="flex items-center gap-3.5">
                    {/* Minimalist Monogram Badge - NO FACES */}
                    <div className="w-14 h-14 rounded-2xl bg-black dark:bg-stone-800 text-white flex items-center justify-center font-coolvetica text-lg tracking-wider group-hover:bg-emerald-700 dark:group-hover:bg-emerald-600 transition-colors shadow-sm">
                      {getInitials(creator.name)}
                    </div>
                    <div>
                      <h3 className="font-source-serif font-medium text-xl text-stone-900 dark:text-white">
                        {creator.name}
                      </h3>
                      <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 mt-0.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>{creator.role}</span>
                      </p>
                    </div>
                  </div>

                  <span className="font-mono text-xs text-stone-400 dark:text-stone-500">
                    {creator.handle}
                  </span>
                </div>

                {/* Camera Equipment Banner */}
                <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-white/10 mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white dark:bg-stone-700 border border-stone-200 dark:border-white/10 flex items-center justify-center text-stone-700 dark:text-stone-200">
                      {isMobile ? (
                        <Smartphone className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                      ) : (
                        <Camera className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-wider text-stone-400 dark:text-stone-500 block">
                        Assigned Camera Body
                      </span>
                      <span className="font-coolvetica text-sm text-stone-900 dark:text-white tracking-wide">
                        {creator.camera}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                    {creatorPhotos.length} captures
                  </span>
                </div>

                {/* Biography */}
                <p className="text-stone-600 dark:text-stone-300 text-xs sm:text-sm leading-relaxed mb-6">
                  {creator.bio}
                </p>

                {/* Recent Captures Preview Strip */}
                {creatorPhotos.length > 0 && (
                  <div className="space-y-2 mb-6">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400 dark:text-stone-500 block">
                      Recent Field Captures
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {creatorPhotos.slice(0, 3).map((photo) => (
                        <div
                          key={photo.id}
                          onClick={() => onSelectPhoto(photo)}
                          className="relative aspect-4/3 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 cursor-pointer group/photo border border-stone-200/80 dark:border-white/10 hover:border-emerald-600 transition-colors"
                        >
                          <img
                            src={photo.thumbnailUrl}
                            alt={photo.title}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover/photo:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                onClick={() => onSelectPhotographer(creator.id)}
                className="w-full py-3 px-4 rounded-2xl bg-stone-100 dark:bg-stone-800 hover:bg-black dark:hover:bg-white text-stone-900 dark:text-stone-100 hover:text-white dark:hover:text-stone-950 text-xs font-semibold flex items-center justify-center gap-2 transition-all group/btn active:scale-98"
              >
                <span>Browse {creator.name.split(' ')[0]}'s Archive</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
              </button>

            </div>
          );
        })}
      </div>

      {/* Collaborative Teamwork & Signature School Events Section */}
      <section className="rounded-3xl ultra-glass p-8 sm:p-10 shadow-xl border border-stone-200/90 dark:border-white/10 mb-12">
        <div className="max-w-3xl mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-xs text-emerald-700 dark:text-emerald-400 uppercase tracking-wider font-semibold">
              Field Collaboration Matrix
            </span>
          </div>
          <h2 className="font-source-serif font-medium text-2xl sm:text-3xl text-stone-900 dark:text-white tracking-tight">
            How We Collaborate Across School Events
          </h2>
          <p className="mt-2 text-stone-600 dark:text-stone-300 text-xs sm:text-sm leading-relaxed">
            During major school milestones, our photographers coordinate field positions and optical setups to ensure every angle—from the ceremonial stage to the student crowds—is documented in uncompressed 4K.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* 1. Main Assembly */}
          <div className="p-5 rounded-2xl bg-white/70 dark:bg-stone-900/70 border border-stone-200/70 dark:border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-stone-900 dark:text-white">Main Assembly</span>
              <span className="font-mono text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full">
                Quadrangle
              </span>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              Hasaranga commands the ceremonial flagpole and stage podium; Dulen captures full quadrangle marching rows and student ranks.
            </p>
            <div className="pt-2 border-t border-stone-200/60 dark:border-white/10 flex items-center justify-between text-[11px] font-mono text-stone-500 dark:text-stone-400">
              <span>Lead: Hasaranga</span>
              <span>+ Dulen & Sayul</span>
            </div>
          </div>

          {/* 2. Pirith Program */}
          <div className="p-5 rounded-2xl bg-white/70 dark:bg-stone-900/70 border border-stone-200/70 dark:border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-stone-900 dark:text-white">Pirith Ceremony</span>
              <span className="font-mono text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full">
                Pirith Mandapaya
              </span>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              Udula uses 108MP low-light capture inside the intricate Mandapaya; Hasaranga shoots the ceremonial relic processional and chanting monk circles.
            </p>
            <div className="pt-2 border-t border-stone-200/60 dark:border-white/10 flex items-center justify-between text-[11px] font-mono text-stone-500 dark:text-stone-400">
              <span>Lead: Udula</span>
              <span>+ Hasaranga & Sayul</span>
            </div>
          </div>

          {/* 3. Student Election */}
          <div className="p-5 rounded-2xl bg-white/70 dark:bg-stone-900/70 border border-stone-200/70 dark:border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-stone-900 dark:text-white">Prefect & Student Election</span>
              <span className="font-mono text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full">
                Ballot Stations
              </span>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              Sayul focuses on secret ballot voting booths and student emotions; Dulen documents the election commission tally boards and winner declarations.
            </p>
            <div className="pt-2 border-t border-stone-200/60 dark:border-white/10 flex items-center justify-between text-[11px] font-mono text-stone-500 dark:text-stone-400">
              <span>Lead: Sayul</span>
              <span>+ Dulen & Hasaranga</span>
            </div>
          </div>

          {/* 4. Morning Radio Program */}
          <div className="p-5 rounded-2xl bg-white/70 dark:bg-stone-900/70 border border-stone-200/70 dark:border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-stone-900 dark:text-white">Morning Radio Program</span>
              <span className="font-mono text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full">
                Studio Booth
              </span>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              Sayul captures agile candid moments inside the live broadcasting booth; Hasaranga isolates sound mixing consoles, microphones, and anchor duo chemistry.
            </p>
            <div className="pt-2 border-t border-stone-200/60 dark:border-white/10 flex items-center justify-between text-[11px] font-mono text-stone-500 dark:text-stone-400">
              <span>Lead: Sayul</span>
              <span>+ Hasaranga</span>
            </div>
          </div>

          {/* 5. School Parliament */}
          <div className="p-5 rounded-2xl bg-white/70 dark:bg-stone-900/70 border border-stone-200/70 dark:border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-stone-900 dark:text-white">School Parliament</span>
              <span className="font-mono text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full">
                Debating Chamber
              </span>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              Udula uses 4x periscope telephoto for the Speaker and ceremonial mace; Hasaranga documents ministerial speeches and parliamentary cross-bench debates.
            </p>
            <div className="pt-2 border-t border-stone-200/60 dark:border-white/10 flex items-center justify-between text-[11px] font-mono text-stone-500 dark:text-stone-400">
              <span>Lead: Udula</span>
              <span>+ Hasaranga & Dulen</span>
            </div>
          </div>

          {/* 6. Big Match & Sports */}
          <div className="p-5 rounded-2xl bg-white/70 dark:bg-stone-900/70 border border-stone-200/70 dark:border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-stone-900 dark:text-white">Big Match & Athletic Meets</span>
              <span className="font-mono text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full">
                Oval & Turf
              </span>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              Hasaranga shoots fast-action shutter plays at the boundary; Dulen tracks telephoto bowling wickets and Sayul captures student papare band energy.
            </p>
            <div className="pt-2 border-t border-stone-200/60 dark:border-white/10 flex items-center justify-between text-[11px] font-mono text-stone-500 dark:text-stone-400">
              <span>Lead: Hasaranga</span>
              <span>+ Dulen, Udula & Sayul</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
