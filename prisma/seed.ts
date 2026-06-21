import { PrismaClient, UserRole, CopyStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database Perpustakaan ITK...');

  // ====================== ADMIN ======================
  const adminPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@perpus.itk.ac.id' },
    update: {},
    create: {
      email: 'admin@perpus.itk.ac.id',
      password: adminPassword,
      role: UserRole.ADMIN,
      admin: {
        create: {
          name: 'Admin Perpustakaan ITK',
          phone: '08123456789',
        },
      },
    },
  });
  console.log('✅ Admin dibuat:', adminUser.email);

  // ====================== MAHASISWA ======================
  const mhsPassword = await bcrypt.hash('mahasiswa123', 10);
  const mhs1 = await prisma.user.upsert({
    where: { email: '04231001@student.itk.ac.id' },
    update: {},
    create: {
      email: '04231001@student.itk.ac.id',
      password: mhsPassword,
      role: UserRole.MAHASISWA,
      student: {
        create: {
          nim: '04231001',
          name: 'Ahmad Fauzi',
          phone: '08111111111',
          faculty: 'Fakultas Teknologi Industri',
          major: 'Teknik Informatika',
          year: 2023,
        },
      },
    },
  });

  const mhs2 = await prisma.user.upsert({
    where: { email: '04231047@student.itk.ac.id' },
    update: {},
    create: {
      email: '04231047@student.itk.ac.id',
      password: mhsPassword,
      role: UserRole.MAHASISWA,
      student: {
        create: {
          nim: '04231047',
          name: 'Siti Rahayu',
          phone: '08222222222',
          faculty: 'Fakultas Teknologi Industri',
          major: 'Teknik Informatika',
          year: 2023,
        },
      },
    },
  });
  console.log('✅ Mahasiswa dibuat:', mhs1.email, mhs2.email);

  // ====================== KATEGORI ======================
  const categories = [
    { name: 'Teknologi Informasi', description: 'Buku seputar IT, programming, dan komputer', color: '#3b82f6' },
    { name: 'Teknik Sipil', description: 'Buku teknik sipil dan konstruksi', color: '#ef4444' },
    { name: 'Teknik Mesin', description: 'Buku mekanika dan teknik mesin', color: '#f59e0b' },
    { name: 'Teknik Elektro', description: 'Buku kelistrikan dan elektronika', color: '#8b5cf6' },
    { name: 'Matematika', description: 'Buku matematika dan statistika', color: '#10b981' },
    { name: 'Fisika', description: 'Buku fisika terapan dan murni', color: '#06b6d4' },
    { name: 'Kimia', description: 'Buku kimia dan material', color: '#f97316' },
    { name: 'Manajemen', description: 'Buku manajemen dan bisnis', color: '#84cc16' },
    { name: 'Bahasa & Sastra', description: 'Buku bahasa Indonesia dan Inggris', color: '#ec4899' },
    { name: 'Umum', description: 'Koleksi umum perpustakaan', color: '#6b7280' },
  ];

  const createdCategories: Record<string, string> = {};
  for (const cat of categories) {
    const created = await prisma.bookCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
    createdCategories[cat.name] = created.id;
  }
  console.log('✅ Kategori dibuat:', categories.length, 'kategori');

  // ====================== BUKU ======================
  const books = [
    {
      isbn: '9780132350884',
      title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
      author: 'Robert C. Martin',
      publisher: 'Prentice Hall',
      year: 2008,
      categoryId: createdCategories['Teknologi Informasi'],
      description: 'Buku fundamental tentang cara menulis kode yang bersih, terbaca, dan mudah dikelola.',
      pages: 431,
      language: 'Inggris',
      location: 'Rak A-01',
      totalCopies: 3,
    },
    {
      isbn: '9781491950357',
      title: 'Learning Python, 5th Edition',
      author: 'Mark Lutz',
      publisher: "O'Reilly Media",
      year: 2013,
      categoryId: createdCategories['Teknologi Informasi'],
      description: 'Panduan lengkap belajar bahasa pemrograman Python dari dasar hingga mahir.',
      pages: 1594,
      language: 'Inggris',
      location: 'Rak A-02',
      totalCopies: 4,
    },
    {
      isbn: '9780201633610',
      title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
      author: 'Gang of Four',
      publisher: 'Addison-Wesley',
      year: 1994,
      categoryId: createdCategories['Teknologi Informasi'],
      description: 'Buku klasik tentang 23 design pattern dalam pengembangan perangkat lunak.',
      pages: 395,
      language: 'Inggris',
      location: 'Rak A-03',
      totalCopies: 2,
    },
    {
      isbn: '9780134685991',
      title: 'Effective Java, 3rd Edition',
      author: 'Joshua Bloch',
      publisher: 'Addison-Wesley',
      year: 2018,
      categoryId: createdCategories['Teknologi Informasi'],
      description: 'Panduan best practice pemrograman Java oleh engineer senior Google.',
      pages: 412,
      language: 'Inggris',
      location: 'Rak A-04',
      totalCopies: 2,
    },
    {
      isbn: '9781492056355',
      title: 'JavaScript: The Definitive Guide, 7th Edition',
      author: 'David Flanagan',
      publisher: "O'Reilly Media",
      year: 2020,
      categoryId: createdCategories['Teknologi Informasi'],
      description: 'Referensi komprehensif JavaScript untuk developer web modern.',
      pages: 706,
      language: 'Inggris',
      location: 'Rak A-05',
      totalCopies: 3,
    },
    {
      isbn: '9780071772419',
      title: 'Mekanika Teknik untuk Insinyur',
      author: 'Beer & Johnston',
      publisher: 'McGraw-Hill',
      year: 2012,
      categoryId: createdCategories['Teknik Mesin'],
      description: 'Buku mekanika teknik dasar untuk mahasiswa teknik.',
      pages: 880,
      language: 'Indonesia',
      location: 'Rak B-01',
      totalCopies: 5,
    },
    {
      isbn: '9786020251240',
      title: 'Kalkulus Edisi 9',
      author: 'Ron Larson & Bruce Edwards',
      publisher: 'Erlangga',
      year: 2016,
      categoryId: createdCategories['Matematika'],
      description: 'Buku kalkulus lengkap untuk mahasiswa sains dan teknik.',
      pages: 1026,
      language: 'Indonesia',
      location: 'Rak C-01',
      totalCopies: 6,
    },
    {
      isbn: '9786020281759',
      title: 'Fisika Dasar untuk Sains dan Teknik',
      author: 'Serway & Jewett',
      publisher: 'Salemba Teknika',
      year: 2014,
      categoryId: createdCategories['Fisika'],
      description: 'Buku fisika dasar komprehensif dengan pendekatan konseptual dan matematis.',
      pages: 784,
      language: 'Indonesia',
      location: 'Rak D-01',
      totalCopies: 4,
    },
    {
      isbn: '9786020314914',
      title: 'Teknik Pondasi',
      author: 'Braja M. Das',
      publisher: 'Erlangga',
      year: 2018,
      categoryId: createdCategories['Teknik Sipil'],
      description: 'Panduan lengkap perancangan pondasi untuk mahasiswa teknik sipil.',
      pages: 672,
      language: 'Indonesia',
      location: 'Rak E-01',
      totalCopies: 3,
    },
    {
      isbn: '9780073380568',
      title: 'Database System Concepts, 6th Edition',
      author: 'Abraham Silberschatz',
      publisher: 'McGraw-Hill',
      year: 2010,
      categoryId: createdCategories['Teknologi Informasi'],
      description: 'Buku referensi sistem basis data yang digunakan di universitas terkemuka dunia.',
      pages: 1376,
      language: 'Inggris',
      location: 'Rak A-06',
      totalCopies: 3,
    },
    {
      isbn: '9780136042594',
      title: 'Algoritma dan Pemrograman',
      author: 'Thomas H. Cormen',
      publisher: 'MIT Press',
      year: 2009,
      categoryId: createdCategories['Teknologi Informasi'],
      description: 'Buku algoritma klasik (CLRS) - referensi utama ilmu komputer.',
      pages: 1292,
      language: 'Inggris',
      location: 'Rak A-07',
      totalCopies: 2,
    },
    {
      isbn: '9786020224459',
      title: 'Manajemen Proyek Konstruksi',
      author: 'Wulfram I. Ervianto',
      publisher: 'ANDI',
      year: 2019,
      categoryId: createdCategories['Teknik Sipil'],
      description: 'Panduan manajemen proyek khusus untuk proyek konstruksi di Indonesia.',
      pages: 320,
      language: 'Indonesia',
      location: 'Rak E-02',
      totalCopies: 2,
    },
  ];

  for (const bookData of books) {
    const { totalCopies, ...bookInfo } = bookData;
    const book = await prisma.book.upsert({
      where: { isbn: bookInfo.isbn! },
      update: {},
      create: {
        ...bookInfo,
        totalCopies,
        copies: {
          create: Array.from({ length: totalCopies }, (_, i) => ({
            copyNumber: `${(i + 1).toString().padStart(3, '0')}`,
            status: CopyStatus.AVAILABLE,
            condition: 'Baik',
          })),
        },
      },
    });
    console.log(`📚 Buku: "${book.title}" (${totalCopies} eksemplar)`);
  }

  console.log('\n🎉 Seeding selesai!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Login Admin:');
  console.log('  Email   : admin@perpus.itk.ac.id');
  console.log('  Password: admin123');
  console.log('');
  console.log('Login Mahasiswa:');
  console.log('  Email   : 04231047@student.itk.ac.id');
  console.log('  Password: mahasiswa123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
