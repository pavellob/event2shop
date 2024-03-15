import {MigrationInterface, QueryRunner} from "typeorm";

export class isEvent1710497356628 implements MigrationInterface {

   public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP INDEX "IDX_6e420052844edf3a5506d863ce"`, undefined);
        await queryRunner.query(`DROP INDEX "IDX_e38dca0d82fd64c7cf8aac8b8e"`, undefined);
        await queryRunner.query(`DROP INDEX "IDX_0e6f516053cf982b537836e21c"`, undefined);
        await queryRunner.query(`CREATE TABLE "temporary_product_variant" ("createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "deletedAt" datetime, "enabled" boolean NOT NULL DEFAULT (1), "sku" varchar NOT NULL, "outOfStockThreshold" integer NOT NULL DEFAULT (0), "useGlobalOutOfStockThreshold" boolean NOT NULL DEFAULT (1), "trackInventory" varchar NOT NULL DEFAULT ('INHERIT'), "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "productId" integer, "featuredAssetId" integer, "taxCategoryId" integer, "customFieldsIsevent" boolean DEFAULT (0), CONSTRAINT "FK_6e420052844edf3a5506d863ce6" FOREIGN KEY ("productId") REFERENCES "product" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_e38dca0d82fd64c7cf8aac8b8ef" FOREIGN KEY ("taxCategoryId") REFERENCES "tax_category" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_0e6f516053cf982b537836e21cf" FOREIGN KEY ("featuredAssetId") REFERENCES "asset" ("id") ON DELETE SET NULL ON UPDATE NO ACTION)`, undefined);
        await queryRunner.query(`INSERT INTO "temporary_product_variant"("createdAt", "updatedAt", "deletedAt", "enabled", "sku", "outOfStockThreshold", "useGlobalOutOfStockThreshold", "trackInventory", "id", "productId", "featuredAssetId", "taxCategoryId") SELECT "createdAt", "updatedAt", "deletedAt", "enabled", "sku", "outOfStockThreshold", "useGlobalOutOfStockThreshold", "trackInventory", "id", "productId", "featuredAssetId", "taxCategoryId" FROM "product_variant"`, undefined);
        await queryRunner.query(`DROP TABLE "product_variant"`, undefined);
        await queryRunner.query(`ALTER TABLE "temporary_product_variant" RENAME TO "product_variant"`, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_6e420052844edf3a5506d863ce" ON "product_variant" ("productId") `, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_e38dca0d82fd64c7cf8aac8b8e" ON "product_variant" ("taxCategoryId") `, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_0e6f516053cf982b537836e21c" ON "product_variant" ("featuredAssetId") `, undefined);
        await queryRunner.query(`CREATE TABLE "temporary_shipping_method" ("createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "deletedAt" datetime, "code" varchar NOT NULL, "checker" text NOT NULL, "calculator" text NOT NULL, "fulfillmentHandlerCode" varchar NOT NULL, "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "customFieldsIsevent" boolean DEFAULT (0))`, undefined);
        await queryRunner.query(`INSERT INTO "temporary_shipping_method"("createdAt", "updatedAt", "deletedAt", "code", "checker", "calculator", "fulfillmentHandlerCode", "id") SELECT "createdAt", "updatedAt", "deletedAt", "code", "checker", "calculator", "fulfillmentHandlerCode", "id" FROM "shipping_method"`, undefined);
        await queryRunner.query(`DROP TABLE "shipping_method"`, undefined);
        await queryRunner.query(`ALTER TABLE "temporary_shipping_method" RENAME TO "shipping_method"`, undefined);
        await queryRunner.query(`CREATE TABLE "temporary_fulfillment" ("createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "state" varchar NOT NULL, "trackingCode" varchar NOT NULL DEFAULT (''), "method" varchar NOT NULL, "handlerCode" varchar NOT NULL, "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "customFieldsEventurls" text)`, undefined);
        await queryRunner.query(`INSERT INTO "temporary_fulfillment"("createdAt", "updatedAt", "state", "trackingCode", "method", "handlerCode", "id") SELECT "createdAt", "updatedAt", "state", "trackingCode", "method", "handlerCode", "id" FROM "fulfillment"`, undefined);
        await queryRunner.query(`DROP TABLE "fulfillment"`, undefined);
        await queryRunner.query(`ALTER TABLE "temporary_fulfillment" RENAME TO "fulfillment"`, undefined);
   }

   public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "fulfillment" RENAME TO "temporary_fulfillment"`, undefined);
        await queryRunner.query(`CREATE TABLE "fulfillment" ("createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "state" varchar NOT NULL, "trackingCode" varchar NOT NULL DEFAULT (''), "method" varchar NOT NULL, "handlerCode" varchar NOT NULL, "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL)`, undefined);
        await queryRunner.query(`INSERT INTO "fulfillment"("createdAt", "updatedAt", "state", "trackingCode", "method", "handlerCode", "id") SELECT "createdAt", "updatedAt", "state", "trackingCode", "method", "handlerCode", "id" FROM "temporary_fulfillment"`, undefined);
        await queryRunner.query(`DROP TABLE "temporary_fulfillment"`, undefined);
        await queryRunner.query(`ALTER TABLE "shipping_method" RENAME TO "temporary_shipping_method"`, undefined);
        await queryRunner.query(`CREATE TABLE "shipping_method" ("createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "deletedAt" datetime, "code" varchar NOT NULL, "checker" text NOT NULL, "calculator" text NOT NULL, "fulfillmentHandlerCode" varchar NOT NULL, "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL)`, undefined);
        await queryRunner.query(`INSERT INTO "shipping_method"("createdAt", "updatedAt", "deletedAt", "code", "checker", "calculator", "fulfillmentHandlerCode", "id") SELECT "createdAt", "updatedAt", "deletedAt", "code", "checker", "calculator", "fulfillmentHandlerCode", "id" FROM "temporary_shipping_method"`, undefined);
        await queryRunner.query(`DROP TABLE "temporary_shipping_method"`, undefined);
        await queryRunner.query(`DROP INDEX "IDX_0e6f516053cf982b537836e21c"`, undefined);
        await queryRunner.query(`DROP INDEX "IDX_e38dca0d82fd64c7cf8aac8b8e"`, undefined);
        await queryRunner.query(`DROP INDEX "IDX_6e420052844edf3a5506d863ce"`, undefined);
        await queryRunner.query(`ALTER TABLE "product_variant" RENAME TO "temporary_product_variant"`, undefined);
        await queryRunner.query(`CREATE TABLE "product_variant" ("createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "deletedAt" datetime, "enabled" boolean NOT NULL DEFAULT (1), "sku" varchar NOT NULL, "outOfStockThreshold" integer NOT NULL DEFAULT (0), "useGlobalOutOfStockThreshold" boolean NOT NULL DEFAULT (1), "trackInventory" varchar NOT NULL DEFAULT ('INHERIT'), "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "productId" integer, "featuredAssetId" integer, "taxCategoryId" integer, CONSTRAINT "FK_6e420052844edf3a5506d863ce6" FOREIGN KEY ("productId") REFERENCES "product" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_e38dca0d82fd64c7cf8aac8b8ef" FOREIGN KEY ("taxCategoryId") REFERENCES "tax_category" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_0e6f516053cf982b537836e21cf" FOREIGN KEY ("featuredAssetId") REFERENCES "asset" ("id") ON DELETE SET NULL ON UPDATE NO ACTION)`, undefined);
        await queryRunner.query(`INSERT INTO "product_variant"("createdAt", "updatedAt", "deletedAt", "enabled", "sku", "outOfStockThreshold", "useGlobalOutOfStockThreshold", "trackInventory", "id", "productId", "featuredAssetId", "taxCategoryId") SELECT "createdAt", "updatedAt", "deletedAt", "enabled", "sku", "outOfStockThreshold", "useGlobalOutOfStockThreshold", "trackInventory", "id", "productId", "featuredAssetId", "taxCategoryId" FROM "temporary_product_variant"`, undefined);
        await queryRunner.query(`DROP TABLE "temporary_product_variant"`, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_0e6f516053cf982b537836e21c" ON "product_variant" ("featuredAssetId") `, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_e38dca0d82fd64c7cf8aac8b8e" ON "product_variant" ("taxCategoryId") `, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_6e420052844edf3a5506d863ce" ON "product_variant" ("productId") `, undefined);
   }

}
