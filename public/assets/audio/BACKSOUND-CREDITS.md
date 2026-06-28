# Backsound — sumber & lisensi

Semua file `bs-*.mp3` (musik latar) dan `sfx-*.mp3` (efek suara) di folder ini diunduh
dari **Pixabay** dan berada di bawah **Pixabay Content License**:

- Gratis untuk penggunaan komersial & non-komersial — **tanpa wajib atribusi**.
- Boleh disematkan ke dalam APK sebagai musik latar.
- **Larangan:** jangan menjual/menyebarkan ulang file audio mentahnya sebagai produk
  berdiri sendiri (di dalam APK sebagai latar = boleh).
- Atribusi opsional (kalau mau): `Music by Pixabay`.

Diunduh: 2026-06-28.

## Musik latar (`bs-*.mp3`) → halaman

| File | Judul (Pixabay) | Dipakai di halaman (app page) | Sumber |
|---|---|---|---|
| bs-cover.mp3 | Nusantara – Epic traditional music | Halaman sampul / menu (HomeView) | https://pixabay.com/music/main-title-nusantara-epic-traditional-music-338865/ |
| bs-intro-kids.mp3 | Happy Upbeat Piano Kids Background | 1 (Tokoh) | https://pixabay.com/music/happy-childrens-tunes-happy-upbeat-piano-kids-background-full-393296/ |
| bs-morning.mp3 | Gentle – Peaceful Gentle Music | 2, 10, 12, 24 | https://pixabay.com/music/modern-classical-gentle-peaceful-gentle-music-499513/ |
| bs-curious.mp3 | A Curious Discovery | 3 | https://pixabay.com/music/modern-classical-a-curious-discovery-243799/ |
| bs-reflective.mp3 | Reflective Piano | 4, 5, 19 | https://pixabay.com/music/solo-piano-reflective-piano-512251/ |
| bs-hopeful.mp3 | Inspiring Emotional Uplifting Piano | 6, 9 | https://pixabay.com/music/modern-classical-inspiring-emotional-uplifting-piano-112623/ |
| bs-gamelan-ambient.mp3 | Beautiful Ambient Gamelan Music | 7, 8, 11 | https://pixabay.com/music/world-beautiful-ambient-gamelan-music-free-for-content-creators-434887/ |
| bs-gotongroyong.mp3 | "Javanese Vibes" Gamelan Music | 13, 14 | https://pixabay.com/music/beats-free-quotjavanese-vibesquot-gamelan-music-music-for-creator-383176/ |
| bs-suling.mp3 | Suling Bali – Balinese Flute Relaxation | 15 (+opsi alam) | https://pixabay.com/music/world-suling-bali-balinese-flute-relaxation-412778/ |
| bs-sacred-gamelan.mp3 | Peaceful Gamelan – Traditional Indonesia | 16 (wiwitan) | https://pixabay.com/music/world-peaceful-gamelan-traditional-indonesia-epic-background-music-307717/ |
| bs-festival-jathilan.mp3 | Jedag-Jedug Gamelan | 17 (merti desa) | https://pixabay.com/music/upbeat-jedag-jedug-gamelan-free-for-use-328514/ |
| bs-mystical.mp3 | Gamelan Horror/Spiritual | 18 (wayang malam) | https://pixabay.com/music/folk-free-gamelan-horror-music-spiritual-and-energetic-background-music-339847/ |
| bs-somber.mp3 | Sad Piano | 20 | https://pixabay.com/music/solo-piano-sad-piano-501483/ |
| bs-inspiring.mp3 | Inspiring Cinematic Music | 21, 23 | https://pixabay.com/music/main-title-inspiring-cinematic-music-409347/ |
| bs-festival-grand.mp3 | Epic Nusantara – Free Gamelan | 22 (festival) | https://pixabay.com/music/world-epic-nusantara-free-gamelan-music-from-indonesian-328513/ |

## Efek suara (`sfx-*.mp3`) — lapisan opsional

| File | Judul (Pixabay) | Saran halaman | Sumber |
|---|---|---|---|
| sfx-forest-birds.mp3 | Forest, birds | 2, 10 (pagi/hutan) | https://pixabay.com/sound-effects/nature-forestbirds-319791/ |
| sfx-spring-water.mp3 | Water stream | 8 (mata air) | https://pixabay.com/sound-effects/nature-water-stream-512531/ |
| sfx-eagle.mp3 | Hawk Call / Hawk Cry | 8 (elang Jaya) | https://pixabay.com/sound-effects/nature-hawk-call-sound-effect-hawk-cry-364472/ |
| sfx-crowd.mp3 | Generic Crowd Background Noise | 13, 17 (keramaian) | https://pixabay.com/sound-effects/people-generic-crowd-background-noise-31310/ |
| sfx-applause.mp3 | Applause, cheer | 22, 23 (festival/ikrar) | https://pixabay.com/sound-effects/people-applause-cheer-236786/ |

> Catatan: `bs-suling.mp3` cukup panjang (±7:45). Bila ingin memperkecil ukuran APK,
> potong jadi ±60–90 dtk lalu loop, mis.:
> `ffmpeg -i bs-suling.mp3 -t 90 -c copy bs-suling-short.mp3`
