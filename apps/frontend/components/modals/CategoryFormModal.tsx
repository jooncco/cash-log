'use client';

import { useEffect, useState } from 'react';
import { useCategoryStore } from '@/lib/stores/categoryStore';
import { useUIStore } from '@/lib/stores/uiStore';
import { useSessionStore } from '@/lib/stores/sessionStore';
import { useTranslation } from '@/lib/i18n';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';

const getRandomColor = () => {
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];
  return colors[Math.floor(Math.random() * colors.length)];
};

export function CategoryFormModal() {
  const { addCategory, updateCategory } = useCategoryStore();
  const { categoryModalOpen, closeCategoryModal, editingCategory } = useUIStore();
  const { language } = useSessionStore();
  const t = useTranslation(language);
  const [selectedColor, setSelectedColor] = useState(getRandomColor());
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name);
      setSelectedColor(editingCategory.color);
    } else {
      setName('');
      setSelectedColor(getRandomColor());
    }
    setError('');
  }, [editingCategory, categoryModalOpen]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError(t('categoryNameRequired'));
      return;
    }
    
    try {
      const submitData = { name: name.trim(), color: selectedColor };
      if (editingCategory) {
        await updateCategory(editingCategory.id, submitData);
      } else {
        await addCategory(submitData);
      }
      closeCategoryModal();
      setName('');
      setError('');
    } catch (error) {
      console.error('Failed to save category:', error);
    }
  };
  
  if (!categoryModalOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {editingCategory ? t('editCategory') : t('addCategory')}
          </h2>
          <button
            onClick={closeCategoryModal}
            className="text-gray-500 hover:text-gray-700"
            aria-label={t('cancel')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-3 items-start">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">{t('categoryName')}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                placeholder={t('categoryNamePlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">{t('color')}</label>
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-16 h-10 cursor-pointer border border-gray-300 rounded"
              />
            </div>
          </div>
          
          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="secondary" onClick={closeCategoryModal}>
              {t('cancel')}
            </Button>
            <Button type="submit" className="min-w-[80px]">
              {editingCategory ? t('update') : t('create')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
