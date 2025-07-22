import { MikroORM } from "@mikro-orm/core";
import { SqlHighlighter } from "@mikro-orm/sql-highlighter";

export const orm = await MikroORM.init({
    entities: ['dist/**/*.entity.js'],
    entitiesTs: ['src/**/*.entity.ts'],
    dbName: 'descalifica2',
    type: 'mysql',
    clientUrl: 'mysql://fran:santigay@localhost:3306/descalifica2',
    highlighter: new SqlHighlighter(),
    debug: true,
    schemaGenerator: { //NUNCA EN PRODUCCION
        disableForeignKeys: true,
        createForeignKeyConstraints: true,
        ignoreSchema:[],
    },
})

export const syncSchema = async ()  => {
    const generator = orm.getSchemaGenerator()
    await generator.updateSchema()
    /* 
    await generator.dropSchema() BORRA ESQUEMA
    await generator.createSchema() CREA DESDE CERO
    */
}