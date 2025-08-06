-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ADMIN', 'ENSEIGNANT', 'ELEVE', 'ADMINISTRATION');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "role" "public"."Role" NOT NULL DEFAULT 'ELEVE';
