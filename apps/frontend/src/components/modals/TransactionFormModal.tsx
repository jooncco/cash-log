import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { useUIStore } from '../../lib/stores/uiStore';
import { useTransactionStore } from '../../lib/stores/transactionStore';
import { useCategoryStore } from '../../lib/stores/categoryStore';
import { useTagStore } from '../../lib/stores/tagStore';
import { useSessionStore } from '../../lib/stores/sessionStore';
import { useTranslation } from '../../lib/i18n';
import type { CreateTransactionRequest } from '../../types';

interface FormData {
  transactionDate: string;
  transactionType: 'INCOME' | 'EXPENSE';
  originalAmount: number;
  originalCurrency: string;
  categoryId: number;
  memo: string;
}

export function TransactionFormModal() {
  const { transactionModalOpen, editingTransaction, closeTransactionModal } = useUIStore();
  const { addTransaction, updateTransaction } = useTransactionStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { tags, fetchTags } = useTagStore();
  const language = useSessionStore((s) => s.language);
  const t = useTranslation(language);

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isComposing, setIsComposing] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

  useEffect(() => {
    if (transactionModalOpen) {
      fetchCategories();
      fetchTags();
      if (editingTransaction) {
        reset({
          transactionDate: editingTransaction.transactionDate,
          transactionType: editingTransaction.transactionType,
          originalAmount: editingTransaction.originalAmount,
          originalCurrency: editingTransaction.originalCurrency,
          categoryId: editingTransaction.category?.id,
          memo: editingTransaction.memo ?? '',
        });
        setSelectedTags(editingTransaction.tags.map((tag) => tag.name));
      } else {
        reset({ transactionDate: '', transactionType: 'EXPENSE', originalAmount: 0, originalCurrency: 'KRW', categoryId: 0, memo: '' });
        setSelectedTags([]);
      }
    }
  }, [transactionModalOpen, editingTransaction, reset, fetchCategories, fetchTags]);

  const onSubmit = async (data: FormData) => {
    const req: CreateTransactionRequest = {
      ...data,
      originalAmount: Number(data.originalAmount),
      categoryId: Number(data.categoryId),
      tagNames: selectedTags,
    };
    if (editingTransaction) {
      await updateTransaction(editingTransaction.id, req);
    } else {
      await addTransaction(req);
    }
    closeTransactionModal();
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (isComposing) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      const v = tagInput.trim();
      if (v && !selectedTags.includes(v)) setSelectedTags([...selectedTags, v]);
      setTagInput('');
    }
  };

  const suggestions = tags.filter((tag) => tag.name.includes(tagInput) && !selectedTags.includes(tag.name));

  return (
    <Modal
      open={transactionModalOpen}
      onClose={closeTransactionModal}
      title={editingTransaction ? t('editTransaction') : t('addTransaction')}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" data-testid="transaction-form">
        <Input type="date" label={t('date')} error={errors.transactionDate?.message}
          {...register('transactionDate', { required: t('dateRequired') })} />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('type')}</label>
          <select {...register('transactionType', { required: t('typeRequired') })}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            data-testid="tx-type-select">
            <option value="EXPENSE">{t('expense')}</option>
            <option value="INCOME">{t('income')}</option>
          </select>
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <Input type="number" label={t('amount')} step="0.01" min="0"
              error={errors.originalAmount?.message}
              {...register('originalAmount', { required: t('amountRequired'), min: 0 })} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('currency')}</label>
            <select {...register('originalCurrency')}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white">
              <option value="KRW">KRW</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="JPY">JPY</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('category')}</label>
          <select {...register('categoryId', { required: t('categoryRequired') })}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            data-testid="tx-category-select">
            <option value="">{t('selectCategory')}</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {errors.categoryId && <span className="text-xs text-red-500">{errors.categoryId.message}</span>}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('tags')}</label>
          <div className="flex flex-wrap gap-1 mb-1">
            {selectedTags.map((name) => (
              <Badge key={name} label={name} onRemove={() => setSelectedTags(selectedTags.filter((n) => n !== name))} />
            ))}
          </div>
          <input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            placeholder={t('tagPlaceholder')}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            data-testid="tx-tag-input" />
          {tagInput && suggestions.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {suggestions.slice(0, 5).map((tag) => (
                <button key={tag.id} type="button"
                  onClick={() => { setSelectedTags([...selectedTags, tag.name]); setTagInput(''); }}
                  className="rounded-full bg-gray-100 px-2 py-0.5 text-xs hover:bg-gray-200 dark:bg-gray-700">
                  {tag.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <Input label={t('memoOptional')} {...register('memo')} data-testid="tx-memo" />

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" type="button" onClick={closeTransactionModal}>{t('cancel')}</Button>
          <Button type="submit" data-testid="tx-submit">{editingTransaction ? t('update') : t('save')}</Button>
        </div>
      </form>
    </Modal>
  );
}
