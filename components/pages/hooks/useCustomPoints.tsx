import { api } from '@/convex/_generated/api';
import { useMutation } from 'convex/react';
import { useCallback } from 'react';

const useCustomPoints = () => {
  const createCustomPointMutation = useMutation(api.customPoints.createCustomPoint);
  const deleteCustomPointMutation = useMutation(api.customPoints.deleteCustomPoint);

  const addCustomPoints = useCallback((title: string, description: string) => {
    if (!title || !description) {
      return;
    }
    createCustomPointMutation({ title, description });
  }, []);

  const deleteCustomPoint = useCallback((id: any) => {
    deleteCustomPointMutation({ id });
  }, []);

  return {
    addCustomPoints,
    deleteCustomPoint,
  };
};

export default useCustomPoints;
