# Loopback 4 TypeORM

A simple compat wrapper around TypeORM.

## Getting Started

We will start with installing the dependencies we need. Note there are driver dependencies you will need to install based on db you want to use. Check TypeORM documentation for comprehensive list of supported devices.

```bash
# Install the extension
npm install --save loopback-4-typeorm

# Driver dependent part
npm install --save sqlite3
```

There are a few different ways to pass configs to TypeORM. We can use `ormconfig.json` or pass a config object to application configs.

```typescript
// In src/configuration.ts
import {ConnectionOptions} from 'loopback-4-typeorm';

/**
 * These will change depending on the database driver you want to
 * use.
 *
 * For more information please refer to the
 * [typeorm docs](http://typeorm.io/#/connection-options).
 */
export const ormconfig: ConnectionOptions = {
  name: 'default',
  type: 'sqlite',
  database: 'data/db.sqlite',
  entities: ['dist/src/models/*.model.js'],
  synchronize: true,
  logging: true,
};
```

Now it's time to boot the application. This process is going to create a new connection and bind TypeORM repositories into the application context.

```typescript
// ...
export async function main(options: ApplicationConfig = {}) {
  const app = new LoopbackPlaygroundApplication(options);
  /**
   * Boot typeorm first. This will create a connection and bind
   * repositories into app context.
   */
  await app.bootTypeOrm();
  await app.boot();

  // ...
}
```

Next step is to define an entity for TypeORM. Here we need to define both TypeORM and OpenAPI specs on the model class.

```typescript
import {Entity, PrimaryGeneratedColumn, Column} from 'loopback-4-typeorm';
import {property, model} from '@loopback/repository';

@model()
@Entity() // Mark class as Entity for TypeORM.
export class User {
  @PrimaryGeneratedColumn() // Mark id as PrimaryColumn.
  @property({type: 'number', id: true})
  id: number;

  @Column({unique: true}) // Mark field as varchar column.
  @property({type: 'string', required: true})
  name: string;

  // ...
}
```

Optionally, we define a custom repository. This is going to hold our custom methods if any needed.

```typescript
@EntityRepository(User)
export class UserRepository extends Repository<User> {
  /**
   * Custom methods go here.
   */
}
```

It's now time to give it a try!

```typescript
import {User} from '../models';

export class UserController {
  constructor(
    /**
     * Here we inject our TypeORM repository into controller.
     * API is the same as the default repository except we use
     * `loopback-4-typeorm` repository decorator.
     */
    @repository(User) private userRepository: UserRepository,
  ) {}

  get('/users')
  async find(): Promise<User[]> {
  	return this.userRepository.find();
  }
}
```
