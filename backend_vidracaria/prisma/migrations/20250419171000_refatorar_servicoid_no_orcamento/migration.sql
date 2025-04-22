/*
  Warnings:

  - You are about to drop the column `servico` on the `Orcamento` table. All the data in the column will be lost.
  - Added the required column `servicoId` to the `Orcamento` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Orcamento" DROP COLUMN "servico",
ADD COLUMN     "imagemUrl" TEXT,
ADD COLUMN     "servicoId" INTEGER NOT NULL,
ALTER COLUMN "status" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'pendente';

-- AddForeignKey
ALTER TABLE "Orcamento" ADD CONSTRAINT "Orcamento_servicoId_fkey" FOREIGN KEY ("servicoId") REFERENCES "Servico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
