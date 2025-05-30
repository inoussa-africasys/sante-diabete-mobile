import CommunityPage from '@/src/Components/CommunityPage';
import { router } from 'expo-router';
import React from 'react';

const communaute = () => {
  const handleOpenPortal = () => {
    // Navigation vers la page portal de l'application
    router.push('/portal');
  };

  return (
    <CommunityPage onOpenPress={handleOpenPortal} />
  )
}

export default communaute
