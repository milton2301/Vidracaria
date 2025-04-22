-- CreateTable
CREATE TABLE "Proposta" (
    "id" SERIAL NOT NULL,
    "orcamentoId" INTEGER NOT NULL,
    "tipoVidro" TEXT,
    "altura" DOUBLE PRECISION,
    "largura" DOUBLE PRECISION,
    "descricao" TEXT,
    "observacaoAdmin" TEXT,
    "valor" DOUBLE PRECISION,
    "dataCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Proposta_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Proposta" ADD CONSTRAINT "Proposta_orcamentoId_fkey" FOREIGN KEY ("orcamentoId") REFERENCES "Orcamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
