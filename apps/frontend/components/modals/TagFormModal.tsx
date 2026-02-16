'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useUIStore } from '@/lib/stores/uiStore';
import { useTagStore } from '@/lib/stores/tagStore';
import { useSessionStore } from '@/lib/stores/sessionStore';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Edit, Trash } from 'lucide-react';
import { CreateTagRequest, Tag } from '@/types';

export function TagFormModal() {
  const { tagModalOpen, editingTag, closeTagModal, openConfirmDialog } = useUIStore();
  const { tags, addTag, updateTag, deleteTag, fetchTags } = useTagStore();
  const { language } = useSessionStore();
  const t = useTranslation(language);
  
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateTagRequest>();
  
  useEffect(() => {
    if (tagModalOpen) {
      fetchTags();
    }
  }, [tagModalOpen, fetchTags]);
  
  useEffect(() => {
    if (editingTag) {
      setSelectedTag(editingTag);
      reset({ name: editingTag.name, color: editingTag.color });
    } else {
      setSelectedTag(null);
      reset({ name: '', color: '#3B82F6' });
    }
  }, [editingTag, reset]);
  
  const onSubmit = async (data: CreateTagRequest) => {
    try {
      if (selectedTag) {
        await updateTag(selectedTag.id, data);
      } else {
        await addTag(data);
      }
      setSelectedTag(null);
      reset({ name: '', color: '#3B82F6' });
    } catch (error) {
      console.error('Failed to save tag:', error);
    }
  };
  
  const handleEdit = (tag: Tag) => {
    setSelectedTag(tag);
    reset({ name: tag.name, color: tag.color });
  };
  
  const handleDelete = (tag: Tag) => {
    openConfirmDialog(
      t('deleteTagConfirm'),
      () => deleteTag(tag.id)
    );
  };
  
  if (!tagModalOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={closeTagModal}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tag-modal-title"
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 id="tag-modal-title" className="text-2xl font-bold mb-6">
            {t('manageTags')}
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Tag List */}
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('tags')}</h3>
              {tags.length === 0 ? (
                <p className="text-gray-500 text-center py-8">{t('noTags')}</p>
              ) : (
                <div className="space-y-2">
                  {tags.map((tag) => (
                    <div
                      key={tag.id}
                      className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded"
                          style={{ backgroundColor: tag.color }}
                          aria-label={`${tag.name} color`}
                        />
                        <span>{tag.name}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(tag)}
                          className="text-blue-600 hover:text-blue-800"
                          aria-label={`Edit ${tag.name}`}
                          data-testid={`edit-tag-${tag.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(tag)}
                          className="text-red-600 hover:text-red-800"
                          aria-label={`Delete ${tag.name}`}
                          data-testid={`delete-tag-${tag.id}`}
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Tag Form */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                {selectedTag ? t('edit') : t('createTag')}
              </h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label htmlFor="tagName" className="block text-sm font-medium mb-1">
                    {t('tagName')}
                  </label>
                  <Input
                    id="tagName"
                    data-testid="tag-name-input"
                    {...register('name', { required: 'Tag name is required' })}
                    placeholder={t('tagName')}
                    aria-required="true"
                    aria-invalid={errors.name ? 'true' : 'false'}
                  />
                  {errors.name && (
                    <p className="text-red-600 text-sm mt-1" role="alert">{errors.name.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="tagColor" className="block text-sm font-medium mb-1">
                    {t('tagColor')}
                  </label>
                  <input
                    id="tagColor"
                    type="color"
                    data-testid="tag-color-input"
                    {...register('color', { required: 'Color is required' })}
                    className="w-full h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                    aria-required="true"
                    aria-invalid={errors.color ? 'true' : 'false'}
                  />
                  {errors.color && (
                    <p className="text-red-600 text-sm mt-1" role="alert">{errors.color.message}</p>
                  )}
                </div>
                
                <div className="flex gap-3">
                  {selectedTag && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setSelectedTag(null);
                        reset({ name: '', color: '#3B82F6' });
                      }}
                      className="flex-1"
                      data-testid="tag-cancel-edit-button"
                    >
                      {t('cancel')}
                    </Button>
                  )}
                  <Button
                    type="submit"
                    className="flex-1"
                    data-testid="tag-save-button"
                  >
                    {selectedTag ? t('update') : t('save')}
                  </Button>
                </div>
              </form>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={closeTagModal}
              variant="secondary"
              className="w-full"
              data-testid="tag-close-button"
            >
              {t('confirm')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
