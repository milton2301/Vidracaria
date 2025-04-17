-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "ativo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "bloqueado" BOOLEAN NOT NULL DEFAULT false;
