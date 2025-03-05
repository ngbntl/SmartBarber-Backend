// import { MigrationInterface, QueryRunner } from 'typeorm';

// export class Initdb1730447723577 implements MigrationInterface {
//   name = 'Initdb1730447723577';

//   public async up(queryRunner: QueryRunner): Promise<void> {
//     await queryRunner.query(
//       `CREATE TABLE \`IW_Clients\` (\`CreateAt\` bigint NULL, \`UpdateAt\` bigint NULL, \`DeleteAt\` bigint NULL, \`id\` int NOT NULL AUTO_INCREMENT, \`Name\` varchar(255) NOT NULL, \`ClientId\` varchar(255) NULL, \`ClientSecret\` varchar(255) NULL, \`RedirectUrl\` varchar(255) NULL, \`Scope\` enum ('default', 'full') NOT NULL DEFAULT 'default', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
//     );
//     await queryRunner.query(
//       `CREATE TABLE \`IW_Tokens\` (\`CreateAt\` bigint NULL, \`UpdateAt\` bigint NULL, \`DeleteAt\` bigint NULL, \`Id\` varchar(36) NOT NULL, \`RefreshToken\` varchar(4096) NOT NULL, \`refreshPublicKey\` varchar(4096) NOT NULL, \`accessPublicKey\` varchar(4096) NOT NULL, \`UserId\` varchar(255) NOT NULL, \`ExpireAt\` datetime NOT NULL, PRIMARY KEY (\`Id\`)) ENGINE=InnoDB`,
//     );
//   }

//   public async down(queryRunner: QueryRunner): Promise<void> {
//     await queryRunner.query(`DROP TABLE \`IW_Tokens\``);
//     await queryRunner.query(`DROP TABLE \`IW_Clients\``);
//   }
// }
