// SurveyOfflineForm.tsx
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

const formJson = {
  title: "Formulaire Santé",
  pages: [
    {
      name: "page1",
      elements: [
        { type: "text", name: "nom", title: "Quel est votre nom ?" },
        { type: "radiogroup", name: "genre", title: "Quel est votre genre ?", choices: ["Homme", "Femme", "Autre"] }
      ]
    }
  ]
};

export default function SurveyOfflineForm() {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    const loadAssets = async () => {
      const cssFile = await Asset.fromModule(require('../../../assets/survey/modern.css')).downloadAsync();
      const jsFile = await Asset.fromModule(require('../../../assets/survey/survey-jquery.min.js')).downloadAsync();
      const jsFile2 = await Asset.fromModule(require('../../../assets/survey/jquery.js')).downloadAsync();

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${await FileSystem.readAsStringAsync(cssFile.localUri!)}</style>
          <script>${await FileSystem.readAsStringAsync(jsFile.localUri!)}</script>
          <script>${await FileSystem.readAsStringAsync(jsFile2.localUri!)}</script>
        </head>
       
<body style="margin: 0">

    <div id="surveyContainer"></div>

</body>

<script>
    Survey.StylesManager.applyTheme("modern");


    var surveyJSON = {
     title: "Formulaire SurveyJS",
    pages: [
      {
        name: "page1",
        elements: [
          { type: "text", name: "nom", title: "Quel est votre nom ?" },
          { type: "radiogroup", name: "satisfait", title: "Satisfait ?", choices: ["Oui", "Non"] }
        ]
      }
    ]
  }
  

    function sendDataToServer(survey) {
        //send Ajax request to your web server
        alert("The results are: " + JSON.stringify(survey.data));
    }

    var survey = new Survey.Model(surveyJSON);
    $("#surveyContainer").Survey({
        model: survey,
        onComplete: sendDataToServer
    });


</script>

        </html>
      `;
      setHtml(htmlContent);
    };

    loadAssets();
  }, []);

  if (!html) return null;

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        javaScriptEnabled
        onMessage={(event) => {
          const result = JSON.parse(event.nativeEvent.data);
          console.log('Données formulaire (offline) :', result);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }
});
