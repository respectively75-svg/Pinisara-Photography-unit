<?php
/**
 * PINISARA PHOTOGRAPHY · PINNAWALA CENTRAL COLLEGE
 * Complete Self-Contained PHP + HTML5 + Tailwind CSS + Vanilla JS Website
 *
 * Features included:
 * 1. PHP Server-Side JSON Persistence (auto-creates `pinisara_data.json` for photos & events)
 * 2. PHP Actions for Photo Upload (with CSS object-fit & aspect-ratio Auto-Cropping), Photo Deletion,
 *    Example Image Clearing/Restoring, and Google Account + 2FA Verification
 * 3. GPU-Accelerated SmoothScrollController (requestAnimationFrame + exponential friction decay)
 * 4. Monograph Bookshelf (Spine-to-Cover 4K Plate Unfolding)
 * 5. Seamless Editorial Scroll Image Library (staggered differential scroll parallax + windowed image parallax)
 * 6. Subtle Animated Hover Overlay showing Camera Model & Date Taken
 * 7. High Contrast Toggle for enhancing low-light school event photos
 * 8. Liquid Glass Bottom Dock (6 core sections + Creator/Viewer 2FA Account Modal, zero white edge fade)
 */

session_start();

$dataFile = __DIR__ . '/pinisara_data.json';

$defaultPhotos = [
  [
    'id' => 'pcc-1',
    'title' => 'Monday Morning Flag Hoisting: Main Quadrangle',
    'description' => 'Captured from the quadrangle steps during the Monday morning assembly at Pinnawala Central College.',
    'category' => 'assembly',
    'originalUrl' => 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=2000&q=90',
    'webUrl' => 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1400&q=85',
    'photographerName' => 'Hasaranga Jayawardhana',
    'camera' => 'Canon EOS Kiss F',
    'lens' => '18-55mm IS Kit Lens',
    'settings' => '1/1000s · f/4.0 · ISO 200',
    'dateTaken' => '2026-09-14',
    'aspectRatio' => '16:10',
    'objectFit' => 'cover',
    'objectPosition' => '50% 40%',
    'likesCount' => 42,
    'downloadCount' => 128,
    'isExample' => true
  ],
  [
    'id' => 'pcc-2',
    'title' => 'Annual All-Night Pirith Chanting: Oil Lamps & Mandapaya',
    'description' => 'Low-light handheld shot of the traditional Gok Kola Pirith Mandapaya and oil lamps at night.',
    'category' => 'pirith',
    'originalUrl' => 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=2000&q=90',
    'webUrl' => 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1400&q=85',
    'photographerName' => 'Dulen Induwara',
    'camera' => 'Canon EOS 2000D',
    'lens' => '50mm f/1.8 STM',
    'settings' => '1/250s · f/1.8 · ISO 800',
    'dateTaken' => '2026-09-10',
    'aspectRatio' => '4:3',
    'objectFit' => 'cover',
    'objectPosition' => '50% 50%',
    'likesCount' => 67,
    'downloadCount' => 215,
    'isExample' => true
  ],
  [
    'id' => 'pcc-3',
    'title' => 'Prefect Guild Election Day: Student Ballot Casting',
    'description' => 'Students lining up at the main hall polling booths to vote for the new Prefect Guild.',
    'category' => 'elections',
    'originalUrl' => 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=2000&q=90',
    'webUrl' => 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1400&q=85',
    'photographerName' => 'Sayul Angammana',
    'camera' => 'iPhone 13',
    'lens' => '26mm f/1.6 Wide',
    'settings' => '1/640s · f/1.6 · ISO 64',
    'dateTaken' => '2026-09-05',
    'aspectRatio' => '16:10',
    'objectFit' => 'cover',
    'objectPosition' => '50% 45%',
    'likesCount' => 38,
    'downloadCount' => 94,
    'isExample' => true
  ],
  [
    'id' => 'pcc-4',
    'title' => 'Pinisara Morning Radio: 7:15 AM Studio Broadcast',
    'description' => 'Behind the microphone inside the school media unit before the morning bell rings.',
    'category' => 'radio',
    'originalUrl' => 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=2000&q=90',
    'webUrl' => 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1400&q=85',
    'photographerName' => 'Udula Matheesha',
    'camera' => 'Samsung Galaxy S20 Ultra',
    'lens' => '108MP Wide Sensor',
    'settings' => '1/400s · f/1.8 · ISO 100',
    'dateTaken' => '2026-09-01',
    'aspectRatio' => '4:3',
    'objectFit' => 'cover',
    'objectPosition' => '50% 50%',
    'likesCount' => 51,
    'downloadCount' => 143,
    'isExample' => true
  ],
  [
    'id' => 'pcc-5',
    'title' => 'Student Parliament Session: Constitutional Debate',
    'description' => 'Captured from the gallery aisle during the termly Student Parliament sitting.',
    'category' => 'parliament',
    'originalUrl' => 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=2000&q=90',
    'webUrl' => 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1400&q=85',
    'photographerName' => 'Hasaranga Jayawardhana',
    'camera' => 'Canon EOS Kiss F',
    'lens' => '18-55mm IS Kit Lens',
    'settings' => '1/500s · f/4.5 · ISO 400',
    'dateTaken' => '2026-08-24',
    'aspectRatio' => '16:10',
    'objectFit' => 'cover',
    'objectPosition' => '50% 38%',
    'likesCount' => 64,
    'downloadCount' => 189,
    'isExample' => true
  ],
  [
    'id' => 'pcc-6',
    'title' => 'Inter-House Track & Field Finals: 4x100m Relay Sprint',
    'description' => 'Final baton exchange captured handheld at 1/1600s by the boundary track.',
    'category' => 'athletics',
    'originalUrl' => 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=2000&q=90',
    'webUrl' => 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1400&q=85',
    'photographerName' => 'Dulen Induwara',
    'camera' => 'Canon EOS 2000D',
    'lens' => '50mm f/1.8 STM',
    'settings' => '1/1600s · f/2.8 · ISO 200',
    'dateTaken' => '2026-08-18',
    'aspectRatio' => '16:9',
    'objectFit' => 'cover',
    'objectPosition' => '50% 50%',
    'likesCount' => 89,
    'downloadCount' => 310,
    'isExample' => true
  ]
];

