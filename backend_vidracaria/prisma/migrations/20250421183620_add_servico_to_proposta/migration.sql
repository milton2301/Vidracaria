/*
  Warnings:

  - Added the required column `servicoId` to the `Proposta` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Proposta" ADD COLUMN     "servicoId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Proposta" ADD CONSTRAINT "Proposta_servicoId_fkey" FOREIGN KEY ("servicoId") REFERENCES "Servico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
