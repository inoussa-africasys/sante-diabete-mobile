import Config from '../models/Config';
import { GenericRepository } from './GenericRepository';

export class ConfigRepository extends GenericRepository<Config> {
  constructor() {
    super('config', (data) => new Config(data));
  }
}
