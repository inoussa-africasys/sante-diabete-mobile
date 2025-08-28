import React, { useState } from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import { AlertModal } from '@/src/Components/Modal';

const SurveyScreen = () => {
  const [simpleAlert, setSimpleAlert] = useState<{ visible: boolean; title: string; message: string; type: 'error' | 'warning' | 'success'; }>({ visible: false, title: '', message: '', type: 'success' });

  const handleMessage = (event: any) => {
    const surveyResult = JSON.parse(event.nativeEvent.data);
    setSimpleAlert({ visible: true, title: 'Résultat du sondage', message: JSON.stringify(surveyResult), type: 'success' });
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
      {simpleAlert.visible && (
        <AlertModal
          title={simpleAlert.title}
          type={simpleAlert.type}
          message={simpleAlert.message}
          onClose={() => setSimpleAlert({ ...simpleAlert, visible: false })}
          isVisible={simpleAlert.visible}
        />
      )}
    </View>
  );
};

export default SurveyScreen;
