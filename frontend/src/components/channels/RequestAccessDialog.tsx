'use client';

import { useState } from 'react';
import { useRequestAccess } from '@/hooks/useChannels';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPortal } from 'react-dom';

const requestAccessSchema = z.object({
  message: z
    .string()
    .max(500, 'Message must be 500 characters or less')
    .optional(),
});

type RequestAccessForm = z.infer<typeof requestAccessSchema>;

interface RequestAccessDialogProps {
  channelId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function RequestAccessDialog({
  channelId,
  isOpen,
  onClose,
}: RequestAccessDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const requestAccessMutation = useRequestAccess();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RequestAccessForm>({
    resolver: zodResolver(requestAccessSchema),
    defaultValues: {
      message: '',
    },
  });

  const onSubmit = async (data: RequestAccessForm) => {
    setIsSubmitting(true);
    try {
      await requestAccessMutation.mutateAsync({
        channelId,
        message: data.message,
      });
      reset();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
      style={{ margin: 0 }}
    >
      <div
        className="bg-white rounded-2xl p-6 w-full max-w-[40%] max-h-[90vh] overflow-y-auto shadow-2xl border border-[#e1e2e4] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-[#191c1e]">
            Request Access
          </h2>
          <button
            onClick={onClose}
            className="text-[#516070] hover:text-[#191c1e] transition-colors p-1 rounded-lg hover:bg-[#f3f4f6]"
            type="button"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#191c1e] mb-2">
              Message (optional)
            </label>
            <textarea
              {...register('message')}
              className={`w-full px-4 py-3 border ${errors.message ? 'border-[#ba1a1a]' : 'border-[#c3c6d7]'} rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004ac6]/20 resize-none`}
              rows={4}
              placeholder="Why do you need access to this channel?"
            />
            {errors.message && (
              <p className="text-[#ba1a1a] text-xs mt-1">
                {errors.message.message}
              </p>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-[#c3c6d7] rounded-xl text-[#516070] hover:bg-[#f3f4f6] transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 bg-[#004ac6] text-white rounded-xl hover:bg-[#003ea8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm"
            >
              {isSubmitting ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : null;
}
