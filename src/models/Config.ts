import { BaseModel } from "./BaseModel";

export default class Config extends BaseModel {
    name: string;
    value: string;

    constructor(data?: Partial<Config>) {
        super();
        this.name = data?.name || '';
        this.value = data?.value || '';
    }
}