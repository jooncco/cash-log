import { useEffect, useState } from 'react';
import { Sun, Moon, Plus, Edit, Trash2 } from 'lucide-react';
import { useSessionStore } from '../lib/stores/sessionStore';
import { useCategoryStore } from '../lib/stores/categoryStore';
import { useTagStore } from '../lib/stores/tagStore';
import { useUIStore } from '../lib/stores/uiStore';
import { useTranslation } from '../lib/i18n';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export default function SettingsPage() {
  const { theme, setTheme, language, setLanguage } = useSessionStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { tags, fetchTags, addTag, removeTag } = useTagStore();
  const { openCategoryModal, openConfirmDialog } = useUIStore();
  const t = useTranslation(language);

  const [tagName, setTagName] = useState('');
  const [tagColor, setTagColor] = useState('#6b7280');

  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, [fetchCategories, fetchTags]);

  const handleAddTag = async () => {
    if (!tagName.trim()) return;
    await addTag({ name: tagName.trim(), color: tagColor });
    setTagName('');
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6" data-testid="settings-page">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('settings')}</h2>

      <Card>
        <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">{t('appearance')}</h3>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">{t('theme')}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setTheme('light')}
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm ${theme === 'light' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300'}`}
              data-testid="theme-light"
            >
              <Sun size={16} /> Light
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm ${theme === 'dark' ? 'bg-blue-900 text-blue-300' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300'}`}
              data-testid="theme-dark"
            >
              <Moon size={16} /> Dark
            </button>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">{t('language')}</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'ko' | 'en')}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            data-testid="settings-language"
          >
            <option value="ko">한국어</option>
            <option value="en">English</option>
          </select>
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">{t('categories')}</h3>
          <Button onClick={() => openCategoryModal()} data-testid="add-category-btn">
            <Plus size={16} className="mr-1 inline" /> {t('add')}
          </Button>
        </div>
        {categories.length === 0 ? (
          <p className="text-sm text-gray-500">{t('noCategories')}</p>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-sm text-gray-900 dark:text-white">{cat.name}</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openCategoryModal(cat)} className="text-gray-400 hover:text-blue-600" data-testid={`edit-cat-${cat.id}`}><Edit size={14} /></button>
                  <button onClick={() => openConfirmDialog(t('deleteCategoryConfirm'), () => useCategoryStore.getState().removeCategory(cat.id))}
                    className="text-gray-400 hover:text-red-600" data-testid={`delete-cat-${cat.id}`}><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">{t('manageTags')}</h3>
        <div className="mb-3 flex items-center gap-2">
          <input
            value={tagName}
            onChange={(e) => setTagName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
            placeholder={t('tagName')}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            data-testid="tag-name-input"
          />
          <input type="color" value={tagColor} onChange={(e) => setTagColor(e.target.value)} className="h-8 w-8 cursor-pointer rounded" />
          <Button onClick={handleAddTag} data-testid="add-tag-btn">{t('add')}</Button>
        </div>
        {tags.length === 0 ? (
          <p className="text-sm text-gray-500">{t('noTags')}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <div key={tag.id} className="flex items-center gap-1">
                <Badge label={tag.name} color={tag.color} />
                <button
                  onClick={() => openConfirmDialog(t('deleteTagConfirm'), () => removeTag(tag.id))}
                  className="text-gray-400 hover:text-red-600"
                  data-testid={`delete-tag-${tag.id}`}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
