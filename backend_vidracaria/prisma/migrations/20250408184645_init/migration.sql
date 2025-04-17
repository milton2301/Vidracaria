-- CreateTable
CREATE TABLE "Orcamento" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "servico" TEXT NOT NULL,
    "descricao" TEXT,
    "imagemUrl" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Orcamento_pkey" PRIMARY KEY ("id")
);
