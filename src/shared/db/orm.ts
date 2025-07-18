import { MikroORM } from "@mikro-orm/core";
import { MySqlDriver } from "@mikro-orm/mysql";
import { SqlHighlighter } from "@mikro-orm/sql-highlighter";

export const orm = await MikroORM.init({
  entities: ['dist/**/*.entity.js'],
  entitiesTs: ['src/**/*.entity.ts'],
  dbName: 'descalifica2',
  //type: 'mysql', DEPRECADO ¿Sabe el profe? Abajo puse la version que creo que se usa ahora
  driver: MySqlDriver,
  clientUrl: 'mysql://dsw:dsw@localhost:3306/descalifica2',
  highlighter: new SqlHighlighter(),
  debug:true,

  schemaGenerator:{
    disableForeignKeys:true,
    createForeignKeyConstraints:true,
    ignoreSchema:[],
  }
})

export const syncSchema = async () => {
  const generator = orm.getSchemaGenerator()
  await generator.updateSchema()
}