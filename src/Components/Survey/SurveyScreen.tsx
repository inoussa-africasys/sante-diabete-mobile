import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
interface SurveyScreenProps {
  surveyJson: any; // Le JSON du questionnaire
  onComplete?: (data: any) => void; // Callback appelé quand le questionnaire est complété
}

const SurveyScreen: React.FC<SurveyScreenProps> = ({ 
  surveyJson, 
  onComplete
}) => {
  const [isInjected, setIsInjected] = useState(false);
  const webViewRef = useRef<WebView>(null);


  // Inline HTML contenant SurveyJS
const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Survey Offline</title>
  <style>body { font-family: Arial; padding: 10px; }</style>
  <script>
    /* TODO: Coller ici le contenu de survey.core.min.js */

  </script>
  <script>
    document.addEventListener("message", function(e) {
      try {
        const json = JSON.parse(e.data);
        const survey = new Survey.Model(json);
        survey.onComplete.add(r => window.ReactNativeWebView.postMessage(JSON.stringify(r.data)));
        survey.render("surveyContainer");
      } catch (err) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ error: err.message }));
      }
    });
  </script>
</head>
<body>
  <h1>Formulaire de sondage</h1>
  <h1>Formulaire de sondage</h1>
  <h1>Formulaire de sondage</h1>
  <h1>Formulaire de sondage</h1>
  <div id="surveyContainer"></div>
</body>
</html>
`;



  // Injecter le JSON du questionnaire dans la WebView une fois qu'elle est chargée
  const handleWebViewLoad = useCallback(() => {
    if (webViewRef.current && surveyJson && !isInjected) {
      try {
        console.log('Injection du JSON dans la WebView...');
        
        // Convertir le JSON en string et l'échapper pour l'injection JS
        const jsonString = JSON.stringify(surveyJson);
        
        // Méthode 1: Utiliser postMessage de window qui est compatible avec window.addEventListener("message")
        webViewRef.current.injectJavaScript(`
          (function() {
            const json = ${JSON.stringify(jsonString)};
            document.dispatchEvent(new MessageEvent("message", { data: JSON.stringify(json) }));
          })();
          true;
        `);
        
        // Marquer comme injecté pour éviter les injections multiples
        setIsInjected(true);
      } catch (error) {
        console.error('Erreur lors de l\'injection du JSON:', error);
      }
    }
  }, [surveyJson, isInjected]);

  // Réinitialiser le flag isInjected si surveyJson change
  useEffect(() => {
    setIsInjected(false);
  }, [surveyJson]);

  // Gérer les messages reçus de la WebView (résultats du questionnaire)
  const handleMessage = useCallback((event: any) => {
    try {
      const surveyResult = JSON.parse(event.nativeEvent.data);
      
      // Logger les résultats dans la console
      console.log('Données brutes du questionnaire:', surveyResult);
      
      // Appeler le callback onComplete si fourni
      if (onComplete) {
        onComplete(surveyResult);
      }
    } catch (error) {
      console.error('Erreur lors du traitement des résultats:', error);
    }
  }, [onComplete]);


  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        /* source={require('../../../assets/html/formulaire.html')} */
        source={{ html }}
        onMessage={handleMessage}
        onLoad={handleWebViewLoad}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowFileAccess={true}
        allowUniversalAccessFromFileURLs={true}
        allowFileAccessFromFileURLs={true}
        cacheEnabled={false}
        style={styles.webview}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SurveyScreen;
