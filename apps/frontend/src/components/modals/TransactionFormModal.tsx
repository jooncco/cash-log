import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { useUIStore } from '../../lib/stores/uiStore';
import { useCreateTransaction, useUpdateTransaction } from '../../lib/queries/transactions';
import { useCategories } from '../../lib/queries/categories';
import { useTags } from '../../lib/queries/tags';
import { useSessionStore } from '../../lib/stores/sessionStore';
import { useTranslation } from '../../lib/i18n';
import type { CreateTransactionRequest } from '../../types';

interface FormData {
  transactionDate: string;
  transactionType: 'INCOME' | 'EXPENSE';
  originalAmount: number;
  originalCurrency: string;
  conversionRate?: number;
  categoryId: number;
  memo: string;
  fixedCost: boolean;
}

const selectClassName =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition-all duration-150 ease-smooth focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-brand-400';

export function TransactionFormModal() {
  const { transactionModalOpen, editingTransaction, closeTransactionModal } = useUIStore();
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();
  const { data: categories = [] } = useCategories();
  const { data: tags = [] } = useTags();
  const language = useSessionStore((s) => s.language);
  const t = useTranslation(language);

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isComposing, setIsComposing] = useState(false);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormData>();
  const originalCurrency = watch('originalCurrency');
  const isForeignCurrency = Boolean(originalCurrency) && originalCurrency !== 'KRW';
  // "고정비" describes money going out, so the flag is only offered on expenses.
  const isExpense = watch('transactionType') !== 'INCOME';

  useEffect(() => {
    if (!isExpense) setValue('fixedCost', false);
  }, [isExpense, setValue]);

  useEffect(() => {
    if (transactionModalOpen) {
      if (editingTransaction) {
        reset({
          transactionDate: editingTransaction.transactionDate,
          transactionType: editingTransaction.transactionType,
          originalAmount: editingTransaction.originalAmount,
          originalCurrency: editingTransaction.originalCurrency,
          conversionRate: editingTransaction.conversionRate,
          categoryId: editingTransaction.category?.id,
          memo: editingTransaction.memo ?? '',
          fixedCost: editingTransaction.fixedCost ?? false,
        });
        setSelectedTags(editingTransaction.tags.map((tag) => tag.name));
      } else {
        reset({ transactionDate: '', transactionType: 'EXPENSE', originalAmount: 0, originalCurrency: 'KRW', conversionRate: undefined, categoryId: 0, memo: '', fixedCost: false });
        setSelectedTags([]);
      }
    }
  }, [transactionModalOpen, editingTransaction, reset]);

  const onSubmit = async (data: FormData) => {
    const req: CreateTransactionRequest = {
      ...data,
      originalAmount: Number(data.originalAmount),
      categoryId: Number(data.categoryId),
      conversionRate: data.originalCurrency === 'KRW' ? undefined : Number(data.conversionRate),
      fixedCost: data.transactionType === 'EXPENSE' && Boolean(data.fixedCost),
      tagNames: selectedTags,
    };
    try {
      if (editingTransaction) {
        await updateTransaction.mutateAsync({ id: editingTransaction.id, data: req });
      } else {
        await createTransaction.mutateAsync(req);
      }
      closeTransactionModal();
    } catch {
      // Failure is already surfaced via the toast wired in the mutation's onError;
      // keep the modal open so the user can retry.
    }
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
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" data-testid="transaction-form">
        <Input type="date" label={t('date')} error={errors.transactionDate?.message}
          {...register('transactionDate', { required: t('dateRequired') })} />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('type')}</label>
          <select {...register('transactionType', { required: t('typeRequired') })}
            className={selectClassName}
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
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('currency')}</label>
            <select {...register('originalCurrency')}
              className={selectClassName}>
              <option value="KRW">KRW</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="JPY">JPY</option>
            </select>
          </div>
        </div>

        {isForeignCurrency && (
          <Input type="number" step="0.0001" min="0.01"
            label={`${t('conversionRate')} (1 ${originalCurrency} = ? KRW)`}
            error={errors.conversionRate?.message}
            data-testid="tx-conversion-rate"
            {...register('conversionRate', {
              required: t('conversionRateRequired'),
              min: { value: 0.01, message: t('conversionRateRequired') },
            })} />
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('category')}</label>
          <select {...register('categoryId', { required: t('categoryRequired') })}
            className={selectClassName}
            data-testid="tx-category-select">
            <option value="">{t('selectCategory')}</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {errors.categoryId && <span className="text-xs text-red-500">{errors.categoryId.message}</span>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('tags')}</label>
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {selectedTags.map((name) => (
                <Badge key={name} label={name} onRemove={() => setSelectedTags(selectedTags.filter((n) => n !== name))} />
              ))}
            </div>
          )}
          <input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            placeholder={t('tagPlaceholder')}
            className={selectClassName}
            data-testid="tx-tag-input" />
          {tagInput && suggestions.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1.5">
              {suggestions.slice(0, 5).map((tag) => (
                <button key={tag.id} type="button"
                  onClick={() => { setSelectedTags([...selectedTags, tag.name]); setTagInput(''); }}
                  className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs font-medium text-gray-700 transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-brand-800 dark:hover:bg-brand-900/20 dark:hover:text-brand-300">
                  {tag.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <Input label={t('memoOptional')} {...register('memo')} data-testid="tx-memo" />

        <div className="flex items-center justify-between gap-3 border-t border-gray-200 pt-4 mt-1 dark:border-gray-700">
          <label
            className={`inline-flex items-center gap-2 text-sm font-medium ${
              isExpense
                ? 'cursor-pointer text-gray-700 dark:text-gray-300'
                : 'cursor-not-allowed text-gray-400 dark:text-gray-600'
            }`}
            title={isExpense ? undefined : t('fixedCostExpenseOnly')}
          >
            <input
              type="checkbox"
              disabled={!isExpense}
              className="h-4 w-4 rounded border-gray-300 accent-brand-600 outline-none transition-all duration-150 ease-smooth focus:ring-2 focus:ring-brand-500/30 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800"
              data-testid="tx-fixed-cost"
              {...register('fixedCost')}
            />
            {t('fixedCost')}
          </label>
          <div className="flex gap-2">
            <Button variant="secondary" type="button" onClick={closeTransactionModal}>{t('cancel')}</Button>
            <Button type="submit" data-testid="tx-submit">{editingTransaction ? t('update') : t('save')}</Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
