/*
  Warnings:

  - You are about to drop the column `tracking_status` on the `Order` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[result_id]` on the table `OrderItem` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "tracking_status",
ADD COLUMN     "order_status" TEXT[] DEFAULT ARRAY['paid']::TEXT[];

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "tracking_status" TEXT[] DEFAULT ARRAY['order_received']::TEXT[],
ALTER COLUMN "result_id" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "OrderItem_result_id_key" ON "OrderItem"("result_id");

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_result_id_fkey" FOREIGN KEY ("result_id") REFERENCES "FateResult"("result_id") ON DELETE SET NULL ON UPDATE CASCADE;
