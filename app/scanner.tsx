import React from 'react';
import { useRouter } from 'expo-router';
import QRCodeScannerView from '../src/Components/Scanner/QRCodeScannerView';

export default function ScannerScreen() {
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
      onScan={handleScan}
      onClose={handleClose}
    />
  );
}
