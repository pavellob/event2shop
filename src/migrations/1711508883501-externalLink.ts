import {MigrationInterface, QueryRunner} from "typeorm";

export class externalLink1711508883501 implements MigrationInterface {

   public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "product_variant" ADD "customFieldsExternalbookinglink" character varying(255)`, undefined);
   }

   public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "product_variant" DROP COLUMN "customFieldsExternalbookinglink"`, undefined);
   }

}
