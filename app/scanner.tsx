import { login } from "@/src/Services/authenticationService";
import { DiabeteType } from "@/src/types/enums";
import { useRouter } from 'expo-router';
import React from 'react';
import QRCodeScannerView from '../src/Components/Scanner/QRCodeScannerView';

const ScannerScreen = () => {
  const router = useRouter();

  const handleScan = async (data: string) => {
    console.log('QR Code scanné login:', data);
    
    const loginResult = await login(DiabeteType.DT1, data);
    console.log('Login result:', loginResult);
    if(loginResult) {
      console.log('Login réussi');
        router.replace('/dt1');
    }

    console.log('Login échoué');
    router.back();
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <QRCodeScannerView
      type="user"
      onScan={handleScan}
      onClose={handleClose}
    />
  );
}

export default ScannerScreen;
