"use dom";
import React from "react";
import "survey-core/i18n/french";
import 'survey-core/survey-core.css';
import { Model, Survey } from 'survey-react-ui';

export default function SurveyScreenDom({ surveyJson,handleSurveyComplete,data = null,isReadOnly = false }: { surveyJson: any,handleSurveyComplete: (data: any) => void ,data?: any ,isReadOnly?: boolean }) {
      
      const survey = new Model(surveyJson);
      if (data) {
        survey.data = data; 
      }
      if (isReadOnly) {
        survey.mode = 'display';
      }
      survey.onComplete.add((survey) => {
        handleSurveyComplete(survey.data);
      });

      return <Survey model={survey} />;
}