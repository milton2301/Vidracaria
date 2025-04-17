/*
  Warnings:

  - You are about to drop the column `imagemUrl` on the `Orcamento` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Orcamento" DROP COLUMN "imagemUrl",
ADD COLUMN     "valor" DOUBLE PRECISION;
