import { useState } from 'react';
import { useCreateChannel } from '@/hooks/useChannels';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const createChannelSchema = z.object({
  name: z.string().min(1, 'Channel name is required').max(50, 'Name must be 50 characters or less'),
  description: z.string().max(200, 'Description must be 200 characters or less').optional(),
  type: z.enum(['public', 'private']).refine((v) => !!v, {
    message: 'Channel type is required'
  }),
  category: z.string().min(1, 'Category is required')
});

type CreateChannelForm = z.infer<typeof createChannelSchema>;

interface CreateChannelDialogProps {
  workspaceId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateChannelDialog({
  workspaceId,
  isOpen,
  onClose
}: CreateChannelDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createChannelMutation = useCreateChannel();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<CreateChannelForm>({
    resolver: zodResolver(createChannelSchema),
    defaultValues: {
      name: '',
      description: '',
      type: 'public',
      category: 'General'
    }
  });

  const onSubmit = async (data: CreateChannelForm) => {
    setIsSubmitting(true);
    try {
      await createChannelMutation.mutateAsync({
        workspaceId,
        data: {
          name: data.name,
          description: data.description || undefined,
          type: data.type as 'public' | 'private',
          category: data.category
        }
      });
      reset();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Create New Channel</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Channel Name
            </label>
            <input
              type="text"
              {...register('name')}
              className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="e.g., dev, marketing, random"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              {...register('description')}
              className={`w-full px-3 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
              rows={3}
              placeholder="What is this channel about?"
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  {...register('type')}
                  value="public"
                  className="text-blue-500 focus:ring-blue-500"
                />
                <span className="text-sm">Public</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  {...register('type')}
                  value="private"
                  className="text-blue-500 focus:ring-blue-500"
                />
                <span className="text-sm">Private</span>
              </label>
            </div>
            {errors.type && (
              <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <input
              type="text"
              {...register('category')}
              className={`w-full px-3 py-2 border ${errors.category ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="e.g., Engineering, Marketing, General"
            />
            {errors.category && (
              <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Channel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
