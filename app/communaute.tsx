import CommunityPage from '@/src/Components/CommunityPage';
import { router } from 'expo-router';
import React from 'react';

const communaute = () => {
  const handleOpenPortal = () => {
    // Navigation vers la page portal de l'application
    router.push('/portal');
  };

  const handleBackPress = () => {
    // Navigation vers la page d'accueil de l'application
    router.push('/');
  };

  return (
    <CommunityPage onOpenPress={handleOpenPortal} onBackPress={handleBackPress} />
  )
}

export default communaute
