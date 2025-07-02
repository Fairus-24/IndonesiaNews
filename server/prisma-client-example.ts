// Contoh penggunaan Prisma Client untuk query data di MySQL
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Ambil semua user
  const users = await prisma.user.findMany();
  console.log('Semua user:', users);

  // Ambil artikel beserta author dan kategori
  const articles = await prisma.article.findMany({
    include: {
      author: true,
      category: true,
      comments: true,
      likes: true,
      bookmarks: true,
    },
  });
  console.log('Semua artikel:', articles);

  // Tambah user baru
  // const newUser = await prisma.user.create({
  //   data: {
  //     username: 'newuser',
  //     email: 'newuser@example.com',
  //     password: 'hashpassword',
  //     fullName: 'New User',
  //   },
  // });
  // console.log('User baru:', newUser);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
