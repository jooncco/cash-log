import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useUIStore } from '../../lib/stores/uiStore';
import { useCategoryStore } from '../../lib/stores/categoryStore';
import { useSessionStore } from '../../lib/stores/sessionStore';
import { useTranslation } from '../../lib/i18n';

interface FormData {
  name: string;
  color: string;
}

export function CategoryFormModal() {
  const { categoryModalOpen, editingCategory, closeCategoryModal } = useUIStore();
  const { addCategory, updateCategory } = useCategoryStore();
  const language = useSessionStore((s) => s.language);
  const t = useTranslation(language);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

  useEffect(() => {
    if (categoryModalOpen) {
      reset(editingCategory ? { name: editingCategory.name, color: editingCategory.color } : { name: '', color: '#3b82f6' });
    }
  }, [categoryModalOpen, editingCategory, reset]);

  const onSubmit = async (data: FormData) => {
    if (editingCategory) {
      await updateCategory(editingCategory.id, data);
    } else {
      await addCategory(data);
    }
    closeCategoryModal();
  };

  return (
    <Modal
      open={categoryModalOpen}
      onClose={closeCategoryModal}
      title={editingCategory ? t('editCategory') : t('addCategory')}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" data-testid="category-form">
        <Input label={t('categoryName')} placeholder={t('categoryNamePlaceholder')}
          error={errors.name?.message}
          {...register('name', { required: t('categoryNameRequired') })} />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('color')}</label>
          <input type="color" {...register('color')} className="h-10 w-20 cursor-pointer rounded border-0" />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" type="button" onClick={closeCategoryModal}>{t('cancel')}</Button>
          <Button type="submit" data-testid="category-submit">{editingCategory ? t('update') : t('save')}</Button>
        </div>
      </form>
    </Modal>
  );
}
