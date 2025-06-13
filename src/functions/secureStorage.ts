import * as SecureStore from 'expo-secure-store';

/**
 * Enregistre une donnée dans le Secure Store.
 * @param key La clé d'identification
 * @param value La valeur à enregistrer
 */
export async function saveToSecureStore(key: string, value: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(key, value, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED, // optionnel
    });
  } catch (error) {
    console.error(`Erreur lors de l'enregistrement de ${key} :`, error);
  }
}

/**
 * Récupère une donnée depuis le Secure Store.
 * @param key La clé à rechercher
 * @returns La valeur stockée ou null
 */
export async function getFromSecureStore(key: string): Promise<string | null> {
  try {
    const value = await SecureStore.getItemAsync(key);
    return value;
  } catch (error) {
    console.error(`Erreur lors de la récupération de ${key} :`, error);
    return null;
  }
}

/**
 * Supprime une donnée du Secure Store.
 * @param key La clé à supprimer
 */
export async function deleteFromSecureStore(key: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.error(`Erreur lors de la suppression de ${key} :`, error);
  }
}
