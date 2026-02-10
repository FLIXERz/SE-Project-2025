-- CreateTable
CREATE TABLE "User" (
    "user_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "Address" TEXT,
    "telephone" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Order" (
    "order_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "total_price" DOUBLE PRECISION NOT NULL,
    "tracking_status" TEXT NOT NULL,
    "payment_bill" TEXT,
    "createOrder" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("order_id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "orderItem_id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "result_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("orderItem_id")
);

-- CreateTable
CREATE TABLE "Product" (
    "product_id" SERIAL NOT NULL,
    "product_name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "main_stat" TEXT,
    "description" TEXT,
    "stock_quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "Witch" (
    "witch_id" SERIAL NOT NULL,
    "sanctuary_stat" INTEGER NOT NULL,
    "purity_stat" INTEGER NOT NULL,
    "telluric_stat" INTEGER NOT NULL,
    "ethereality_stat" INTEGER NOT NULL,
    "omniscience_stat" INTEGER NOT NULL,
    "healing_stat" INTEGER NOT NULL,
    "wealth_stat" INTEGER NOT NULL,
    "abundance_stat" INTEGER NOT NULL,
    "intelligence_stat" INTEGER NOT NULL,
    "creativity_stat" INTEGER NOT NULL,
    "affection_stat" INTEGER NOT NULL,
    "passion_stat" INTEGER NOT NULL,

    CONSTRAINT "Witch_pkey" PRIMARY KEY ("witch_id")
);

-- CreateTable
CREATE TABLE "Fate" (
    "stat_id" SERIAL NOT NULL,
    "stat_name" TEXT NOT NULL,
    "stone" TEXT NOT NULL,
    "result_des1" TEXT NOT NULL,
    "result_des2" TEXT NOT NULL,
    "result_des3" TEXT NOT NULL,

    CONSTRAINT "Fate_pkey" PRIMARY KEY ("stat_id")
);

-- CreateTable
CREATE TABLE "FateResult" (
    "result_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "witch_id" INTEGER NOT NULL,
    "drawn_stat" TEXT NOT NULL,
    "stat_result" TEXT NOT NULL,
    "soecial_event" BOOLEAN NOT NULL DEFAULT false,
    "result" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FateResult_pkey" PRIMARY KEY ("result_id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "admin_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("admin_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Fate_stat_name_key" ON "Fate"("stat_name");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_user_id_key" ON "Admin"("user_id");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("order_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FateResult" ADD CONSTRAINT "FateResult_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FateResult" ADD CONSTRAINT "FateResult_witch_id_fkey" FOREIGN KEY ("witch_id") REFERENCES "Witch"("witch_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FateResult" ADD CONSTRAINT "FateResult_stat_result_fkey" FOREIGN KEY ("stat_result") REFERENCES "Fate"("stat_name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
