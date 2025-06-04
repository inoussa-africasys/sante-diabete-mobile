import QRCodeScannerView from '@/src/Components/Scanner/QRCodeScannerView';
import { useRouter } from 'expo-router';
import React from 'react';


export default function PatientScanner() {
  const router = useRouter();

  const handleScan = (data: string) => {
    console.log('QR Code scanné:', data);
    // Ici on peut ajouter la logique pour traiter le QR code
    router.back();
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <QRCodeScannerView
      type="patient"
      onScan={handleScan}
      onClose={handleClose}
    />
  );
}
