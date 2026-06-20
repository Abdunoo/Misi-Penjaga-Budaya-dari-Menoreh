// Konten kuis refleksi pasca-cerita. Sepuluh soal pilihan ganda satu jawaban
// (Indonesia); `answer` adalah indeks 0-based dari opsi yang benar. Berbeda dari
// halaman cerita (PNG), kuis dirender sebagai teks CSS — lihat views/QuizView.vue.

export interface QuizQuestion {
  /** Pertanyaan yang ditampilkan ke anak. */
  question: string
  /** Tepat empat opsi, dirender a/b/c/d sesuai urutan. */
  options: [string, string, string, string]
  /** Indeks 0-based dari `options` yang merupakan jawaban benar. */
  answer: number
}

export const QUIZ: QuizQuestion[] = [
  {
    question: 'Siapa nama elang yang menjadi sahabat Dimas, Rara, dan Bagas?',
    options: ['Jaka', 'Joyo', 'Jaya', 'Joko'],
    answer: 2,
  },
  {
    question:
      'Dalam cerita, warga Jepang mempertunjukkan Barongan dan Wayang Kulit dengan sangat mahir. Menurutmu, apa pesan yang ingin disampaikan dari kejadian ini?',
    options: [
      'Jepang pantas memiliki budaya Barongan dan Wayang karena mereka lebih mahir',
      'Budaya Indonesia sebaiknya hanya dipelajari oleh orang Indonesia saja',
      'Budaya Indonesia lebih terkenal di Jepang daripada di Indonesia',
      'Orang asing bisa mempelajari budaya kita, tapi generasi mudanya sendiri justru melupakan',
    ],
    answer: 3,
  },
  {
    question: 'Di mana Dimas, Rara, dan Bagas pertama kali bertemu Jaya?',
    options: [
      'Di pendopo desa',
      'Di panggung festival',
      'Di mata air kaki bukit',
      'Di sawah terasering',
    ],
    answer: 2,
  },
  {
    question:
      'Pak Wiryo berkata, "Ancaman terbesar bukan klaim dari luar, tetapi ketika generasi mudanya sendiri tidak mengenal budayanya." Apa maksud dari pernyataan ini?',
    options: [
      'Budaya akan tetap lestari meskipun generasi muda tidak mengenalnya',
      'Hanya pemerintah yang bertanggung jawab melestarikan budaya',
      'Klaim dari luar tidak berbahaya sama sekali',
      'Budaya bisa hilang dengan sendirinya tanpa ada yang mengklaim, jika generasi muda tidak peduli',
    ],
    answer: 3,
  },
  {
    question: 'Makanan khas Menoreh apa yang dibeli Dimas, Rara, dan Bagas sambil menonton wayang?',
    options: [
      'Gudeg dan Bakpia',
      'Nasi Pecel dan Tempe',
      'Sate dan Gado-gado',
      'Geblek dan Thiwul',
    ],
    answer: 3,
  },
  {
    question:
      'Dimas, Rara, dan Bagas melakukan hal yang berbeda-beda untuk melestarikan budaya: Rara belajar menari, Dimas belajar gamelan, Bagas membuat video. Menurutmu, mengapa mereka melakukan hal yang berbeda?',
    options: [
      'Agar mereka bisa tampil di festival sendirian',
      'Karena Pak Wiryo memaksa mereka melakukan hal yang berbeda',
      'Karena mereka tidak suka melakukan hal yang sama',
      'Agar setiap anak bisa melestarikan budaya sesuai dengan minat dan kemampuannya masing-masing',
    ],
    answer: 3,
  },
  {
    question: 'Apa nama tradisi gotong royong membangun rumah di Menoreh?',
    options: ['Rayahan', 'Wiwitan', 'Sambatan', 'Sedekah Bumi'],
    answer: 2,
  },
  {
    question:
      'Jika suatu hari tidak ada lagi anak-anak di desamu yang mau belajar menari jathilan atau memainkan gamelan, apa yang akan terjadi pada budaya tersebut?',
    options: [
      'Budaya itu lambat laun akan hilang dan dilupakan oleh generasi berikutnya',
      'Budaya itu akan tetap ada karena sudah dicatat di buku',
      'Tidak masalah karena ada budaya baru yang lebih seru',
      'Orang asing akan tetap melestarikannya untuk kita',
    ],
    answer: 0,
  },
  {
    question: 'Apa nama festival budaya yang digelar di kawasan wisata Tumpeng Menoreh?',
    options: [
      'Festival Menoreh Berseri',
      'Festival Menoreh',
      'Festival Warisan Budaya',
      'Festival Budaya Nusantara',
    ],
    answer: 1,
  },
  {
    question:
      'Dari seluruh perjalanan Dimas, Rara, dan Bagas, nilai apa yang paling penting menurutmu untuk menjadi seorang "Penjaga Warisan Budaya"?',
    options: [
      'Mengenal, mencintai, dan melestarikan budaya dengan tindakan nyata',
      'Hanya bisa menari dengan bagus',
      'Menunggu orang lain yang melestarikan',
      'Memiliki banyak uang untuk membeli alat budaya',
    ],
    answer: 0,
  },
]

export const QUIZ_COUNT = QUIZ.length
