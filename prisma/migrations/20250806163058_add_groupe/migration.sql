-- CreateEnum
CREATE TYPE "public"."Type" AS ENUM ('LOCAL', 'EN_LIGNE', 'HYBRIDE');

-- CreateTable
CREATE TABLE "public"."Groupe" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "effectif" INTEGER NOT NULL,
    "type" "public"."Type" NOT NULL DEFAULT 'LOCAL',
    "niveauId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Groupe_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Groupe_niveauId_nom_key" ON "public"."Groupe"("niveauId", "nom");

-- AddForeignKey
ALTER TABLE "public"."Groupe" ADD CONSTRAINT "Groupe_niveauId_fkey" FOREIGN KEY ("niveauId") REFERENCES "public"."Niveau"("id") ON DELETE CASCADE ON UPDATE CASCADE;
