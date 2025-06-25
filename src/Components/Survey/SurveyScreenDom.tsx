"use dom";
import 'survey-core/survey-core.css';
import { Model, Survey } from 'survey-react-ui';

export default function SurveyScreenDom({ surveyJson,handleSurveyComplete }: { surveyJson: any,handleSurveyComplete: (data: any) => void }) {
      
      const survey = new Model(surveyJson);

      survey.onComplete.add((survey) => {
        handleSurveyComplete(survey.data);
      });

      return <Survey model={survey} />;
}