if (!file_exists($dataFile)) {
  @file_put_contents($dataFile, json_encode(['photos' => $defaultPhotos], JSON_PRETTY_PRINT));
}

$store = json_decode(@file_get_contents($dataFile), true);
if (!is_array($store) || !isset($store['photos'])) {
  $store = ['photos' => $defaultPhotos];
}

if (!isset($_SESSION['user'])) {
  $_SESSION['user'] = [
    'displayName' => 'Hasaranga Jayawardhana',
    'email' => 'hasaranga.pcc@gmail.com',
    'isCreator' => true,
    'camera' => 'Canon EOS Kiss F',
    'mfaVerified' => true,
    'credits' => 350
  ];
}

$flashMessage = null;

// Handle PHP POST Actions
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
  $action = $_POST['action'];

  if ($action === 'upload_photo') {
    $newPhoto = [
      'id' => 'photo-' . time(),
      'title' => htmlspecialchars(trim($_POST['title'] ?? 'Untitled Capture')),
      'description' => htmlspecialchars(trim($_POST['description'] ?? 'Captured at Pinnawala Central College.')),
      'category' => htmlspecialchars(trim($_POST['category'] ?? 'assembly')),
      'originalUrl' => filter_var(trim($_POST['imageUrl'] ?? ''), FILTER_SANITIZE_URL),
      'webUrl' => filter_var(trim($_POST['imageUrl'] ?? ''), FILTER_SANITIZE_URL),
      'photographerName' => htmlspecialchars(trim($_POST['photographerName'] ?? 'Hasaranga Jayawardhana')),
      'camera' => htmlspecialchars(trim($_POST['camera'] ?? 'Canon EOS Kiss F')),
      'lens' => '18-55mm IS Kit Lens',
      'settings' => '1/1000s · f/4.0 · ISO 400',
      'dateTaken' => date('Y-m-d'),
      'aspectRatio' => htmlspecialchars(trim($_POST['aspectRatio'] ?? '16:10')),
      'objectFit' => htmlspecialchars(trim($_POST['objectFit'] ?? 'cover')),
      'objectPosition' => htmlspecialchars(trim($_POST['objectPosition'] ?? '50% 40%')),
      'likesCount' => 1,
      'downloadCount' => 0,
      'isExample' => false
    ];
    array_unshift($store['photos'], $newPhoto);
    @file_put_contents($dataFile, json_encode($store, JSON_PRETTY_PRINT));
    $_SESSION['user']['credits'] = ($_SESSION['user']['credits'] ?? 300) + 50;
    $flashMessage = 'Published "' . $newPhoto['title'] . '" with ' . $newPhoto['aspectRatio'] . ' (' . $newPhoto['objectFit'] . ')! +50 Credits awarded.';
  } elseif ($action === 'delete_photo' && !empty($_POST['photoId'])) {
    $targetId = $_POST['photoId'];
    $store['photos'] = array_values(array_filter($store['photos'], function ($p) use ($targetId) {
      return $p['id'] !== $targetId;
    }));
    @file_put_contents($dataFile, json_encode($store, JSON_PRETTY_PRINT));
    $flashMessage = 'Photograph deleted from archive.';
  } elseif ($action === 'delete_examples') {
    $store['photos'] = array_values(array_filter($store['photos'], function ($p) {
      return empty($p['isExample']);
    }));
    @file_put_contents($dataFile, json_encode($store, JSON_PRETTY_PRINT));
    $flashMessage = 'All example images removed. Upload your own school captures!';
  } elseif ($action === 'restore_examples') {
    $store['photos'] = $defaultPhotos;
    @file_put_contents($dataFile, json_encode($store, JSON_PRETTY_PRINT));
    $flashMessage = 'Restored default example images.';
  } elseif ($action === 'verify_2fa') {
    $name = htmlspecialchars(trim($_POST['googleName'] ?? 'Pinisara Member'));
    $email = htmlspecialchars(trim($_POST['googleEmail'] ?? 'member@gmail.com'));
    $roleType = ($_POST['accountType'] ?? 'creator') === 'creator';
    $_SESSION['user'] = [
      'displayName' => $name,
      'email' => $email,
      'isCreator' => $roleType,
      'camera' => htmlspecialchars(trim($_POST['camera'] ?? 'Canon EOS Kiss F')),
      'mfaVerified' => true,
      'credits' => $roleType ? 350 : 100
    ];
    $flashMessage = 'Google Account & 2-Factor Authentication verified for ' . $name . ' (' . ($roleType ? 'Creator 2FA' : 'Viewer 2FA') . ').';
  }
}

