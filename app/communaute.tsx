import CommunityPage from '@/src/Components/CommunityPage';
import { router } from 'expo-router';
import React from 'react';
import { Linking } from 'react-native';

const communaute = () => {
  const handleOpenCommunauteLink = () => {
    Linking.openURL('https://www.djekulu.org/');
  };

  const handleBackPress = () => {
    router.push('/');
  };

  return (
    <CommunityPage onOpenPress={handleOpenCommunauteLink} onBackPress={handleBackPress} />
  )
}

export default communaute
