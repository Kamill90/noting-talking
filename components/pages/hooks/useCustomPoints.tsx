import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
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

  const deleteCustomPoint = useCallback((id: Id<'customPoints'>) => {
    deleteCustomPointMutation({ id });
  }, []);

  return {
    addCustomPoints,
    deleteCustomPoint,
  };
};

export default useCustomPoints;
