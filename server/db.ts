import { PrismaClient } from '@prisma/client';

// Inisialisasi Prisma Client
export const prisma = new PrismaClient();

// Gunakan prisma di seluruh backend untuk query ke MySQL