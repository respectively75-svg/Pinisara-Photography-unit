import React, { useState } from 'react';
import {
  Camera,
  Smartphone,
  CheckCircle2,
  ArrowUpRight,
  Calendar,
  Send,
  Sparkles,
  Award,
  Clock,
  Compass,
  Users,
  HeartHandshake
} from 'lucide-react';
import { Photo } from '../types';
import { CREATOR_TEAM } from '../data/mockData';
import { CursorParallaxImage, ScrollParallaxReveal } from './ParallaxAndScroll';

interface PageCommonProps {
  photos: Photo[];
  onSelectPhoto: (photo: Photo) => void;
  onNavigate?: (page: any) => void;
}

/**
 * 1. SCOPE PAGE (Matches "Scope" in the uploaded reference video's bottom dock)
 * Honest breakdown of what Pinisara Photography covers & the actual cameras/phones we use.
 */
export const ScopePage: React.FC<PageCommonProps> = ({ photos, onSelectPhoto, onNavigate }) => {
  const scopePillars = [
    {
      num: '01',
      title: 'Morning Assemblies & Flag Hoisting',
      tools: 'Canon Kiss F + Samsung S20 Ultra',
      desc: 'Standing on the quadrangle steps before 7:30 AM to capture the National & College flags, Principal’s address, and student medal winners.',
      photo: photos[0]
    },
    {
      num: '02',
      title: 'Annual All-Night Pirith & Ceremonies',
      tools: 'Canon 2000D (50mm f/1.8) + Phones',
      desc: 'Low-light handheld photos of the Pirith Mandapaya, oil lamps, and traditional procession without using distracting flash.',
      photo: photos[1] || photos[2]
    },
    {
      num: '03',
      title: 'Prefect Elections & Student Parliament',
      tools: 'iPhone 13 + S20 Ultra 4x Zoom',
      desc: 'Documenting student voting booths, ballot counting, and parliamentary debates from the hall floor and balcony.',
      photo: photos[4] || photos[8]
    },
    {
      num: '04',
      title: 'Morning Radio & Inter-House Sports',
      tools: 'All 2 Cameras & 2 Phones',
      desc: 'From the tiny morning broadcast studio to the cricket boundary rope—catching candid laughs, wickets, and finish-line sprints.',
      photo: photos[6] || photos[0]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16 sm:py-24 space-y-24 animate-apple-blur-in">
      {/* Hero */}
      <ScrollParallaxReveal speed={0.04} className="max-w-3xl space-y-4">
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-stone-500 dark:text-white/65 block">
          Scope & Gear · Pinisara Photography
        </span>
        <h1 className="font-sans font-normal text-4xl sm:text-6xl text-stone-900 dark:text-white tracking-tight leading-[1.08]">
          No cinema rigs. Just our cameras, phones, and school spirit.
        </h1>
        <p className="text-sm sm:text-base text-stone-600 dark:text-white/75 leading-relaxed">
          Here is everything our student photography society covers at{' '}
          <strong className="text-stone-900 dark:text-white">Pinnawala Central College</strong> and the exact everyday gear we carry in our school bags.
        </p>
      </ScrollParallaxReveal>

      {/* 4 Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {scopePillars.map((item) => (
          <ScrollParallaxReveal key={item.num} speed={0.05}>
            <div className="rounded-3xl ultra-glass p-6 sm:p-8 space-y-6 flex flex-col justify-between h-full">
              <div className="space-y-4">
                <div className="flex items-center justify-between font-mono text-xs text-stone-500 dark:text-white/65">
                  <span>SCOPE / {item.num}</span>
                  <span>{item.tools}</span>
                </div>

                {item.photo && (
                  <CursorParallaxImage
                    src={item.photo.webUrl}
                    alt={item.title}
                    intensity={22}
                    tiltIntensity={4}
                    onClick={() => item.photo && onSelectPhoto(item.photo)}
                    containerClassName="w-full aspect-16/10 rounded-2xl cursor-pointer border border-stone-200 dark:border-white/15"
                  />
                )}

                <h3 className="font-source-serif text-2xl text-stone-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-white/75 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-stone-200/70 dark:border-white/15 flex items-center justify-between text-xs">
                <span className="font-mono opacity-75">Free for all students & teachers</span>
                <button
                  onClick={() => item.photo && onSelectPhoto(item.photo)}
                  className="font-semibold flex items-center gap-1 hover:opacity-75"
                >
                  <span>Sample Shot</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </ScrollParallaxReveal>
        ))}
      </div>

      {/* Our Honest Gear Table */}
      <ScrollParallaxReveal speed={0.03} className="rounded-3xl ultra-glass p-8 sm:p-12 space-y-8">
        <div className="max-w-2xl space-y-2">
          <span className="font-mono text-[11px] uppercase tracking-widest text-stone-500 dark:text-white/65">
            What’s in Our School Bags
          </span>
          <h2 className="font-source-serif text-3xl sm:text-4xl text-stone-900 dark:text-white">
            2 Entry-Level DSLRs & 2 Smartphones
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CREATOR_TEAM.map((member) => {
            const isPhone = member.camera.includes('iPhone') || member.camera.includes('Samsung');
            return (
              <div
                key={member.id}
                className="p-5 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-2xl border border-stone-200/80 dark:border-white/15 space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center">
                  {isPhone ? <Smartphone className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-stone-900 dark:text-white">{member.camera}</h4>
                  <p className="text-xs font-mono text-stone-500 dark:text-white/65 mt-0.5">
                    Used by {member.name.split(' ')[0]}
                  </p>
                </div>
                <p className="text-xs text-stone-600 dark:text-white/75 leading-relaxed">
                  {member.lens}
                </p>
              </div>
            );
          })}
        </div>
      </ScrollParallaxReveal>
    </div>
  );
};

/**
 * 2. BEHIND THE SCENES (BTS) / FIELD NOTES PAGE
 */
export const BehindTheScenesPage: React.FC<PageCommonProps> = ({ photos, onSelectPhoto }) => {
  const btsMoments = [
    {
      title: 'Sharing SD Cards Between Period 4 & Interval',
      who: 'Hasaranga & Udula',
      story:
        'Right after Monday morning assembly finishes, we usually sit on the corridor steps with an OTG card reader plugged into a phone so we can quickly check which photos came out sharp before class starts.',
      photo: photos[0]
    },
    {
      title: 'Finding the Best Balcony Angle Without Blocking Anyone',
      who: 'Dulen & Sayul',
      story:
        'During Student Parliament and Pirith ceremonies, the main hall gets packed. Dulen uses the 4x zoom on his Samsung S20 Ultra from the side aisle while Sayul grabs wide shots on his iPhone 13.',
      photo: photos[2] || photos[1]
    },
    {
      title: '7:05 AM Inside the School Radio Room',
      who: 'Sayul & Hasaranga',
      story:
        'The radio booth is super small, so big tripods don’t fit. We lean against the doorway using natural window light to photograph the morning news readers.',
      photo: photos[6] || photos[0]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16 sm:py-24 space-y-20 animate-apple-blur-in">
      <ScrollParallaxReveal speed={0.04} className="max-w-3xl space-y-4">
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-stone-500 dark:text-white/65 block">
          Behind the Lens · Student Field Notes
        </span>
        <h1 className="font-sans font-normal text-4xl sm:text-6xl text-stone-900 dark:text-white tracking-tight">
          How we actually shoot at Pinnawala Central College
        </h1>
        <p className="text-sm sm:text-base text-stone-600 dark:text-white/75 leading-relaxed">
          Real stories from behind the camera—no scripts, no budgets, just four friends documenting school life.
        </p>
      </ScrollParallaxReveal>

      <div className="space-y-16">
        {btsMoments.map((item, idx) => (
          <ScrollParallaxReveal key={idx} speed={0.05}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center rounded-3xl ultra-glass p-6 sm:p-10">
              <div className="lg:col-span-7">
                {item.photo && (
                  <CursorParallaxImage
                    src={item.photo.originalUrl}
                    alt={item.title}
                    intensity={25}
                    tiltIntensity={4.5}
                    onClick={() => item.photo && onSelectPhoto(item.photo)}
                    containerClassName="w-full aspect-16/10 rounded-2xl cursor-pointer border border-stone-200 dark:border-white/15"
                  />
                )}
              </div>
              <div className="lg:col-span-5 space-y-4">
                <span className="px-3 py-1 rounded-full glass-pill text-[11px] font-mono">
                  Field Note 0{idx + 1} · {item.who}
                </span>
                <h3 className="font-source-serif text-2xl sm:text-3xl text-stone-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-white/80 leading-relaxed">
                  {item.story}
                </p>
              </div>
            </div>
          </ScrollParallaxReveal>
        ))}
      </div>
    </div>
  );
};

/**
 * 3. HALL OF FAME / EXHIBITION ROOM PAGE
 */
export const ExhibitionsPage: React.FC<PageCommonProps> = ({ photos, onSelectPhoto }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16 sm:py-24 space-y-20 animate-apple-blur-in">
      <ScrollParallaxReveal speed={0.04} className="text-center max-w-3xl mx-auto space-y-4">
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-stone-500 dark:text-white/65 block">
          Pinisara Photography · Digital Exhibition Room
        </span>
        <h1 className="font-source-serif font-normal text-4xl sm:text-6xl text-stone-900 dark:text-white tracking-tight">
          Pinnawala Central Hall of Fame
        </h1>
        <p className="text-sm sm:text-base text-stone-600 dark:text-white/75 leading-relaxed">
          Our favorite frames of the year, presented with museum-style spacing and interactive cursor parallax.
        </p>
      </ScrollParallaxReveal>

      <div className="space-y-24">
        {photos.slice(0, 6).map((photo, idx) => (
          <ScrollParallaxReveal key={photo.id} speed={0.06}>
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="p-4 sm:p-8 rounded-3xl ultra-glass border border-stone-200 dark:border-white/20 shadow-2xl">
                <CursorParallaxImage
                  src={photo.originalUrl}
                  alt={photo.title}
                  intensity={30}
                  tiltIntensity={5}
                  onClick={() => onSelectPhoto(photo)}
                  containerClassName="w-full aspect-16/10 rounded-2xl cursor-pointer"
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-widest opacity-60 block">
                    PLATE 0{idx + 1} · {photo.dateTaken}
                  </span>
                  <h3 className="font-source-serif text-2xl text-stone-900 dark:text-white">
                    {photo.title}
                  </h3>
                </div>
                <div className="text-xs font-mono opacity-80">
                  {photo.photographerName} · {photo.camera} ({photo.settings})
                </div>
              </div>
            </div>
          </ScrollParallaxReveal>
        ))}
      </div>
    </div>
  );
};

/**
 * 4. SCHOOL CHRONICLE / TIMELINE PAGE
 */
export const ChroniclePage: React.FC<PageCommonProps> = ({ photos, onSelectPhoto }) => {
  const milestones = [
    {
      date: 'January 2026',
      title: 'New Term Main Assembly',
      desc: 'First full-school assembly of the year at the Pinnawala Central College main quadrangle.',
      photo: photos[0]
    },
    {
      date: 'February 2026',
      title: 'Annual All-Night Pirith Ceremony',
      desc: 'Overnight coverage of the Pirith Mandapaya and morning almsgiving.',
      photo: photos[1]
    },
    {
      date: 'March 2026',
      title: 'Prefect Council Election & Parliament Sitting',
      desc: 'Student voting day and the ceremonial Student Parliament session.',
      photo: photos[4] || photos[0]
    },
    {
      date: 'April 2026',
      title: 'Morning Radio Broadcasts & Cricket Season',
      desc: 'Daily morning studio dispatches and inter-school cricket action.',
      photo: photos[6] || photos[1]
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-16 sm:py-24 space-y-20 animate-apple-blur-in">
      <ScrollParallaxReveal speed={0.04} className="max-w-3xl space-y-4">
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-stone-500 dark:text-white/65 block">
          Chronicle · School Yearbook Timeline
        </span>
        <h1 className="font-sans font-normal text-4xl sm:text-6xl text-stone-900 dark:text-white tracking-tight">
          2026 School Timeline
        </h1>
        <p className="text-sm sm:text-base text-stone-600 dark:text-white/75">
          Every major milestone at Pinnawala Central College documented in chronological order.
        </p>
      </ScrollParallaxReveal>

      <div className="relative border-l border-stone-300 dark:border-white/20 ml-4 sm:ml-8 pl-6 sm:pl-12 space-y-16">
        {milestones.map((m, idx) => (
          <ScrollParallaxReveal key={idx} speed={0.05} className="relative">
            <div className="absolute -left-[31px] sm:-left-[55px] top-1.5 w-3.5 h-3.5 rounded-full bg-black dark:bg-white border-2 border-white dark:border-black" />
            <div className="rounded-3xl ultra-glass p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-5 space-y-2">
                <span className="font-mono text-xs opacity-65">{m.date}</span>
                <h3 className="font-source-serif text-2xl text-stone-900 dark:text-white">{m.title}</h3>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-white/75 leading-relaxed">
                  {m.desc}
                </p>
              </div>
              <div className="md:col-span-7">
                {m.photo && (
                  <CursorParallaxImage
                    src={m.photo.webUrl}
                    alt={m.title}
                    intensity={20}
                    tiltIntensity={4}
                    onClick={() => m.photo && onSelectPhoto(m.photo)}
                    containerClassName="w-full aspect-16/9 rounded-2xl cursor-pointer border border-stone-200 dark:border-white/15"
                  />
                )}
              </div>
            </div>
          </ScrollParallaxReveal>
        ))}
      </div>
    </div>
  );
};

/**
 * 5. LET'S TALK / JOIN OR REQUEST COVERAGE PAGE (Matches "Let's Talk" in the uploaded video dock)
 */
export const LetsTalkPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [purpose, setPurpose] = useState('Cover a School Society Event');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-16 sm:py-24 space-y-14 animate-apple-blur-in">
      <ScrollParallaxReveal speed={0.04} className="space-y-4">
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-stone-500 dark:text-white/65 block">
          Let’s Talk · Pinisara Photography Society
        </span>
        <h1 className="font-sans font-normal text-4xl sm:text-6xl text-stone-900 dark:text-white tracking-tight">
          Need photos for a school event, or want to join our club?
        </h1>
        <p className="text-sm sm:text-base text-stone-600 dark:text-white/75 leading-relaxed">
          Whether your society at <strong className="text-stone-900 dark:text-white">Pinnawala Central College</strong> has an upcoming event, or you’re a student who loves taking photos on your phone or camera—drop us a note below.
        </p>
      </ScrollParallaxReveal>

      {submitted ? (
        <div className="rounded-3xl ultra-glass p-8 sm:p-12 text-center space-y-4">
          <CheckCircle2 className="w-10 h-10 mx-auto" />
          <h3 className="font-source-serif text-2xl">Thanks, {name}!</h3>
          <p className="text-xs sm:text-sm opacity-80 max-w-md mx-auto">
            Our club members (Hasaranga, Dulen, Sayul & Udula) got your message regarding “{purpose}”. See you at school!
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setName('');
              setMessage('');
            }}
            className="px-6 py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-semibold"
          >
            Send Another Message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="rounded-3xl ultra-glass p-6 sm:p-10 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-mono uppercase tracking-wider block mb-2">
                Your Name & Grade / Society *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Kavindu — Grade 12 Science Society"
                className="w-full px-4 py-3 rounded-2xl bg-stone-100 dark:bg-white/10 border border-stone-200 dark:border-white/20 text-xs sm:text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-mono uppercase tracking-wider block mb-2">
                What is this about?
              </label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-stone-100 dark:bg-black border border-stone-200 dark:border-white/20 text-xs sm:text-sm focus:outline-none"
              >
                <option value="Cover a School Society Event">Invite Pinisara to Cover a School Event</option>
                <option value="Join Pinisara Photography">Join Pinisara Photography (Phone or Camera)</option>
                <option value="Request Original Event Photos">Request Original Photos from an Event</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-wider block mb-2">
              Details (Date, Venue, or What Phone/Camera You Use)
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us when your school event is happening, or tell us how you'd like to help out..."
              className="w-full px-4 py-3 rounded-2xl bg-stone-100 dark:bg-white/10 border border-stone-200 dark:border-white/20 text-xs sm:text-sm focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="px-7 py-3.5 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-semibold inline-flex items-center gap-2 hover:opacity-85 transition-opacity"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send to Pinisara Photography</span>
          </button>
        </form>
      )}
    </div>
  );
};
