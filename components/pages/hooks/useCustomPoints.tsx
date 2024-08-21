import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useMutation } from 'convex/react';
import { useCallback } from 'react';

const useCustomPoints = () => {
  const createCustomPointMutation = useMutation(api.customPoints.createCustomPoint);
  const deleteCustomPointMutation = useMutation(api.customPoints.deleteCustomPoint);
  const editCustomPointMutation = useMutation(api.customPoints.editCustomPoint);

  const addCustomPoints = useCallback((title: string, description: string) => {
    if (!title || !description) {
      return;
    }
    createCustomPointMutation({ title, description });
  }, []);

  const deleteCustomPoint = useCallback((id: Id<'customPoints'>) => {
    deleteCustomPointMutation({ id });
  }, []);

  const editCustomPoint = useCallback((id: Id<'customPoints'>, title: string, description: string) => {
    editCustomPointMutation({ id, title, description });
  }, []);

  return {
    addCustomPoints,
    deleteCustomPoint,
    editCustomPoint,
  };
};

export default useCustomPoints;