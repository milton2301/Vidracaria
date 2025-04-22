/*
  Warnings:

  - You are about to drop the column `tipoVidro` on the `Orcamento` table. All the data in the column will be lost.
  - You are about to drop the column `tipoVidro` on the `Proposta` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Orcamento" DROP COLUMN "tipoVidro",
ADD COLUMN     "tipoVidroId" INTEGER;

-- AlterTable
ALTER TABLE "Proposta" DROP COLUMN "tipoVidro",
ADD COLUMN     "tipoVidroId" INTEGER;

-- CreateTable
CREATE TABLE "TipoVidro" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "valorM2" DOUBLE PRECISION NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TipoVidro_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Orcamento" ADD CONSTRAINT "Orcamento_tipoVidroId_fkey" FOREIGN KEY ("tipoVidroId") REFERENCES "TipoVidro"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposta" ADD CONSTRAINT "Proposta_tipoVidroId_fkey" FOREIGN KEY ("tipoVidroId") REFERENCES "TipoVidro"("id") ON DELETE SET NULL ON UPDATE CASCADE;
