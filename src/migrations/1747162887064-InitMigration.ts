import { MigrationInterface, QueryRunner } from "typeorm";

export class InitMigration1747162887064 implements MigrationInterface {
    name = 'InitMigration1747162887064'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "requests" ("id" SERIAL NOT NULL, "status" text NOT NULL DEFAULT 'pending', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, "organizationId" integer, CONSTRAINT "PK_0428f484e96f9e6a55955f29b5f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "role" text NOT NULL DEFAULT 'user', CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "organizations" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "creatorId" integer NOT NULL, CONSTRAINT "PK_6b031fcd0863e3f6b44230163f9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "polls" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "options" text NOT NULL, "creatorId" integer NOT NULL, "description" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "isActive" boolean NOT NULL DEFAULT true, "organizationId" integer, CONSTRAINT "PK_b9bbb8fc7b142553c518ddffbb6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "votes" ("id" SERIAL NOT NULL, "pollId" integer NOT NULL, "userId" integer NOT NULL, "option" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f3d9fd4a0af865152c3f59db8ff" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "organizations_members_users" ("organizationsId" integer NOT NULL, "usersId" integer NOT NULL, CONSTRAINT "PK_717edbacb02a54277562e034fa3" PRIMARY KEY ("organizationsId", "usersId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_a7f65f144e59145649bb180d86" ON "organizations_members_users" ("organizationsId") `);
        await queryRunner.query(`CREATE INDEX "IDX_f14ee367211140e2985a71e72e" ON "organizations_members_users" ("usersId") `);
        await queryRunner.query(`ALTER TABLE "requests" ADD CONSTRAINT "FK_be846ad4b43f40acc7034ef7f40" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "requests" ADD CONSTRAINT "FK_20e82b3f5598abd12ef3bb80a24" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "polls" ADD CONSTRAINT "FK_14c8f5f26a1b9d6bc5dd984db5e" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "votes" ADD CONSTRAINT "FK_2e40638d2d3b898da1af363837c" FOREIGN KEY ("pollId") REFERENCES "polls"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "organizations_members_users" ADD CONSTRAINT "FK_a7f65f144e59145649bb180d864" FOREIGN KEY ("organizationsId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "organizations_members_users" ADD CONSTRAINT "FK_f14ee367211140e2985a71e72e1" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organizations_members_users" DROP CONSTRAINT "FK_f14ee367211140e2985a71e72e1"`);
        await queryRunner.query(`ALTER TABLE "organizations_members_users" DROP CONSTRAINT "FK_a7f65f144e59145649bb180d864"`);
        await queryRunner.query(`ALTER TABLE "votes" DROP CONSTRAINT "FK_2e40638d2d3b898da1af363837c"`);
        await queryRunner.query(`ALTER TABLE "polls" DROP CONSTRAINT "FK_14c8f5f26a1b9d6bc5dd984db5e"`);
        await queryRunner.query(`ALTER TABLE "requests" DROP CONSTRAINT "FK_20e82b3f5598abd12ef3bb80a24"`);
        await queryRunner.query(`ALTER TABLE "requests" DROP CONSTRAINT "FK_be846ad4b43f40acc7034ef7f40"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f14ee367211140e2985a71e72e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a7f65f144e59145649bb180d86"`);
        await queryRunner.query(`DROP TABLE "organizations_members_users"`);
        await queryRunner.query(`DROP TABLE "votes"`);
        await queryRunner.query(`DROP TABLE "polls"`);
        await queryRunner.query(`DROP TABLE "organizations"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "requests"`);
    }

}
