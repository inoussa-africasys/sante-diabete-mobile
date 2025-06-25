import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

const SurveyScreenV2 = ({ surveyJson, onComplete }: any) => {
  const [htmlContent, setHtmlContent] = useState('');
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    const loadHtml = async () => {
      const asset = Asset.fromModule(require('../../../assets/html/formulaire.html'));
      await asset.downloadAsync();
      const html = await FileSystem.readAsStringAsync(asset.localUri!);
      setHtmlContent(html);
    };
    loadHtml();
  }, []);

  const injectJson = () => {
    const stringified = JSON.stringify(surveyJson).replace(/'/g, "\\'");
    webViewRef.current?.injectJavaScript(`
      document.dispatchEvent(new MessageEvent("message", { data: '${stringified}' }));
      true;
    `);
  };

  const handleMessage = (event: any) => {
    const result = JSON.parse(event.nativeEvent.data);
    onComplete?.(result);
  };

  if (!htmlContent) return null;

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        onLoadEnd={injectJson}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={['*']}
        allowFileAccess
        allowUniversalAccessFromFileURLs
        allowFileAccessFromFileURLs
        cacheEnabled={false}
        style={styles.webview}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  webview: { flex: 1 }
});

export default SurveyScreenV2;
