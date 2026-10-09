import { apiClient } from './apiClient';

export const uploadApi = {
  uploadProductImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<{ success: boolean; url: string }>(
      '/api/upload/product-image',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.url;
  },

  uploadVariantImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<{ success: boolean; url: string }>(
      '/api/upload/variant-image',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.url;
  },

  uploadShopLogo: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<{ success: boolean; url: string }>(
      '/api/upload/shop-logo',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.url;
  },
};
