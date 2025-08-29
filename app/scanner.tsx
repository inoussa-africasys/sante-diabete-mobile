import { AlertModal, AlertModalRich, ConfirmDualModal, LoadingModal } from "@/src/Components/Modal";
import { useAuth } from "@/src/context/AuthContext";
import { useDiabetes } from "@/src/context/DiabetesContext";
import { decodeCleanAndInsertQRCodeOnDB } from "@/src/Services/authenticationService";
import { DiabeteType } from "@/src/types/enums";
import Logger from "@/src/utils/Logger";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import QRCodeScannerView from '../src/Components/Scanner/QRCodeScannerView';
import { isValidURL } from '../src/functions';

const ScannerScreen = () => {
  const router = useRouter();
  const { login, canLogin } = useAuth();
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { diabetesType } = useDiabetes();
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [showCanLoginErrorModal, setShowCanLoginErrorModal] = useState(false);

  const handleScan = async (data: string) => {
    const flowStart = Date.now();
    try {
      setIsLoading(true);
      console.log('📊 [SCAN] Début du scan', { diabetesType });
      Logger.info('SCAN: 📊 Début du scan', { diabetesType });

      // Étape 1: décoder et insérer en DB
      const tDecodeStart = Date.now();
      const { token, url, username } = await decodeCleanAndInsertQRCodeOnDB(diabetesType as DiabeteType, data);
      const decodeDuration = Date.now() - tDecodeStart;
      setUsername(username);
      console.log('📊 [SCAN] Décodage/Insertion terminé', { decodeDurationMs: decodeDuration, hasToken: !!token });
      Logger.info('📊 [SCAN] Décodage/Insertion terminé', { decodeDurationMs: decodeDuration, hasToken: !!token });

      // Étape 2: vérification possibilité de login
      const tCheckStart = Date.now();
      const canLoginResult = await canLogin(url, token);
      const checkDuration = Date.now() - tCheckStart;
      console.log('📊 [SCAN] Vérification canLogin terminée', { checkDurationMs: checkDuration, canLoginResult });
      Logger.info('📊 [SCAN] Vérification canLogin terminée', { checkDurationMs: checkDuration, canLoginResult });

      if (!canLoginResult) {
        setShowCanLoginErrorModal(true);
        console.warn('📊 [SCAN] Connexion impossible (canLogin=false)');
        Logger.warn('📊 [SCAN] Connexion impossible (canLogin=false)');
        return;
      }

      if (token) {
        // Étape 3: validation URL
        const tValidateStart = Date.now();
        const urlOk = isValidURL(url);
        const validateDuration = Date.now() - tValidateStart;
        console.log('📊 [SCAN] Validation URL', { validateDurationMs: validateDuration, urlOk });
        Logger.info('📊 [SCAN] Validation URL', { validateDurationMs: validateDuration, urlOk });

        if (urlOk) {
          // Étape 4: login
          const tLoginStart = Date.now();
          const loginResult = await login({ baseUrl: url, token, diabetesType: diabetesType as DiabeteType, userName: username });
          const loginDuration = Date.now() - tLoginStart;
          console.log('📊 [SCAN] Tentative de connexion terminée', { loginDurationMs: loginDuration, loginResult });
          Logger.info('📊 [SCAN] Tentative de connexion terminée', { loginDurationMs: loginDuration, loginResult });

          if (loginResult) {
            setLoginSuccess(true);
          } else {
            setLoginError(true);
            setErrorMessage('Connexion echouée, les identifiants sont incorrects');
            console.error('📊 [SCAN] Connexion échouée: identifiants incorrects');
            Logger.error('📊 [SCAN] Connexion échouée: identifiants incorrects');
          }
        } else {
          setErrorMessage('URL invalide');
          setLoginError(true);
          console.error('📊 [SCAN] URL invalide');
          Logger.error('📊 [SCAN] URL invalide');
        }
      } else {
        console.warn('📊 [SCAN] Aucun token trouvé après décodage');
        Logger.warn('📊 [SCAN] Aucun token trouvé après décodage');
      }
    } catch (err: any) {
      console.error('📊 [SCAN] Erreur inattendue pendant le scan', err);
      Logger.error('📊 [SCAN] Erreur inattendue pendant le scan', { message: err?.message });
      setErrorMessage('Une erreur est survenue pendant la lecture du QR Code');
      setLoginError(true);
    } finally {
      const totalDuration = Date.now() - flowStart;
      console.log('📊 [SCAN] Fin du flux de scan', { totalDurationMs: totalDuration });
      Logger.info('📊 [SCAN] Fin du flux de scan', { totalDurationMs: totalDuration });
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    router.back();
  };

  const handleCloseLoginSuccess = () => {
    setLoginSuccess(false);
    router.replace(`/${diabetesType.toLowerCase() as "dt1" | "dt2"}`);
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
        message={<Text style={{ paddingHorizontal: 20, paddingVertical: 10, textAlign: 'center', fontSize: 16 }}>Votre application est configurée, à vous d&apos;impacter le monde</Text>}
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

      <ConfirmDualModal
        type="warning"
        isVisible={showCanLoginErrorModal}
        title="Connexion Impossible"
        message={`Ce même QR code est déjà connecté à ${diabetesType === DiabeteType.DT1 ? 'DT2' : 'DT1'} sur ce même appareil. \nVous devez scanner un autre QR Code pour le profil ${diabetesType}`}
        primaryText="OK"
        secondaryText={`Ouvrir ${diabetesType === DiabeteType.DT1 ? 'DT2' : 'DT1'}`}
        onPrimary={() => {
          setShowCanLoginErrorModal(false);
          handleClose();
        } }
        onSecondary={() => {
          setShowCanLoginErrorModal(false);
          router.replace(`/${diabetesType === DiabeteType.DT1 ? 'dt2' : 'dt1'}`);
        } }
        customIcon={<AntDesign name="exclamationcircleo" size={60} color="#FF9800" />}
        onClose={() => {}}
        showCancel={false}
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
