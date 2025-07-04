import QRCodeScannerView from '@/src/Components/Scanner/QRCodeScannerView';
import { useRouter } from 'expo-router';
import React from 'react';

interface PatientScannerProps {
  onScan: (data: string) => void;
}

export default function PatientScanner({ onScan }: PatientScannerProps) {
  const router = useRouter();


  const handleClose = () => {
    router.back();
  };

  return (
    <QRCodeScannerView
      type="patient"
      onScan={onScan}
      onClose={handleClose}
    />
  );
}
