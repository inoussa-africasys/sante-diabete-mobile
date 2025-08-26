import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

const PIN_HASH_KEY = 'user-pin-hash';
const SALT = 'sante-diabet.v1'; // simple sel statique pour éviter hash trivial

async function hashPin(pin: string): Promise<string> {
  return await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${SALT}:${pin}`);
}

export async function setPin(pin: string): Promise<void> {
  const hashed = await hashPin(pin);
  await SecureStore.setItemAsync(PIN_HASH_KEY, hashed, {
    keychainService: 'sante-diabet-pin',
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

export async function verifyPin(pin: string): Promise<boolean> {
  const stored = await SecureStore.getItemAsync(PIN_HASH_KEY);
  if (!stored) return false;
  const hashed = await hashPin(pin);
  return stored === hashed;
}

export async function getHasPin(): Promise<boolean> {
  const stored = await SecureStore.getItemAsync(PIN_HASH_KEY);
  return !!stored;
}
