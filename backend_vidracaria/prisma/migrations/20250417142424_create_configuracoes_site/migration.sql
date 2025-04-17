-- CreateTable
CREATE TABLE "ConfiguracaoSite" (
    "id" SERIAL NOT NULL,
    "chave" TEXT NOT NULL,
    "titulo" TEXT,
    "subtitulo" TEXT,
    "texto" TEXT,
    "atualizado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConfiguracaoSite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ConfiguracaoSite_chave_key" ON "ConfiguracaoSite"("chave");
