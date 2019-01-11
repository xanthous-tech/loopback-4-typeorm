import { jsonToSchemaObject, JsonSchema } from "@loopback/rest";
import { FindOptionsWhere } from "typeorm";

const schema: JsonSchema = {
  properties: {
    offset: {
      type: 'integer',
      minimum: 0,
    },

    limit: {
      type: 'integer',
      minimum: 0,
    },

    skip: {
      type: 'integer',
      minimum: 0,
    },
  }
};

export type Filter<T> = FindOptionsWhere<T>;
export const filterSchema = jsonToSchemaObject(schema);
