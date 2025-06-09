import { getDb } from '../core/database/database';
import Config from '../models/Config';
import GenericRepository from './GenericRepository';

const ConfigRepository = new GenericRepository<Config>(
  getDb,
  'config',
  Config.columns(),
  Config.fromRow
);

export default ConfigRepository;
