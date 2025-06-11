import { BaseModel } from "./BaseModel";

export default class QRCode extends BaseModel {
    type: string;
    url: string;
    code: string;
    username: string;

    constructor(data?: Partial<QRCode>) {
        super();
        this.type = data?.type || '';
        this.url = data?.url || '';
        this.code = data?.code || '';
        this.username = data?.username || '';
    }
}