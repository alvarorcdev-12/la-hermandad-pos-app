import { create } from 'axios';
import { Platform } from 'react-native';
import { SecureStorageAdapter } from '../adapters/secure-storage.adapter';

const STAGE = process.env.EXPO_PUBLIC_STAGE || 'dev';

export const API_URL =
  STAGE === 'prod'
    ? process.env.EXPO_PUBLIC_API_URL
    : Platform.OS === 'ios'
      ? process.env.EXPO_PUBLIC_API_URL_IOS
      : process.env.EXPO_PUBLIC_API_URL_ANDROID;

const laHermandadApi = create({
  baseURL: API_URL,
});

laHermandadApi.interceptors.request.use(async (config) => {
  const token = await SecureStorageAdapter.getItem('token');

  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export { laHermandadApi };
