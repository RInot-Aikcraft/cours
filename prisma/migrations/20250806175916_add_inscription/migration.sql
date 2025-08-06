-- CreateEnum
CREATE TYPE "public"."EtatFrais" AS ENUM ('PAYE', 'NON_PAYE', 'PARTIEL');

-- CreateTable
CREATE TABLE "public"."Inscription" (
    "id" SERIAL NOT NULL,
    "groupeId" INTEGER NOT NULL,
    "eleveId" INTEGER NOT NULL,
    "matricule" TEXT NOT NULL,
    "etatFrais" "public"."EtatFrais" NOT NULL DEFAULT 'NON_PAYE',
    "dateInscription" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Inscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Inscription_matricule_key" ON "public"."Inscription"("matricule");

-- CreateIndex
CREATE UNIQUE INDEX "Inscription_groupeId_eleveId_key" ON "public"."Inscription"("groupeId", "eleveId");

-- AddForeignKey
ALTER TABLE "public"."Inscription" ADD CONSTRAINT "Inscription_groupeId_fkey" FOREIGN KEY ("groupeId") REFERENCES "public"."Groupe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Inscription" ADD CONSTRAINT "Inscription_eleveId_fkey" FOREIGN KEY ("eleveId") REFERENCES "public"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
