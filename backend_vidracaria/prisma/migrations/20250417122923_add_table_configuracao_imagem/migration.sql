-- CreateTable
CREATE TABLE "ConfiguracaoImagem" (
    "id" SERIAL NOT NULL,
    "tipo" TEXT NOT NULL,
    "urlImagem" TEXT NOT NULL,
    "descricao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConfiguracaoImagem_pkey" PRIMARY KEY ("id")
);
