import { useState } from 'react';

export const useQRCodeScanner = () => {
  const [showQRScanner, setShowQRScanner] = useState(false);

  const handleQRCodeScan = (data: string) => {
    setShowQRScanner(false);
    return data;
  };

  const openScanner = () => {
    setShowQRScanner(true);
  };

  const closeScanner = () => {
    setShowQRScanner(false);
  };

  return {
    showQRScanner,
    handleQRCodeScan,
    openScanner,
    closeScanner
  };
};
