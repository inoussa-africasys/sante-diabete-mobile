import axios from 'axios';
import { APP_VERSION } from '../Constants/App';
import { getBaseUrl, getLastSyncDate, getToken } from '../functions';
import { AuditEventMessage, AuditEventType } from '../types/AuditType';
import Logger from './Logger';

type EventType = AuditEventType;
type EventMessage = AuditEventMessage;

export async function sendTraficAuditEvent(event_type: EventType, event_msg: EventMessage = ''): Promise<void> {
  try {
    const BASE_URL = await getBaseUrl(); 
    const TOKEN = await getToken(); 
    const USER_LAST_SYNC_DATE = await getLastSyncDate();

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
