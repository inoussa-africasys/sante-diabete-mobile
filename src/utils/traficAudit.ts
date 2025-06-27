import axios from 'axios';
import { AuditEventMessage, AuditEventType } from '../types/AuditType';
import Logger from './Logger';

type EventType = AuditEventType;
type EventMessage = AuditEventMessage;

const BASE_URL = 'https://api.africasys.com'; // Remplace par ta vraie URL
const TOKEN = 'your_token'; // à injecter dynamiquement idéalement
const APP_VERSION = '1.0.0';
const USER_LAST_SYNC_DATE = '2025-06-27'; // À adapter dynamiquement si besoin

export async function sendTraficAuditEvent(event_type: EventType, event_msg: EventMessage = ''): Promise<void> {
  try {
    const url = `${BASE_URL}/api/v2/json/mobile/trafic/events/${event_type}?token=${TOKEN}&app_version=${APP_VERSION}&user_last_sync_date=${USER_LAST_SYNC_DATE}`;

    const payload = {
      data: JSON.stringify(event_msg),
    };

    const response = await axios.post(url, payload);
    Logger.info(`AuditEvent: ${response.data}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    Logger.error(`Error occurred in sendTraficAuditEvent: ${errorMessage}`);
  }
}
