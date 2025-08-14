import { AlertModal, AlertModalRich, LoadingModal } from "@/src/Components/Modal";
import { useAuth } from "@/src/context/AuthContext";
import { useDiabetes } from "@/src/context/DiabetesContext";
import { decodeCleanAndInsertQRCodeOnDB } from "@/src/Services/authenticationService";
import { DiabeteType } from "@/src/types/enums";
import Logger from "@/src/utils/Logger";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import QRCodeScannerView from '../src/Components/Scanner/QRCodeScannerView';
import { isValidURL } from '../src/functions';

const ScannerScreen = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { diabetesType } = useDiabetes();
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');

  const handleScan = async (data: string) => {
    setIsLoading(true);
    const {token, url,username} = await decodeCleanAndInsertQRCodeOnDB(diabetesType as DiabeteType, data);
    setUsername(username);
    if(token) {
      if(isValidURL(url)) {
        
        const loginResult = await login({baseUrl: url, token, diabetesType: diabetesType as DiabeteType, userName: username});
        if(loginResult) {
          setLoginSuccess(true);
          } else {
          setLoginError(true);
          setErrorMessage('Connexion echouée, les identifiants sont incorrects');
          Logger.error('Connexion echouée, les identifiants sont incorrects');
        }
      } else {
        setErrorMessage('URL invalide');
        setLoginError(true);
        Logger.error('URL invalide');
      }
    }
    setIsLoading(false);
  };

  const handleClose = () => {
    router.back();
  };

  const handleCloseLoginSuccess = () => {
    setLoginSuccess(false);
    router.replace(`/${diabetesType.toLowerCase()}`);
  };


  const handleCloseLoginError = () => {
    setLoginError(false);
    handleClose();
  };


  return (
    <>
    <QRCodeScannerView
      type="user"
      onScan={handleScan}
      onClose={handleClose}
    />
    <AlertModalRich 
      type="success"
      isVisible={loginSuccess} 
      onClose={handleCloseLoginSuccess}
      title={<View style={{ flexDirection: 'row' }}><Text style={[styles.title,]}>Bravo </Text> <Text style={[styles.title, { color: '#F00' }]}>{username}</Text></View>} 
      customIcon={<MaterialIcons name="cloud-done" size={120} color="#4CAF50" />}
      message={<Text style={{paddingHorizontal: 20, paddingVertical: 10,textAlign: 'center',fontSize: 16}}>Votre application est configurée, à vous d&apos;impacter le monde</Text>} 
      confirmText="OK"
    />
    <LoadingModal 
      isVisible={isLoading}
      message="Connexion en cours..."
      color="#2196F3"
    />
    <AlertModal 
      type="error"
      isVisible={loginError} 
      onClose={handleCloseLoginError}
      title="Connexion echouée" 
      message={errorMessage} 
      confirmText="OK"
    />
    </>
  );
}

export default ScannerScreen;

const styles = StyleSheet.create({
    title: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
