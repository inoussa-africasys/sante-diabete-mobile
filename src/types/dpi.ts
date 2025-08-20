export interface DpiItem {
    date_consultation: string;
    formName: string;
    fiche_consultation_name: string;
    uuid: string;
    content: string;
}

export type DpiResponse = DpiItem[]