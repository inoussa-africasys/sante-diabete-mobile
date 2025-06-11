import QRCode from '../models/QRCode';
import { GenericRepository } from './GenericRepository';

export class QRCodeRepository extends GenericRepository<QRCode> {
  constructor() {
    super('qr_codes', (data) => new QRCode(data));
  }
}
