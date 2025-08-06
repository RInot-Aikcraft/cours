-- CreateTable
CREATE TABLE "public"."Niveau" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Niveau_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Niveau_sessionId_nom_key" ON "public"."Niveau"("sessionId", "nom");

-- AddForeignKey
ALTER TABLE "public"."Niveau" ADD CONSTRAINT "Niveau_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;
