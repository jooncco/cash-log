'use client';

import { useEffect, useState } from 'react';
import { useSessionStore } from '@/lib/stores/sessionStore';
import { useCategoryStore } from '@/lib/stores/categoryStore';
import { useTagStore } from '@/lib/stores/tagStore';
import { useUIStore } from '@/lib/stores/uiStore';
import { useTranslation } from '@/lib/i18n';
import { Sun, Moon, Plus, Edit, Trash } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/types';

export default function SettingsPage() {
  const { theme, language, setTheme, setLanguage } = useSessionStore();
  const { categories, fetchCategories, deleteCategory } = useCategoryStore();
  const { tags, fetchTags, deleteTag } = useTagStore();
  const { openCategoryModal, openConfirmDialog } = useUIStore();
  const t = useTranslation(language);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [showTagForm, setShowTagForm] = useState(false);
  const [tagName, setTagName] = useState('');
  const [tagColor, setTagColor] = useState('#3B82F6');
  const [tagError, setTagError] = useState('');
  
  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, []);
  
  const handleDelete = (id: number, name: string) => {
    openConfirmDialog(
      t('deleteCategoryConfirm'),
      () => deleteCategory(id)
    );
  };
  
  const handleTagDelete = (id: number) => {
    openConfirmDialog(
      t('deleteTagConfirm'),
      () => deleteTag(id)
    );
  };
  
  const handleTagEdit = (tag: Tag) => {
    setEditingTag(tag);
    setTagName(tag.name);
    setTagColor(tag.color);
    setShowTagForm(true);
    setTagError('');
  };
  
  const handleTagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tagName.trim()) {
      setTagError(t('tagRequired'));
      return;
    }
    
    try {
      const { addTag, updateTag } = useTagStore.getState();
      const submitData = { name: tagName.trim(), color: tagColor };
      
      if (editingTag) {
        await updateTag(editingTag.id, submitData);
      } else {
        await addTag(submitData);
      }
      
      setShowTagForm(false);
      setEditingTag(null);
      setTagName('');
      setTagColor('#3B82F6');
      setTagError('');
      fetchTags();
    } catch (error) {
      console.error('Failed to save tag:', error);
    }
  };
  
  const cancelTagForm = () => {
    setShowTagForm(false);
    setEditingTag(null);
    setTagName('');
    setTagColor('#3B82F6');
    setTagError('');
  };
  
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">{t('settings')}</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold">{t('appearance')}</h2>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-3">
              {t('appearance')}
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                  theme === 'light'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                }`}
                data-testid="theme-light-button"
                aria-pressed={theme === 'light'}
              >
                <Sun className="w-5 h-5" />
                <span>Light</span>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                  theme === 'dark'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                }`}
                data-testid="theme-dark-button"
                aria-pressed={theme === 'dark'}
              >
                <Moon className="w-5 h-5" />
                <span>Dark</span>
              </button>
            </div>
          </div>
          
          <div>
            <label htmlFor="language-select" className="block text-sm font-medium mb-3">
              {t('language')}
            </label>
            <select
              id="language-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'ko' | 'en')}
              className="pl-4 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 appearance-none bg-no-repeat bg-right"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundPosition: 'right 0.75rem center',
                backgroundSize: '12px',
              }}
              data-testid="language-select"
            >
              <option value="ko">한국어 (Korean)</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold">{t('categories')}</h2>
          <Button onClick={() => openCategoryModal()} size="sm" className="flex items-center whitespace-nowrap">
            <Plus className="w-4 h-4 mr-1" />
            <span>{t('addCategory')}</span>
          </Button>
        </div>
        
        <div className="p-6">
          {categories.length === 0 ? (
            <p className="text-gray-500 text-center py-8">{t('noCategories')}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openCategoryModal(category)}
                      className="p-1 text-gray-600 hover:text-blue-600"
                      aria-label="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id, category.name)}
                      className="p-1 text-gray-600 hover:text-red-600"
                      aria-label="Delete"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold">{t('tags')}</h2>
          <Button 
            onClick={() => {
              setShowTagForm(true);
              setEditingTag(null);
              setTagName('');
              setTagColor('#3B82F6');
              setTagError('');
            }} 
            size="sm" 
            className="flex items-center whitespace-nowrap"
          >
            <Plus className="w-4 h-4 mr-1" />
            <span>{t('add')}</span>
          </Button>
        </div>
        
        <div className="p-6">
          {showTagForm && (
            <form onSubmit={handleTagSubmit} className="mb-6 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
              <h3 className="text-lg font-semibold mb-4">
                {editingTag ? t('edit') : t('createTag')}
              </h3>
              <div className="flex gap-3 items-start mb-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={tagName}
                    onChange={(e) => {
                      setTagName(e.target.value);
                      setTagError('');
                    }}
                    placeholder={t('tagName')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                  />
                  {tagError && <p className="text-red-500 text-sm mt-1">{tagError}</p>}
                </div>
                <input
                  type="color"
                  value={tagColor}
                  onChange={(e) => setTagColor(e.target.value)}
                  className="w-16 h-10 cursor-pointer border border-gray-300 rounded"
                />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={cancelTagForm} size="sm">
                  {t('cancel')}
                </Button>
                <Button type="submit" size="sm">
                  {editingTag ? t('update') : t('create')}
                </Button>
              </div>
            </form>
          )}
          
          {tags.length === 0 ? (
            <p className="text-gray-500 text-center py-8">{t('noTags')}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium"
                  style={{ backgroundColor: tag.color + '20', color: tag.color, border: `1px solid ${tag.color}40` }}
                >
                  <span>{tag.name}</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleTagEdit(tag)}
                      className="hover:opacity-70"
                      aria-label="Edit"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleTagDelete(tag.id)}
                      className="hover:opacity-70"
                      aria-label="Delete"
                    >
                      <Trash className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
