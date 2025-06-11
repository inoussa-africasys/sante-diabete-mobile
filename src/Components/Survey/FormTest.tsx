import * as Asset from 'expo-asset';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Button, View } from 'react-native';
import { WebView } from 'react-native-webview';

const FormTest: React.FC = () => {
  const webviewRef = useRef<WebView>(null);
  const [htmlUri, setHtmlUri] = useState<string | null>(null);

  const loadHtmlFile = async () => {
    const asset = Asset.Asset.fromModule(require('../../../assets/survey/form.html'));
    await asset.downloadAsync();
    setHtmlUri(asset.localUri || asset.uri);
  };

  useEffect(() => {
    loadHtmlFile();
  }, []);

  const surveyJSON = {
    title: "SurveyJS Offline Demo",
    pages: [
      {
        name: "page1",
        elements: [
          { type: "text", name: "question1", title: "Ton nom ?" }
        ]
      }
    ]
  };

  const sendSurveyJSON = () => {
    console.log("Envoi du JSON au formulaire...");
    webviewRef.current?.postMessage(JSON.stringify(surveyJSON));
  };

  const handleSurveyResult = (event: any) => {
    const surveyResult = JSON.parse(event.nativeEvent.data);
    console.log("Résultat du formulaire :", surveyResult);
  };

  if (!htmlUri) {
    return <ActivityIndicator />;
  }

  return (
    <View style={{ flex: 1 }}>
      <WebView
        ref={webviewRef}
        originWhitelist={['*']}
        source={{ uri: htmlUri }}
        onMessage={handleSurveyResult}
        javaScriptEnabled
        domStorageEnabled
        allowFileAccess
        allowFileAccessFromFileURLs
        allowUniversalAccessFromFileURLs
      />
      <Button title="Lancer le formulaire" onPress={sendSurveyJSON} />
    </View>
  );
};

export default FormTest;
