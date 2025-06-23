import { useCallback, useEffect, useState } from 'react';

/**
 * Hook personnalisé pour générer dynamiquement un JSON de questionnaire SurveyJS
 * @param options Options de configuration du questionnaire
 * @returns Le JSON du questionnaire prêt à être utilisé avec SurveyJS
 */
export const useSurveyJson = (options: {
  title?: string;
  description?: string;
  patientId?: string;
  consultationId?: string;
  questionnaireType?: 'initial' | 'suivi' | 'prevention';
  locale?: 'fr' | 'en';
}) => {
  const [surveyJson, setSurveyJson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extraire les options pour les utiliser comme dépendances stables
  const {
    title = "Questionnaire Santé Diabète",
    description = "Veuillez répondre aux questions suivantes",
    patientId = "",
    consultationId = "",
    questionnaireType = "initial",
    locale = "fr"
  } = options;

  // Utiliser useCallback pour mémoriser la fonction et éviter les recréations inutiles
  const generateSurveyJson = useCallback(async () => {
    try {
      setLoading(true);
      
      // Génération du JSON en fonction du type de questionnaire
      let pages = [];
      
      // Informations générales (présentes dans tous les types de questionnaire)
      const infoGeneralesPage = {
        name: "infoGenerales",
        title: locale === 'fr' ? "Informations générales" : "General information",
        elements: [
          {
            type: "text",
            name: "nom",
            title: locale === 'fr' ? "Nom" : "Last name",
            isRequired: true
          },
          {
            type: "text",
            name: "prenom",
            title: locale === 'fr' ? "Prénom" : "First name",
            isRequired: true
          },
          {
            type: "radiogroup",
            name: "genre",
            title: locale === 'fr' ? "Genre" : "Gender",
            isRequired: true,
            choices: [
              { value: "homme", text: locale === 'fr' ? "Homme" : "Male" },
              { value: "femme", text: locale === 'fr' ? "Female" : "Female" }
            ]
          },
          {
            type: "text",
            name: "age",
            title: locale === 'fr' ? "Âge" : "Age",
            inputType: "number",
            isRequired: true
          }
        ]
      };
      
      pages.push(infoGeneralesPage);
      
      // Pages spécifiques selon le type de questionnaire
      if (questionnaireType === 'initial') {
        // Questionnaire initial - Antécédents médicaux
        pages.push({
          name: "antecedents",
          title: locale === 'fr' ? "Antécédents médicaux" : "Medical history",
          elements: [
            {
              type: "checkbox",
              name: "antecedentsFamiliaux",
              title: locale === 'fr' ? "Antécédents familiaux de diabète" : "Family history of diabetes",
              choices: [
                { value: "pere", text: locale === 'fr' ? "Père" : "Father" },
                { value: "mere", text: locale === 'fr' ? "Mère" : "Mother" },
                { value: "freres_soeurs", text: locale === 'fr' ? "Frères/Sœurs" : "Siblings" },
                { value: "grands_parents", text: locale === 'fr' ? "Grands-parents" : "Grandparents" },
                { value: "aucun", text: locale === 'fr' ? "Aucun" : "None" }
              ]
            },
            {
              type: "checkbox",
              name: "maladiesChroniques",
              title: locale === 'fr' ? "Maladies chroniques" : "Chronic diseases",
              choices: [
                { value: "hypertension", text: locale === 'fr' ? "Hypertension" : "Hypertension" },
                { value: "cardiopathie", text: locale === 'fr' ? "Cardiopathie" : "Heart disease" },
                { value: "insuffisance_renale", text: locale === 'fr' ? "Insuffisance rénale" : "Kidney failure" },
                { value: "aucune", text: locale === 'fr' ? "Aucune" : "None" }
              ]
            }
          ]
        });
        
        // Symptômes actuels
        pages.push({
          name: "symptomes",
          title: locale === 'fr' ? "Symptômes actuels" : "Current symptoms",
          elements: [
            {
              type: "checkbox",
              name: "symptomesActuels",
              title: locale === 'fr' ? "Symptômes ressentis" : "Symptoms experienced",
              choices: [
                { value: "polyurie", text: locale === 'fr' ? "Polyurie (uriner fréquemment)" : "Polyuria (frequent urination)" },
                { value: "polydipsie", text: locale === 'fr' ? "Polydipsie (soif excessive)" : "Polydipsia (excessive thirst)" },
                { value: "perte_poids", text: locale === 'fr' ? "Perte de poids inexpliquée" : "Unexplained weight loss" },
                { value: "fatigue", text: locale === 'fr' ? "Fatigue" : "Fatigue" },
                { value: "vision_floue", text: locale === 'fr' ? "Vision floue" : "Blurred vision" },
                { value: "aucun", text: locale === 'fr' ? "Aucun" : "None" }
              ]
            }
          ]
        });
      } else if (questionnaireType === 'suivi') {
        // Questionnaire de suivi
        pages.push({
          name: "suivi",
          title: locale === 'fr' ? "Suivi du traitement" : "Treatment follow-up",
          elements: [
            {
              type: "radiogroup",
              name: "respectTraitement",
              title: locale === 'fr' ? "Avez-vous respecté votre traitement ?" : "Have you followed your treatment?",
              isRequired: true,
              choices: [
                { value: "toujours", text: locale === 'fr' ? "Toujours" : "Always" },
                { value: "souvent", text: locale === 'fr' ? "Souvent" : "Often" },
                { value: "parfois", text: locale === 'fr' ? "Parfois" : "Sometimes" },
                { value: "rarement", text: locale === 'fr' ? "Rarement" : "Rarely" },
                { value: "jamais", text: locale === 'fr' ? "Jamais" : "Never" }
              ]
            },
            {
              type: "text",
              name: "glycemie",
              title: locale === 'fr' ? "Glycémie à jeun (g/L)" : "Fasting blood glucose (g/L)",
              inputType: "number",
              isRequired: true
            },
            {
              type: "comment",
              name: "effetsSecondaires",
              title: locale === 'fr' ? "Avez-vous ressenti des effets secondaires ?" : "Have you experienced any side effects?"
            }
          ]
        });
      } else if (questionnaireType === 'prevention') {
        // Questionnaire de prévention
        pages.push({
          name: "habitudesVie",
          title: locale === 'fr' ? "Habitudes de vie" : "Lifestyle habits",
          elements: [
            {
              type: "radiogroup",
              name: "activitePhysique",
              title: locale === 'fr' ? "Pratiquez-vous une activité physique régulière ?" : "Do you engage in regular physical activity?",
              isRequired: true,
              choices: [
                { value: "quotidien", text: locale === 'fr' ? "Quotidiennement" : "Daily" },
                { value: "hebdomadaire", text: locale === 'fr' ? "Hebdomadairement" : "Weekly" },
                { value: "mensuel", text: locale === 'fr' ? "Mensuellement" : "Monthly" },
                { value: "jamais", text: locale === 'fr' ? "Jamais" : "Never" }
              ]
            },
            {
              type: "radiogroup",
              name: "alimentation",
              title: locale === 'fr' ? "Comment qualifieriez-vous votre alimentation ?" : "How would you describe your diet?",
              isRequired: true,
              choices: [
                { value: "equilibree", text: locale === 'fr' ? "Équilibrée" : "Balanced" },
                { value: "moderee", text: locale === 'fr' ? "Modérément équilibrée" : "Moderately balanced" },
                { value: "desequilibree", text: locale === 'fr' ? "Déséquilibrée" : "Unbalanced" }
              ]
            }
          ]
        });
      }
      
      // Commentaires (présent dans tous les types de questionnaire)
      pages.push({
        name: "commentaires",
        title: locale === 'fr' ? "Commentaires additionnels" : "Additional comments",
        elements: [
          {
            type: "comment",
            name: "commentaires",
            title: locale === 'fr' ? "Avez-vous des commentaires supplémentaires ?" : "Do you have any additional comments?"
          }
        ]
      });

      // Construction du JSON final
      const finalJson = {
        title: title,
        description: description,
        locale: locale,
        pages: pages,
        showQuestionNumbers: "on",
        showProgressBar: "top",
        progressBarType: "buttons",
        completeText: locale === 'fr' ? "Terminer" : "Complete",
        pageNextText: locale === 'fr' ? "Suivant" : "Next",
        pagePrevText: locale === 'fr' ? "Précédent" : "Previous",
        // Métadonnées pour le traitement côté serveur
        metadata: {
          patientId,
          consultationId,
          questionnaireType,
          timestamp: new Date().toISOString()
        }
      };
      
      setSurveyJson(finalJson);
      setError(null);
    } catch (err) {
      console.error('Erreur lors de la génération du JSON:', err);
      setError('Erreur lors de la génération du questionnaire');
    } finally {
      setLoading(false);
    }
  }, [title, description, patientId, consultationId, questionnaireType, locale]); // Dépendances stables

  useEffect(() => {
    generateSurveyJson();
  }, [generateSurveyJson]); // Seule dépendance est la fonction mémorisée

  return { surveyJson, loading, error };
};

export default useSurveyJson;
