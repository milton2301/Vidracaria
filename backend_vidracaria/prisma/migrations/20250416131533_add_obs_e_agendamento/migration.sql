-- AlterTable
ALTER TABLE "Orcamento" ADD COLUMN     "altura" DOUBLE PRECISION,
ADD COLUMN     "dataAgendamento" TIMESTAMP(3),
ADD COLUMN     "largura" DOUBLE PRECISION,
ADD COLUMN     "observacaoAdmin" TEXT,
ADD COLUMN     "tipoVidro" TEXT;
