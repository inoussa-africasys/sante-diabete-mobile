import Fiche from '../models/Fiche';
import { GenericRepository } from './GenericRepository';

export class FicheRepository extends GenericRepository<Fiche> {
  constructor() {
    super('fiches', (data) => new Fiche(data));
  }
}