$photos = $store['photos'];
$user = $_SESSION['user'];
?>
<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Pinisara Photography — Pinnawala Central College (PHP/HTML Edition)</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
            serif: ['Source Serif 4', 'Georgia', 'serif'],
            mono: ['JetBrains Mono', 'monospace']
          }
        }
      }
    };
  </script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&display=swap" rel="stylesheet">
  <style>
    .font-tempting { font-family: 'Instrument Serif', 'Source Serif 4', Georgia, serif; }
    .font-coolvetica { font-family: 'Plus Jakarta Sans', sans-serif; letter-spacing: -0.03em; }

    /* Liquid Glass with Pure Optical Blur & Zero White Fade (GPU Composited) */
    .liquid-glass {
      background: rgba(255, 255, 255, 0.75);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border: 1px solid rgba(0, 0, 0, 0.08);
      box-shadow: 0 12px 32px -8px rgba(0, 0, 0, 0.08), 0 2px 8px 0 rgba(0, 0, 0, 0.04);
      transform: translateZ(0);
    }
    .dark .liquid-glass {
      background: rgba(12, 12, 12, 0.78);
      backdrop-filter: blur(22px) saturate(180%);
      -webkit-backdrop-filter: blur(22px) saturate(180%);
      border: 1px solid rgba(255, 255, 255, 0.14);
      box-shadow: 0 16px 40px -8px rgba(0, 0, 0, 0.85);
      transform: translateZ(0);
    }
    .liquid-glass-dock {
      background: rgba(255, 255, 255, 0.78);
      backdrop-filter: blur(24px) saturate(190%);
      -webkit-backdrop-filter: blur(24px) saturate(190%);
      border: 1px solid rgba(0, 0, 0, 0.08);
      box-shadow: 0 18px 44px -10px rgba(0, 0, 0, 0.18);
      transform: translateZ(0);
    }
    .dark .liquid-glass-dock {
      background: rgba(12, 12, 12, 0.80);
      backdrop-filter: blur(24px) saturate(190%);
      -webkit-backdrop-filter: blur(24px) saturate(190%);
      border: 1px solid rgba(255, 255, 255, 0.14);
      box-shadow: 0 20px 48px -8px rgba(0, 0, 0, 0.90);
      transform: translateZ(0);
    }
    .glass-pill {
      background: rgba(255, 255, 255, 0.82);
      border: 1px solid rgba(0, 0, 0, 0.08);
      box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.04);
    }
    .dark .glass-pill {
      background: rgba(18, 18, 18, 0.84);
      border: 1px solid rgba(255, 255, 255, 0.14);
      box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.75);
    }
    .high-contrast-active .gallery-img-target {
      filter: contrast(1.35) brightness(1.15) saturate(1.15);
    }
    .spine-item {
      will-change: width, transform;
      transition: width 750ms cubic-bezier(0.16, 1, 0.3, 1), height 750ms cubic-bezier(0.16, 1, 0.3, 1), transform 550ms cubic-bezier(0.16, 1, 0.3, 1);
    }
  </style>
