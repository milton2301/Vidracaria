/*
  Warnings:

  - You are about to drop the `ConfiguracaoImagem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "ConfiguracaoImagem";

-- CreateTable
CREATE TABLE "Imagem" (
    "id" SERIAL NOT NULL,
    "tipo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "caminho" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Imagem_pkey" PRIMARY KEY ("id")
);
