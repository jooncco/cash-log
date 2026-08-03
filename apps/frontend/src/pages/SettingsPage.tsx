import { useState } from 'react';
import { Sun, Moon, Plus, Edit, Trash2, Palette, Globe, Layers, Tag } from 'lucide-react';
import { useSessionStore } from '../lib/stores/sessionStore';
import { useCategories, useDeleteCategory } from '../lib/queries/categories';
import { useTags, useCreateTag, useDeleteTag } from '../lib/queries/tags';
import { useUIStore } from '../lib/stores/uiStore';
import { useTranslation } from '../lib/i18n';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';

export default function SettingsPage() {
  const { theme, setTheme, language, setLanguage } = useSessionStore();
  const { data: categories = [] } = useCategories();
  const deleteCategory = useDeleteCategory();
  const { data: tags = [] } = useTags();
  const createTag = useCreateTag();
  const deleteTag = useDeleteTag();
  const { openCategoryModal, openConfirmDialog } = useUIStore();
  const t = useTranslation(language);

  const [tagName, setTagName] = useState('');
  const [tagColor, setTagColor] = useState('#6b7280');

  const handleAddTag = async () => {
    if (!tagName.trim()) return;
    try {
      await createTag.mutateAsync({ name: tagName.trim(), color: tagColor });
      setTagName('');
    } catch {
      // Failure is already surfaced via the toast wired in the mutation's onError.
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6" data-testid="settings-page">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('settings')}</h2>

      {/* Appearance */}
      <Card>
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <Palette size={18} className="text-brand-600 dark:text-brand-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">{t('appearance')}</h3>
          </div>

          {/* Theme segmented control */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">{t('theme')}</span>
            <div className="inline-flex rounded-lg border border-gray-200 p-1 dark:border-gray-700">
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  theme === 'light'
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
                }`}
                data-testid="theme-light"
              >
                <Sun size={16} /> Light
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
                }`}
                data-testid="theme-dark"
              >
                <Moon size={16} /> Dark
              </button>
            </div>
          </div>

          {/* Language */}
          <div className="flex items-center gap-4">
            <Globe size={16} className="text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">{t('language')}</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'ko' | 'en')}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm outline-none transition-all duration-150 ease-smooth focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-brand-400"
              data-testid="settings-language"
            >
              <option value="ko">한국어</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Categories */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers size={18} className="text-brand-600 dark:text-brand-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">{t('categories')}</h3>
            </div>
            <Button size="sm" onClick={() => openCategoryModal()} data-testid="add-category-btn">
              <Plus size={16} /> {t('add')}
            </Button>
          </div>
          {categories.length === 0 ? (
            <p className="text-sm text-gray-500">{t('noCategories')}</p>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="group flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2.5 transition-colors hover:border-brand-200 hover:bg-brand-50/50 dark:border-gray-700 dark:hover:border-brand-800 dark:hover:bg-brand-900/10"
                >
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full ring-2 ring-white shadow-sm dark:ring-gray-900" style={{ backgroundColor: cat.color }} />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{cat.name}</span>
                  </div>
                  <div className="flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => openCategoryModal(cat)}
                      className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-brand-600 dark:hover:bg-gray-800 dark:hover:text-brand-400"
                      data-testid={`edit-cat-${cat.id}`}
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => openConfirmDialog(t('deleteCategoryConfirm'), () => deleteCategory.mutate(cat.id))}
                      className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                      data-testid={`delete-cat-${cat.id}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Tags */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Tag size={18} className="text-brand-600 dark:text-brand-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">{t('manageTags')}</h3>
          </div>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Input
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder={t('tagName')}
                data-testid="tag-name-input"
              />
            </div>
            <div className="h-[38px] w-[38px] shrink-0 overflow-hidden rounded-lg border border-gray-300 dark:border-gray-600">
              <input
                type="color"
                value={tagColor}
                onChange={(e) => setTagColor(e.target.value)}
                className="h-10 w-10 -translate-x-0.5 -translate-y-0.5 scale-125 cursor-pointer border-0"
              />
            </div>
            <Button size="sm" onClick={handleAddTag} data-testid="add-tag-btn">
              <Plus size={16} /> {t('add')}
            </Button>
          </div>
          {tags.length === 0 ? (
            <p className="text-sm text-gray-500">{t('noTags')}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <div key={tag.id} className="group flex items-center gap-1">
                  <Badge label={tag.name} color={tag.color} />
                  <button
                    onClick={() => openConfirmDialog(t('deleteTagConfirm'), () => deleteTag.mutate(tag.id))}
                    className="rounded-md p-1 text-gray-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                    data-testid={`delete-tag-${tag.id}`}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
