import { FormFill } from "../models/FormFill";
import FormFillForm from "../types/formFill";

export default class FormFillMapper {
    static toFormFill(json: FormFillForm): FormFill {
        const formFill = new FormFill();
        formFill.ficheName = json.ficheName;
        formFill.data = JSON.stringify(json.data);
        formFill.longitude = json.coordinates.longitude;
        formFill.latitude = json.coordinates.latitude;
        return formFill;
    }
}
