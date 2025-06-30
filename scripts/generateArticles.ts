import { storage } from '../server/storage';
import { db } from '../server/db';
import { users, categories } from '../shared/schema';
import { eq } from 'drizzle-orm';

async function main() {
  // Ambil semua kategori
  const allCategories = await storage.getCategories();
  // Ambil user pertama sebagai author
  const [author] = await db.select().from(users).limit(1);
  if (!author) throw new Error('No user found. Buat minimal 1 user dulu.');

  for (const category of allCategories) {
    for (let i = 1; i <= 10; i++) {
      const title = `${category.name} Artikel ${i}`;
      const slug = `${category.slug}-artikel-${i}`;
      const excerpt = `Ini adalah ringkasan artikel ${i} untuk kategori ${category.name}.`;
      const content = `Konten lengkap artikel ${i} pada kategori ${category.name}.`;
      await storage.createArticle({
        title,
        slug,
        excerpt,
        content,
        coverImage: null,
        authorId: author.id,
        categoryId: category.id,
        isPublished: true,
        publishedAt: new Date(),
      });
      console.log(`Artikel '${title}' untuk kategori '${category.name}' berhasil dibuat.`);
    }
  }
  console.log('Selesai membuat artikel.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