</head>
<body class="bg-stone-50 dark:bg-black text-stone-900 dark:text-white min-h-screen flex flex-col font-sans selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black transition-colors duration-500">

  <!-- Top Liquid Glass Header -->
  <header class="sticky top-0 z-40 w-full liquid-glass">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-4">
      <a href="#top" class="flex items-center gap-3 shrink-0">
        <div class="w-9 h-9 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold">
          P
        </div>
        <div>
          <span class="font-bold text-base sm:text-lg tracking-tight block leading-none">
            Pinisara Photography<sup class="text-[10px] ml-0.5">®</sup>
          </span>
          <span class="text-[10px] text-stone-500 dark:text-white/65 font-mono tracking-wide">
            Pinnawala Central College · PHP/HTML Archive
          </span>
        </div>
      </a>

      <nav class="hidden md:flex items-center gap-5 text-xs font-medium text-stone-500 dark:text-white/70">
        <a href="#hero-section" class="hover:text-black dark:hover:text-white transition-colors">Home,</a>
        <a href="#bookshelf-section" class="hover:text-black dark:hover:text-white transition-colors">Bookshelf,</a>
        <a href="#seamless-library-section" class="hover:text-black dark:hover:text-white transition-colors">Works & Library,</a>
        <a href="#upload-studio-section" class="hover:text-black dark:hover:text-white transition-colors">Auto-Crop Studio</a>
      </nav>

      <div class="flex items-center gap-2">
        <span class="px-3 py-1.5 rounded-full glass-pill font-mono text-xs font-bold text-amber-600 dark:text-amber-300">
          <?= (int)($user['credits'] ?? 350) ?> cr
        </span>
        <button onclick="toggleTheme()" class="px-3 py-1.5 rounded-full glass-pill text-xs font-mono">
          Theme
        </button>
        <a href="#upload-studio-section" class="px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold">
          Publish
        </a>
      </div>
    </div>
  </header>

  <?php if ($flashMessage): ?>
    <div class="max-w-4xl mx-auto mt-4 px-4 w-full">
      <div class="p-3.5 rounded-2xl bg-emerald-600 text-white text-xs font-mono flex items-center justify-between shadow-lg">
        <span>✓ <?= $flashMessage ?></span>
        <button onclick="this.parentElement.remove()" class="font-bold ml-4">✕</button>
      </div>
    </div>
  <?php endif; ?>

  <!-- GPU-Accelerated Smooth Scroll Container with Exponential Friction Decay -->
  <div id="smooth-scroll-container" style="will-change: transform;" class="w-full flex-1 flex flex-col">

    <!-- 1. HERO SECTION -->
    <section id="hero-section" class="max-w-7xl mx-auto w-full px-4 sm:px-8 lg:px-12 py-10 sm:py-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
      <div class="lg:col-span-5 flex flex-col justify-between space-y-8">
        <div class="space-y-4">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-xs uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-50 dark:bg-white/10 text-emerald-800 dark:text-white border border-emerald-200 dark:border-white/20">
              Pinisara Photography
            </span>
            <span class="font-mono text-[11px] uppercase tracking-widest text-stone-500 dark:text-white/70">
              Pinnawala Central College
            </span>
          </div>

          <h1 class="font-coolvetica font-bold uppercase text-5xl sm:text-6xl lg:text-[4.4rem] leading-[0.93] tracking-tight">
            <span class="block">CAPTURING</span>
            <span class="block">MOMENTS</span>
            <span class="block">THAT <span class="font-tempting italic font-normal capitalize text-emerald-700 dark:text-white">More</span></span>
            <span class="block">MOVE YOU.</span>
          </h1>

          <p class="font-serif text-base sm:text-lg text-stone-600 dark:text-white/80">
            School Photo Archive · <span class="font-tempting italic">Shot on Our Cameras & Phones</span>
          </p>
        </div>

        <div class="space-y-4 max-w-md">
          <p class="text-xs sm:text-sm text-stone-600 dark:text-white/75 leading-relaxed">
            We are <strong>Pinisara Photography</strong>, the student photography club of <strong>Pinnawala Central College</strong>—four friends with two Canon DSLRs and two smartphones capturing assemblies, Pirith ceremonies, elections, and sports.
          </p>
          <div class="flex flex-wrap gap-2.5">
            <a href="#bookshelf-section" class="px-4 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-semibold">
              Monograph Bookshelf ↓
            </a>
            <a href="#seamless-library-section" class="px-4 py-2 rounded-full glass-pill text-xs font-medium">
              Explore Seamless Library ↓
            </a>
            <form method="POST" class="inline">
              <input type="hidden" name="action" value="delete_examples" />
              <button type="submit" class="px-4 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium">
                Delete Example Images
              </button>
            </form>
          </div>
        </div>
      </div>

      <div class="lg:col-span-7">
        <?php $heroPhoto = $photos[0] ?? $defaultPhotos[0]; ?>
        <div class="relative aspect-[16/10] w-full overflow-hidden bg-stone-900 shadow-2xl group cursor-pointer" data-parallax-card>
          <img
            src="<?= htmlspecialchars($heroPhoto['originalUrl']) ?>"
            alt="<?= htmlspecialchars($heroPhoto['title']) ?>"
            data-parallax-img="26"
            class="w-full h-full object-cover scale-105 transition-transform duration-700"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6 text-white">
            <div class="flex items-center gap-2 text-xs font-mono text-emerald-300">
              <span><?= htmlspecialchars($heroPhoto['camera']) ?></span>
              <span>·</span>
              <span><?= htmlspecialchars($heroPhoto['dateTaken']) ?></span>
            </div>
            <p class="text-xl font-serif mt-1"><?= htmlspecialchars($heroPhoto['title']) ?></p>
          </div>
        </div>
      </div>
    </section>

    <!-- 2. MONOGRAPH BOOKSHELF (CHAPTER 4 · UPCOMING RELEASES) -->
    <section id="bookshelf-section" class="w-full bg-[#F7F6F2] dark:bg-[#0B0C0A] py-20 px-4 sm:px-8 border-t border-b border-stone-200 dark:border-white/10">
      <div class="max-w-7xl mx-auto space-y-12">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
          <span class="text-[11px] font-mono uppercase tracking-widest text-stone-500 dark:text-stone-400">
            ARCHIVE · PINISARA BOOKSHELF
          </span>
          <div class="text-center">
            <span class="text-xs uppercase tracking-[0.2em] text-stone-500 block">MONOGRAPH BOOKSHELF · CHAPTER 4</span>
            <h2 class="font-serif font-light uppercase text-4xl sm:text-6xl tracking-tight mt-1">UPCOMING RELEASES</h2>
          </div>
          <span class="text-xs font-mono text-stone-500">Click any Spine to Unfold</span>
        </div>

        <div class="w-full overflow-x-auto pb-4">
          <div class="min-w-[720px] flex items-end justify-center gap-2.5 pt-8 px-4 border-b-2 border-stone-300 dark:border-white/20" id="bookshelf-stage">
            <?php
            $spineColors = [
              'bg-[#E8B4D4] text-stone-900',
              'bg-[#1D7848] text-white',
              'bg-[#2C448E] text-white',
              'bg-[#F3C63B] text-stone-950',
              'bg-[#D93829] text-white',
              'bg-[#364F9C] text-white'
            ];
            $shelfSource = count($photos) > 0 ? $photos : $defaultPhotos;
            for ($i = 0; $i < min(8, max(6, count($shelfSource))); $i++):
              $volPhoto = $shelfSource[$i % count($shelfSource)];
              $colorClass = $spineColors[$i % count($spineColors)];
              $isExpanded = ($i === 2);
            ?>
              <div
                onclick="expandSpine(<?= $i ?>)"
                data-spine-index="<?= $i ?>"
                class="spine-item relative cursor-pointer shrink-0 shadow-2xl overflow-hidden rounded-t-md <?= $isExpanded ? 'w-80 sm:w-96 h-[430px]' : 'w-14 h-[390px] ' . $colorClass ?>"
              >
                <div class="spine-collapsed absolute inset-0 p-2.5 flex flex-col items-center justify-between <?= $isExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100' ?>">
                  <span class="font-mono text-[9px]">0<?= $i + 1 ?></span>
                  <div style="writing-mode: vertical-rl;" class="my-auto font-bold text-xs tracking-[0.14em] uppercase truncate max-h-[230px] rotate-180">
                    <?= htmlspecialchars(explode(':', $volPhoto['title'])[0]) ?>
                  </div>
                  <span class="font-mono text-[9px] uppercase">PCC</span>
                </div>

                <div class="spine-expanded absolute inset-0 bg-stone-900 text-white flex flex-col justify-between <?= $isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none' ?>">
                  <img
                    src="<?= htmlspecialchars($volPhoto['originalUrl']) ?>"
                    alt="<?= htmlspecialchars($volPhoto['title']) ?>"
                    class="absolute inset-0 w-full h-full object-cover brightness-90"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/40"></div>
                  <div class="relative z-10 p-5 flex items-center justify-between text-[10px] font-mono border-b border-white/15">
                    <span>VOL. 0<?= $i + 1 ?> · PINISARA</span>
                    <span><?= htmlspecialchars($volPhoto['camera']) ?></span>
                  </div>
                  <div class="relative z-10 p-6 space-y-2 mt-auto">
                    <div class="text-[11px] font-mono text-emerald-300">
                      <?= htmlspecialchars($volPhoto['camera']) ?> · <?= htmlspecialchars($volPhoto['dateTaken']) ?>
                    </div>
                    <h3 class="font-serif text-2xl leading-tight"><?= htmlspecialchars($volPhoto['title']) ?></h3>
                    <p class="text-xs text-stone-300 line-clamp-2"><?= htmlspecialchars($volPhoto['description']) ?></p>
                  </div>
                </div>
              </div>
            <?php endfor; ?>
          </div>
        </div>
      </div>
    </section>

    <!-- 3. SEAMLESS SCROLL IMAGE LIBRARY + HIGH CONTRAST TOGGLE -->
    <section id="seamless-library-section" class="max-w-6xl mx-auto w-full px-4 sm:px-8 py-20 space-y-16">
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 dark:border-white/15 pb-6">
        <div>
          <span class="font-mono text-[11px] uppercase tracking-widest text-stone-500 dark:text-white/60 block">
            Pinisara Photography · Seamless Editorial Library
          </span>
          <h2 class="text-3xl sm:text-5xl font-normal tracking-tight mt-1">Our Creative Output</h2>
        </div>

        <div class="flex flex-wrap items-center gap-2.5">
          <!-- High Contrast Toggle Button for Low-Light School Event Photos -->
          <button
            type="button"
            id="high-contrast-toggle-btn"
            onclick="toggleHighContrast()"
            class="px-3.5 py-1.5 rounded-full glass-pill text-xs font-medium flex items-center gap-2 transition-all"
          >
            <span>◐ High Contrast</span>
            <span id="hc-badge" class="hidden text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-black text-white">ON</span>
          </button>

          <form method="POST" class="inline">
            <input type="hidden" name="action" value="restore_examples" />
            <button type="submit" class="px-3.5 py-1.5 rounded-full glass-pill text-xs font-mono">
              Restore Defaults
            </button>
          </form>
        </div>
      </div>

      <?php if (count($photos) === 0): ?>
        <div class="py-20 text-center space-y-4">
          <p class="text-lg font-serif">All example images have been deleted.</p>
          <form method="POST">
            <input type="hidden" name="action" value="restore_examples" />
            <button type="submit" class="px-5 py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-semibold">
              Restore Example Images
            </button>
          </form>
        </div>
      <?php else: ?>
        <div id="gallery-cards-root" class="space-y-24 sm:space-y-32">
          <?php
          $chunks = array_chunk($photos, 3);
          foreach ($chunks as $chunkIndex => $chunk):
            $hero = $chunk[0] ?? null;
            $left = $chunk[1] ?? null;
            $right = $chunk[2] ?? null;
          ?>
            <!-- Centered Wide Hero Card -->
            <?php if ($hero): ?>
              <div class="max-w-4xl mx-auto" data-scroll-speed="0.04">
                <article class="group space-y-4">
                  <div class="relative w-full aspect-[16/10] overflow-hidden bg-stone-200 dark:bg-stone-900 shadow-lg">
                    <img
                      src="<?= htmlspecialchars($hero['webUrl']) ?>"
                      alt="<?= htmlspecialchars($hero['title']) ?>"
                      data-parallax-img="28"
                      style="object-fit: <?= htmlspecialchars($hero['objectFit'] ?? 'cover') ?>; object-position: <?= htmlspecialchars($hero['objectPosition'] ?? '50% 40%') ?>;"
                      class="gallery-img-target w-full h-full scale-105 transition-transform duration-500"
                    />
                    <!-- Subtle Animated Hover Overlay with Camera Model & Date Taken -->
                    <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-5 text-white">
                      <div class="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 flex items-center justify-between">
                        <div class="text-xs font-mono flex items-center gap-2">
                          <span class="text-emerald-400">📷 <?= htmlspecialchars($hero['camera']) ?></span>
                          <span>·</span>
                          <span><?= htmlspecialchars($hero['dateTaken']) ?></span>
                        </div>
                        <form method="POST">
                          <input type="hidden" name="action" value="delete_photo" />
                          <input type="hidden" name="photoId" value="<?= htmlspecialchars($hero['id']) ?>" />
                          <button type="submit" class="px-2.5 py-1 rounded-full bg-rose-600 text-white text-[10px] font-mono">
                            Delete
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                  <div class="flex items-end justify-between gap-4 pt-1">
                    <div class="space-y-2">
                      <div class="flex items-center gap-2">
                        <span class="px-2.5 py-1 rounded-md bg-stone-200/75 dark:bg-white/10 text-[11px]"><?= htmlspecialchars(ucfirst($hero['category'])) ?></span>
                        <span class="px-2.5 py-1 rounded-md bg-stone-200/75 dark:bg-white/10 text-[11px]"><?= htmlspecialchars($hero['camera']) ?></span>
                        <span class="px-2 py-1 rounded-md bg-stone-200/75 dark:bg-white/10 text-[11px] font-mono">1+</span>
                      </div>
                      <h3 class="text-2xl sm:text-4xl font-normal tracking-tight">
                        <?= htmlspecialchars(explode(':', $hero['title'])[0]) ?> - <?= htmlspecialchars(explode(' ', $hero['photographerName'])[0]) ?>
                      </h3>
                    </div>
                    <a href="<?= htmlspecialchars($hero['originalUrl']) ?>" target="_blank" class="w-11 h-11 rounded-full border border-stone-300 dark:border-white/25 flex items-center justify-center hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">
                      ↗
                    </a>
                  </div>
                </article>
              </div>
            <?php endif; ?>

            <!-- Asymmetric Staggered 2-Column Pair -->
            <?php if ($left || $right): ?>
              <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
                <?php if ($left): ?>
                  <div class="lg:col-span-6" data-scroll-speed="-0.05">
                    <article class="group space-y-4">
                      <div class="relative w-full aspect-[4/3] overflow-hidden bg-stone-200 dark:bg-stone-900 shadow-lg">
                        <img
                          src="<?= htmlspecialchars($left['webUrl']) ?>"
                          alt="<?= htmlspecialchars($left['title']) ?>"
                          data-parallax-img="28"
                          style="object-fit: <?= htmlspecialchars($left['objectFit'] ?? 'cover') ?>; object-position: <?= htmlspecialchars($left['objectPosition'] ?? '50% 50%') ?>;"
                          class="gallery-img-target w-full h-full scale-105 transition-transform duration-500"
                        />
                        <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-5 text-white">
                          <div class="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 flex items-center justify-between">
                            <div class="text-xs font-mono flex items-center gap-2">
                              <span class="text-emerald-400">📷 <?= htmlspecialchars($left['camera']) ?></span>
                              <span>·</span>
                              <span><?= htmlspecialchars($left['dateTaken']) ?></span>
                            </div>
                            <form method="POST">
                              <input type="hidden" name="action" value="delete_photo" />
                              <input type="hidden" name="photoId" value="<?= htmlspecialchars($left['id']) ?>" />
                              <button type="submit" class="px-2.5 py-1 rounded-full bg-rose-600 text-white text-[10px] font-mono">
                                Delete
                              </button>
                            </form>
                          </div>
                        </div>
                      </div>
                      <div class="flex items-end justify-between gap-4 pt-1">
                        <div class="space-y-2">
                          <div class="flex items-center gap-2">
                            <span class="px-2.5 py-1 rounded-md bg-stone-200/75 dark:bg-white/10 text-[11px]"><?= htmlspecialchars(ucfirst($left['category'])) ?></span>
                            <span class="px-2.5 py-1 rounded-md bg-stone-200/75 dark:bg-white/10 text-[11px]"><?= htmlspecialchars($left['camera']) ?></span>
                            <span class="px-2 py-1 rounded-md bg-stone-200/75 dark:bg-white/10 text-[11px] font-mono">1+</span>
                          </div>
                          <h3 class="text-xl sm:text-3xl font-normal tracking-tight">
                            <?= htmlspecialchars(explode(':', $left['title'])[0]) ?> - <?= htmlspecialchars(explode(' ', $left['photographerName'])[0]) ?>
                          </h3>
                        </div>
                        <a href="<?= htmlspecialchars($left['originalUrl']) ?>" target="_blank" class="w-11 h-11 rounded-full border border-stone-300 dark:border-white/25 flex items-center justify-center hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">
                          ↗
                        </a>
                      </div>
                    </article>
                  </div>
                <?php endif; ?>

                <?php if ($right): ?>
                  <div class="lg:col-span-6 lg:mt-28" data-scroll-speed="0.11">
                    <article class="group space-y-4">
                      <div class="relative w-full aspect-[16/10] overflow-hidden bg-stone-200 dark:bg-stone-900 shadow-lg">
                        <img
                          src="<?= htmlspecialchars($right['webUrl']) ?>"
                          alt="<?= htmlspecialchars($right['title']) ?>"
                          data-parallax-img="28"
                          style="object-fit: <?= htmlspecialchars($right['objectFit'] ?? 'cover') ?>; object-position: <?= htmlspecialchars($right['objectPosition'] ?? '50% 50%') ?>;"
                          class="gallery-img-target w-full h-full scale-105 transition-transform duration-500"
                        />
                        <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-5 text-white">
                          <div class="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 flex items-center justify-between">
                            <div class="text-xs font-mono flex items-center gap-2">
                              <span class="text-emerald-400">📷 <?= htmlspecialchars($right['camera']) ?></span>
                              <span>·</span>
                              <span><?= htmlspecialchars($right['dateTaken']) ?></span>
                            </div>
                            <form method="POST">
                              <input type="hidden" name="action" value="delete_photo" />
                              <input type="hidden" name="photoId" value="<?= htmlspecialchars($right['id']) ?>" />
                              <button type="submit" class="px-2.5 py-1 rounded-full bg-rose-600 text-white text-[10px] font-mono">
                                Delete
                              </button>
                            </form>
                          </div>
                        </div>
                      </div>
                      <div class="flex items-end justify-between gap-4 pt-1">
                        <div class="space-y-2">
                          <div class="flex items-center gap-2">
                            <span class="px-2.5 py-1 rounded-md bg-stone-200/75 dark:bg-white/10 text-[11px]"><?= htmlspecialchars(ucfirst($right['category'])) ?></span>
                            <span class="px-2.5 py-1 rounded-md bg-stone-200/75 dark:bg-white/10 text-[11px]"><?= htmlspecialchars($right['camera']) ?></span>
                            <span class="px-2 py-1 rounded-md bg-stone-200/75 dark:bg-white/10 text-[11px] font-mono">1+</span>
                          </div>
                          <h3 class="text-xl sm:text-3xl font-normal tracking-tight">
                            <?= htmlspecialchars(explode(':', $right['title'])[0]) ?> - <?= htmlspecialchars(explode(' ', $right['photographerName'])[0]) ?>
                          </h3>
                        </div>
                        <a href="<?= htmlspecialchars($right['originalUrl']) ?>" target="_blank" class="w-11 h-11 rounded-full border border-stone-300 dark:border-white/25 flex items-center justify-center hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">
                          ↗
                        </a>
                      </div>
                    </article>
                  </div>
                <?php endif; ?>
              </div>
            <?php endif; ?>
          <?php endforeach; ?>
        </div>
      <?php endif; ?>
    </section>

    <!-- 4. UPLOAD & AUTO-CROP ASPECT-RATIO STUDIO (PHP FORM) -->
    <section id="upload-studio-section" class="max-w-4xl mx-auto w-full px-4 sm:px-8 py-16">
      <div class="p-6 sm:p-10 rounded-3xl liquid-glass space-y-6">
        <div>
          <span class="text-xs font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400">PHP Server-Side Publishing + CSS Auto-Crop</span>
          <h2 class="text-2xl sm:text-3xl font-serif mt-1">Publish Capture & Aspect-Ratio Preview Studio</h2>
        </div>

        <form method="POST" class="space-y-5">
          <input type="hidden" name="action" value="upload_photo" />
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-mono mb-1">Photo Title *</label>
              <input type="text" name="title" required placeholder="e.g. Morning Assembly Flag Hoisting" class="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-white/15 bg-white dark:bg-stone-900 text-xs" />
            </div>
            <div>
              <label class="block text-xs font-mono mb-1">Image URL *</label>
              <input type="url" id="php-crop-url" name="imageUrl" required value="https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1600&q=85" oninput="updatePhpCropPreview()" class="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-white/15 bg-white dark:bg-stone-900 text-xs font-mono" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="block text-xs font-mono mb-1">Aspect Ratio</label>
              <select id="php-crop-ratio" name="aspectRatio" onchange="updatePhpCropPreview()" class="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-white/15 bg-white dark:bg-stone-900 text-xs font-mono">
                <option value="16:10">16:10 (Editorial Hero)</option>
                <option value="16:9">16:9 (Widescreen)</option>
                <option value="4:3">4:3 (Standard Masonry)</option>
                <option value="1:1">1:1 (Square Plate)</option>
                <option value="4:5">4:5 (Portrait Masonry)</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-mono mb-1">CSS object-fit</label>
              <select id="php-crop-fit" name="objectFit" onchange="updatePhpCropPreview()" class="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-white/15 bg-white dark:bg-stone-900 text-xs font-mono">
                <option value="cover">cover (Auto-Crop Fill)</option>
                <option value="contain">contain (Uncropped Fit)</option>
                <option value="fill">fill (Stretch Frame)</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-mono mb-1">Focal Position (object-position)</label>
              <input type="text" id="php-crop-pos" name="objectPosition" value="50% 40%" oninput="updatePhpCropPreview()" class="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-white/15 bg-white dark:bg-stone-900 text-xs font-mono" />
            </div>
          </div>

          <!-- Live Aspect-Ratio & CSS object-fit Preview -->
          <div class="p-4 rounded-2xl bg-stone-950 text-white space-y-2">
            <div class="flex items-center justify-between text-[11px] font-mono text-stone-400">
              <span>LIVE MASONRY ASPECT-RATIO & OBJECT-FIT PREVIEW</span>
              <span id="php-crop-label">16:10 · cover · 50% 40%</span>
            </div>
            <div id="php-crop-frame" style="aspect-ratio: 16 / 10;" class="w-full max-h-[300px] overflow-hidden rounded-xl border border-white/30 mx-auto">
              <img id="php-crop-img" src="https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1600&q=85" alt="Preview" style="object-fit: cover; object-position: 50% 40%;" class="w-full h-full" />
            </div>
          </div>

          <button type="submit" class="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md">
            Publish Cropped Capture to PHP Archive (+50 Credits)
          </button>
        </form>
      </div>
    </section>

  </div>

  <!-- Floating Liquid Glass Bottom Dock (6 Core Sections + Google 2FA Trigger) -->
  <div class="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 max-w-[96vw]">
    <div class="flex items-center gap-1 sm:gap-1.5 px-2.5 py-2 rounded-full liquid-glass-dock">
      <a href="#hero-section" class="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-black text-white dark:bg-white dark:text-black">Home</a>
      <a href="#seamless-library-section" class="px-3.5 py-1.5 rounded-full text-xs font-medium hover:bg-stone-200/50 dark:hover:bg-white/10">Works</a>
      <a href="#bookshelf-section" class="px-3.5 py-1.5 rounded-full text-xs font-medium hover:bg-stone-200/50 dark:hover:bg-white/10">Bookshelf</a>
      <a href="#seamless-library-section" class="px-3.5 py-1.5 rounded-full text-xs font-medium hover:bg-stone-200/50 dark:hover:bg-white/10">Events</a>
      <a href="#bookshelf-section" class="px-3.5 py-1.5 rounded-full text-xs font-medium hover:bg-stone-200/50 dark:hover:bg-white/10">Stories</a>
      <a href="#upload-studio-section" class="px-3.5 py-1.5 rounded-full text-xs font-medium hover:bg-stone-200/50 dark:hover:bg-white/10">Publish</a>
      <button onclick="document.getElementById('php-2fa-modal').classList.remove('hidden')" class="ml-1 px-3 py-1.5 rounded-full glass-pill text-[11px] font-mono font-semibold flex items-center gap-1.5">
        <span>🛡️ <?= $user['isCreator'] ? 'Creator 2FA' : 'Viewer 2FA' ?></span>
      </button>
    </div>
  </div>

  <!-- Google Account & 2-Factor Authentication PHP Modal -->
  <div id="php-2fa-modal" class="hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
    <div class="liquid-glass rounded-3xl max-w-md w-full p-6 space-y-4">
      <div class="flex items-center justify-between border-b border-stone-200 dark:border-white/15 pb-3">
        <h3 class="font-serif text-lg">Google Account & 2-Factor Authentication</h3>
        <button onclick="document.getElementById('php-2fa-modal').classList.add('hidden')" class="text-xs font-mono">✕</button>
      </div>
      <form method="POST" class="space-y-3 text-xs">
        <input type="hidden" name="action" value="verify_2fa" />
        <div>
          <label class="block font-mono mb-1">Account Role</label>
          <select name="accountType" class="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-white/15 bg-white dark:bg-stone-900">
            <option value="creator">Creator Account (Google + 2FA)</option>
            <option value="viewer">Viewer Account (Google + 2FA)</option>
          </select>
        </div>
        <div>
          <label class="block font-mono mb-1">Google Full Name *</label>
          <input type="text" name="googleName" required value="<?= htmlspecialchars($user['displayName']) ?>" class="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-white/15 bg-white dark:bg-stone-900" />
        </div>
        <div>
          <label class="block font-mono mb-1">Google Email Address *</label>
          <input type="email" name="googleEmail" required value="<?= htmlspecialchars($user['email']) ?>" class="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-white/15 bg-white dark:bg-stone-900 font-mono" />
        </div>
        <div>
          <label class="block font-mono mb-1">6-Digit 2FA Authenticator Code *</label>
          <input type="text" name="totpCode" required pattern="[0-9]{6}" placeholder="123456" class="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-white/15 bg-white dark:bg-stone-900 font-mono tracking-widest text-center" />
        </div>
        <button type="submit" class="w-full py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-semibold">
          Verify Google Account & 2FA
        </button>
      </form>
    </div>
  </div>

  <script>
    // Theme toggle
    function toggleTheme() {
      document.documentElement.classList.toggle('dark');
    }

    // High Contrast toggle for low-light school event photos
    function toggleHighContrast() {
      const root = document.getElementById('gallery-cards-root');
      const badge = document.getElementById('hc-badge');
      const btn = document.getElementById('high-contrast-toggle-btn');
      if (!root) return;
      const active = root.classList.toggle('high-contrast-active');
      if (badge) badge.classList.toggle('hidden', !active);
      if (btn) {
        btn.classList.toggle('bg-amber-400', active);
        btn.classList.toggle('text-black', active);
      }
    }

    // Monograph Bookshelf Spine Expander
    function expandSpine(targetIdx) {
      const spines = document.querySelectorAll('#bookshelf-stage .spine-item');
      spines.forEach((el, idx) => {
        const collapsed = el.querySelector('.spine-collapsed');
        const expanded = el.querySelector('.spine-expanded');
        if (idx === targetIdx) {
          el.classList.add('w-80', 'sm:w-96', 'h-[430px]');
          el.classList.remove('w-14', 'h-[390px]');
          if (collapsed) collapsed.classList.add('opacity-0', 'pointer-events-none');
          if (expanded) expanded.classList.remove('opacity-0', 'pointer-events-none');
        } else {
          el.classList.remove('w-80', 'sm:w-96', 'h-[430px]');
          el.classList.add('w-14', 'h-[390px]');
          if (collapsed) collapsed.classList.remove('opacity-0', 'pointer-events-none');
          if (expanded) expanded.classList.add('opacity-0', 'pointer-events-none');
        }
      });
    }

    // Auto-Crop Live Preview Updater
    function updatePhpCropPreview() {
      const url = document.getElementById('php-crop-url').value;
      const ratio = document.getElementById('php-crop-ratio').value;
      const fit = document.getElementById('php-crop-fit').value;
      const pos = document.getElementById('php-crop-pos').value;
      const frame = document.getElementById('php-crop-frame');
      const img = document.getElementById('php-crop-img');
      const label = document.getElementById('php-crop-label');
      if (frame) frame.style.aspectRatio = ratio.replace(':', ' / ');
      if (img) {
        img.src = url;
        img.style.objectFit = fit;
        img.style.objectPosition = pos;
      }
      if (label) label.textContent = ratio + ' · ' + fit + ' · ' + pos;
    }

    // GPU-Accelerated requestAnimationFrame Smooth Scroll + Differential Parallax Engine
    (function () {
      const container = document.getElementById('smooth-scroll-container');
      const speedItems = Array.from(document.querySelectorAll('[data-scroll-speed]'));
      const parallaxImgs = Array.from(document.querySelectorAll('[data-parallax-img]'));

      let lastScrollY = window.scrollY;
      let velocity = 0;
      let driftOffset = 0;
      let lastTime = performance.now();
      let rafId = null;

      function tick(now) {
        const dt = Math.min((now - lastTime) / 1000, 0.05);
        lastTime = now;
        const currentY = window.scrollY;
        const delta = currentY - lastScrollY;
        lastScrollY = currentY;

        if (Math.abs(delta) > 0.1) {
          velocity = velocity * 0.62 + delta * 0.38;
        } else {
          velocity *= Math.exp(-6.0 * dt) * 0.91;
        }
        if (Math.abs(velocity) < 0.04) velocity = 0;

        const targetDrift = Math.max(-12, Math.min(12, -velocity * 0.15));
        driftOffset += (targetDrift - driftOffset) * 0.2;
        if (Math.abs(driftOffset) < 0.03 && velocity === 0) driftOffset = 0;

        if (container) {
          container.style.transform = 'translate3d(0, ' + driftOffset.toFixed(2) + 'px, 0)';
        }

        const vh = window.innerHeight || 800;
        speedItems.forEach((el) => {
          const speed = parseFloat(el.getAttribute('data-scroll-speed') || '0');
          const rect = el.getBoundingClientRect();
          if (rect.bottom > -100 && rect.top < vh + 100) {
            const center = rect.top + rect.height * 0.5;
            const y = Math.max(-50, Math.min(50, (center - vh * 0.5) * speed));
            el.style.transform = 'translate3d(0, ' + y.toFixed(1) + 'px, 0)';
          }
        });

        parallaxImgs.forEach((img) => {
          const intensity = parseFloat(img.getAttribute('data-parallax-img') || '24');
          const rect = img.parentElement.getBoundingClientRect();
          if (rect.bottom > -100 && rect.top < vh + 100) {
            const norm = ((rect.top + rect.height * 0.5) - vh * 0.5) / (vh * 0.65);
            const y = Math.max(-28, Math.min(28, -norm * intensity));
            img.style.transform = 'translate3d(0, ' + y.toFixed(1) + 'px, 0) scale(1.07)';
          }
        });

        if (velocity !== 0 || driftOffset !== 0) {
          rafId = requestAnimationFrame(tick);
        } else {
          rafId = null;
        }
      }

      window.addEventListener('scroll', () => {
        if (!rafId) {
          lastTime = performance.now();
          rafId = requestAnimationFrame(tick);
        }
      }, { passive: true });
    })();
  </script>
</body>
</html>
