import React from 'react';
import { Alert, View } from 'react-native';
import { WebView } from 'react-native-webview';

const SurveyScreen = () => {
  const handleMessage = (event: any) => {
    const surveyResult = JSON.parse(event.nativeEvent.data);
    Alert.alert("Résultat du sondage", JSON.stringify(surveyResult));
    // Tu peux aussi envoyer ça vers une API ou stocker localement
  };

  return (
    <View style={{ flex: 1 }}>
      <WebView
        originWhitelist={['*']}
        source={require('../../assets/html/formulaire.html')}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
    </View>
  );
};

export default SurveyScreen;
