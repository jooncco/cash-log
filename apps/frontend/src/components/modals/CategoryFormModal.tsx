import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useUIStore } from '../../lib/stores/uiStore';
import { useCreateCategory, useUpdateCategory } from '../../lib/queries/categories';
import { useSessionStore } from '../../lib/stores/sessionStore';
import { useTranslation } from '../../lib/i18n';

interface FormData {
  name: string;
  color: string;
}

export function CategoryFormModal() {
  const { categoryModalOpen, editingCategory, closeCategoryModal } = useUIStore();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const language = useSessionStore((s) => s.language);
  const t = useTranslation(language);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormData>();
  const currentColor = watch('color') ?? '#3b82f6';

  useEffect(() => {
    if (categoryModalOpen) {
      reset(editingCategory ? { name: editingCategory.name, color: editingCategory.color } : { name: '', color: '#3b82f6' });
    }
  }, [categoryModalOpen, editingCategory, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({ id: editingCategory.id, data });
      } else {
        await createCategory.mutateAsync(data);
      }
      closeCategoryModal();
    } catch {
      // Failure is already surfaced via the toast wired in the mutation's onError;
      // keep the modal open so the user can retry.
    }
  };

  return (
    <Modal
      open={categoryModalOpen}
      onClose={closeCategoryModal}
      title={editingCategory ? t('editCategory') : t('addCategory')}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" data-testid="category-form">
        <Input label={t('categoryName')} placeholder={t('categoryNamePlaceholder')}
          error={errors.name?.message}
          {...register('name', { required: t('categoryNameRequired') })} />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('color')}</label>
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-gray-300 shadow-sm dark:border-gray-600">
              <input
                type="color"
                {...register('color')}
                className="absolute -inset-1 h-12 w-12 cursor-pointer border-0"
              />
            </div>
            <div className="flex items-center gap-2">
              <span
                className="h-6 w-6 rounded-full ring-2 ring-white shadow-sm dark:ring-gray-800"
                style={{ backgroundColor: currentColor }}
              />
              <span className="text-sm text-gray-500 dark:text-gray-400">{currentColor}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-200 pt-4 dark:border-gray-700">
          <Button variant="secondary" type="button" onClick={closeCategoryModal}>{t('cancel')}</Button>
          <Button type="submit" data-testid="category-submit">{editingCategory ? t('update') : t('save')}</Button>
        </div>
      </form>
    </Modal>
  );
}
