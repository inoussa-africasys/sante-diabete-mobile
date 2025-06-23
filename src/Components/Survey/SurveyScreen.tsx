import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

interface SurveyScreenProps {
  surveyJson: any; // Le JSON du questionnaire
  onComplete?: (data: any) => void; // Callback appelé quand le questionnaire est complété
}

const SurveyScreen: React.FC<SurveyScreenProps> = ({ 
  surveyJson, 
  onComplete
}) => {
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInjected, setIsInjected] = useState(false);
  const webViewRef = useRef<WebView>(null);

  // Charger le contenu HTML du fichier local
  useEffect(() => {
    const loadHtmlContent = async () => {
      try {
        setLoading(true);
        
        // Utiliser Asset pour charger le fichier HTML depuis les assets
        const asset = Asset.fromModule(require('../../../assets/survey/form.html'));
        await asset.downloadAsync();
        
        if (!asset.localUri) {
          throw new Error("Impossible de charger le fichier HTML");
        }
        
        // Lire le contenu du fichier HTML directement depuis l'URI local de l'asset
        const content = await FileSystem.readAsStringAsync(asset.localUri);
        setHtmlContent(content);
      } catch (error) {
        console.error('Erreur lors du chargement du HTML:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHtmlContent();
  }, []);

  // Injecter le JSON du questionnaire dans la WebView une fois qu'elle est chargée
  const handleWebViewLoad = useCallback(() => {
    if (webViewRef.current && surveyJson && !isInjected) {
      try {
        console.log('Injection du JSON dans la WebView...');
        
        // Convertir le JSON en string et l'échapper pour l'injection JS
        const jsonString = JSON.stringify(surveyJson);
        
        // Méthode 1: Utiliser postMessage de window qui est compatible avec window.addEventListener("message")
        webViewRef.current.injectJavaScript(`
          try {
            window.postMessage(${JSON.stringify(jsonString)}, '*');
            console.log('JSON injecté via window.postMessage');
            true;
          } catch(e) {
            console.error('Erreur lors de l\\'injection:', e);
            false;
          }
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

  if (loading || !htmlContent) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent, baseUrl: 'file:///android_asset/' }}
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
