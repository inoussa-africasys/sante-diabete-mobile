import { useAuth } from "@/src/context/AuthContext";
import { useDiabetes } from "@/src/context/DiabetesContext";
import { insertQRCode } from "@/src/Services/authenticationService";
import { DiabeteType } from "@/src/types/enums";
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import QRCodeScannerView from '../src/Components/Scanner/QRCodeScannerView';

const ScannerScreen = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const { diabetesType } = useDiabetes();

  const handleScan = async (data: string) => {
    console.log('QR Code scanné login:', data);
    
    const token = await insertQRCode(diabetesType as DiabeteType, data);

    if(token) {
      const loginResult = await login(token);
      if(loginResult) {
        setLoginSuccess(true);
        router.replace(`/${diabetesType.toLowerCase()}`);
      } else {
        setLoginError(true);
        setTimeout(() => {
          setLoginError(false);
        }, 3000);
      }
    }

    router.back();
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <>
    <QRCodeScannerView
      type="user"
      onScan={handleScan}
      onClose={handleClose}
    />
    {loginSuccess && (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Connexion reussie</Text>
      </View>
    )}
    {loginError && (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Connexion echouée</Text>
      </View>
    )}
    </>
  );
}

export default ScannerScreen;
