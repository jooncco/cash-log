'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTransactionStore } from '@/lib/stores/transactionStore';
import { useTagStore } from '@/lib/stores/tagStore';
import { useCategoryStore } from '@/lib/stores/categoryStore';
import { useSessionStore } from '@/lib/stores/sessionStore';
import { useTranslation } from '@/lib/i18n';
import { useUIStore } from '@/lib/stores/uiStore';
import { CreateTransactionRequest } from '@/types';
import { Button } from '../ui/Button';
import { X } from 'lucide-react';

export function TransactionFormModal() {
  const { transactionModalOpen, editingTransaction, closeTransactionModal } = useUIStore();
  const { addTransaction, updateTransaction } = useTransactionStore();
  const { tags, fetchTags, addTag } = useTagStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { language } = useSessionStore();
  const t = useTranslation(language);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredTags, setFilteredTags] = useState<typeof tags>([]);
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CreateTransactionRequest>({
    defaultValues: {
      transactionDate: new Date().toISOString().split('T')[0],
      transactionType: 'EXPENSE',
      originalCurrency: 'KRW',
      tagNames: [],
    },
  });
  
  useEffect(() => {
    fetchTags();
    fetchCategories();
  }, []);
  
  useEffect(() => {
    if (editingTransaction) {
      const tagNames = editingTransaction.tags.map(t => t.name);
      setSelectedTags(tagNames);
      reset({
        transactionDate: editingTransaction.transactionDate,
        originalAmount: editingTransaction.originalAmount,
        transactionType: editingTransaction.transactionType,
        originalCurrency: editingTransaction.originalCurrency,
        categoryId: editingTransaction.category?.id,
        memo: editingTransaction.memo,
        tagNames: tagNames,
      });
    } else {
      setSelectedTags([]);
    }
  }, [editingTransaction, reset]);
  
  useEffect(() => {
    if (tagInput.trim()) {
      const filtered = (tags || []).filter(tag => 
        tag.name.toLowerCase().includes(tagInput.toLowerCase()) &&
        !selectedTags.includes(tag.name)
      );
      setFilteredTags(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [tagInput, tags, selectedTags]);

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isComposing) {
      e.preventDefault();
      const trimmedTag = tagInput.trim();
      if (trimmedTag && !selectedTags.includes(trimmedTag)) {
        setSelectedTags([...selectedTags, trimmedTag]);
      }
      setTagInput('');
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (tagName: string) => {
    if (!selectedTags.includes(tagName)) {
      setSelectedTags([...selectedTags, tagName]);
    }
    setTagInput('');
    setShowSuggestions(false);
  };
  
  const removeTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };
  
  const getRandomColor = () => {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  
  const onSubmit = async (data: CreateTransactionRequest) => {
    try {
      const submitData = { ...data, tagNames: selectedTags };
      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, submitData);
      } else {
        await addTransaction(submitData);
      }
      closeTransactionModal();
      reset();
      setSelectedTags([]);
      setTagInput('');
    } catch (error) {
      console.error('Failed to save transaction:', error);
    }
  };
  
  if (!transactionModalOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {editingTransaction ? t('editTransaction') : t('addTransaction')}
          </h2>
          <button
            onClick={closeTransactionModal}
            className="text-gray-500 hover:text-gray-700"
            aria-label={t('cancel')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('date')}</label>
            <input
              type="date"
              {...register('transactionDate', { required: t('dateRequired') })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
            />
            {errors.transactionDate && <p className="text-red-500 text-sm mt-1">{errors.transactionDate.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">{t('type')}</label>
            <select
              {...register('transactionType', { required: t('typeRequired') })}
              className="w-full pl-3 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 appearance-none bg-no-repeat bg-right"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundSize: '12px',
              }}
            >
              <option value="INCOME">{t('income')}</option>
              <option value="EXPENSE">{t('expense')}</option>
            </select>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">{t('amount')}</label>
              <input
                type="number"
                {...register('originalAmount', { required: t('amountRequired'), min: 0 })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
              />
              {errors.originalAmount && <p className="text-red-500 text-sm mt-1">{errors.originalAmount.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('currency')}</label>
              <select
                {...register('originalCurrency')}
                className="w-full pl-3 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 appearance-none bg-no-repeat bg-right"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundSize: '12px',
                }}
              >
                <option value="KRW">₩ KRW</option>
                <option value="USD">$ USD</option>
                <option value="EUR">€ EUR</option>
                <option value="JPY">¥ JPY</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">{t('category')}</label>
            <select
              {...register('categoryId', { 
                required: t('categoryRequired'),
                valueAsNumber: true 
              })}
              className="w-full pl-3 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 appearance-none bg-no-repeat bg-right"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundSize: '12px',
              }}
            >
              <option value="">{t('selectCategory')}</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">{t('tags')}</label>
            <div className="relative">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onCompositionStart={() => setIsComposing(true)}
                onCompositionEnd={() => setIsComposing(false)}
                onKeyDown={handleTagInputKeyDown}
                placeholder={t('tagPlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
              />
              {showSuggestions && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-lg max-h-40 overflow-y-auto">
                  {filteredTags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => selectSuggestion(tag.name)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2"
                    >
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span>{tag.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedTags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 hover:text-blue-600 dark:hover:text-blue-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">{t('memoOptional')}</label>
            <textarea
              {...register('memo')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={closeTransactionModal}>
              {t('cancel')}
            </Button>
            <Button type="submit">
              {editingTransaction ? t('update') : t('add')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
