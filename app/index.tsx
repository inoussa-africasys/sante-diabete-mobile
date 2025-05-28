import React from 'react';
import { router } from 'expo-router';
import CommunityPage from '../src/Components/CommunityPage';

export default function Index() {
  // Fonction pour gérer l'ouverture du portail
  const handleOpenPortal = () => {
    // Navigation vers la page portal de l'application
    router.push('/portal');
  };

  return (
    <CommunityPage onOpenPress={handleOpenPortal} />
  );
}
