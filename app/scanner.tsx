import { AlertModal, LoadingModal } from "@/src/Components/Modal";
import { useAuth } from "@/src/context/AuthContext";
import { useDiabetes } from "@/src/context/DiabetesContext";
import { decodeCleanAndInsertQRCodeOnDB } from "@/src/Services/authenticationService";
import { DiabeteType } from "@/src/types/enums";
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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
    console.log('Scanning QR Code:', data);
    const {token, url,username} = await decodeCleanAndInsertQRCodeOnDB(diabetesType as DiabeteType, data);
    console.log('Scanning QR Code:', token, url, username);
    setUsername(username);
    if(token) {
      if(isValidURL(url)) {
        
        const loginResult = await login({baseUrl: url, token, diabetesType: diabetesType as DiabeteType});
        console.log('Login Result:', loginResult);
        if(loginResult) {
          setLoginSuccess(true);
          } else {
          setLoginError(true);
          setErrorMessage('Connexion echouée, les identifiants sont incorrects');
        }
      } else {
        setErrorMessage('URL invalide');
        setLoginError(true);
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
    <AlertModal 
      type="success"
      isVisible={loginSuccess} 
      onClose={handleCloseLoginSuccess}
      title="Connexion reussie" 
      message={"Connexion reussie avec l'utilisateur : " + username} 
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
