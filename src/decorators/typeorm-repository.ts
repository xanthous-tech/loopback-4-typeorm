import {inject} from '@loopback/context';
import {getConnection, EntitySchema} from 'typeorm';

const defaultRepositoryOptions: RepositoryOptions = {};

interface RepositoryOptions {
  /**
   * Name of the connection to get model metadata from.
   * Defaults to 'default'
   */
  connectionName?: string;
}

/**
 * Injects a typeorm repository.
 *
 * @example
 * class PlantController {
 *    constructor(
 *        @repository(PlantModel) plantRepository: PlantRepository,
 *    ) {}
 * }
 */
export function repository(
  model: Function | string,
  options: RepositoryOptions = {},
): Function {
  options = Object.assign({}, options, defaultRepositoryOptions);
  const connection = getConnection(options.connectionName);

  const modelMetadata = connection.getMetadata(model);
  const modelName = modelMetadata.tableName;

  return inject(`typeorm.repositories.${modelName}`);
}
