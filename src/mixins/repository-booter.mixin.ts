import * as path from 'path';
import * as glob from 'glob-promise';

import {Constructor} from '@loopback/core';
import {loadClassesFromFiles} from '@loopback/boot';
import {createConnection, Repository} from 'typeorm';

function loadFiles(projectRoot: string, modelsDir: string): string[] {
  // this should be in options
  return glob.sync(path.resolve(projectRoot, modelsDir));
}

function loadRepoFiles(projectRoot: string): string[] {
  // this should be in options
  return glob.sync(projectRoot + '/repositories/*.repository.js');
}

// tslint:disable-next-line:no-any
export function TypeORMBootMixin<T extends Constructor<any>>(superClass: T) {
  return class extends superClass {
    async bootTypeOrm(): Promise<void> {
      const options = this.bootOptions.typeorm;
      const connection = await createConnection(options.ormConfig);

      this.bind('typeorm.connection').to(this._connection);

      const repoFiles = loadRepoFiles(this.projectRoot);
      const repos = loadClassesFromFiles(repoFiles, this.projectRoot);

      const files = loadFiles(this.projectRoot, options.ormConfig);
      const models = loadClassesFromFiles(files, this.projectRoot);

      models.forEach(m => {
        try {
          const repository = connection.getRepository(m);

          this.bind(`typeorm.repositories.${repository.metadata.tableName}`).to(
            repository,
          );
        } catch (e) {
          if (e.name === 'RepositoryNotFoundError') {
            return;
          }

          throw e;
        }
      });

      // Override previous defaults repositories with custom repositories if found any
      repos.forEach(r => {
        try {
          const repository = connection.getCustomRepository(r) as Repository<
            // tslint:disable-next-line:no-any
            any
          >;

          this.bind(`typeorm.repositories.${repository.metadata.tableName}`).to(
            repository,
          );
        } catch (e) {
          if (e.name === 'CustomRepositoryNotFoundError') {
            return;
          }

          throw e;
        }
      });
    }
  };
}
