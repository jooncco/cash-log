import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { TagInput } from '../ui/TagInput';
import { TypeToggle } from '../ui/TypeToggle';
import { FieldError, FieldLabel } from '../ui/field';
import { fieldShellClassName } from '../ui/fieldStyles';
import { useUIStore } from '../../lib/stores/uiStore';
import { useCreateTransaction, useUpdateTransaction } from '../../lib/queries/transactions';
import { useCategories } from '../../lib/queries/categories';
import { useTags } from '../../lib/queries/tags';
import { useSessionStore } from '../../lib/stores/sessionStore';
import { useTranslation } from '../../lib/i18n';
import { formatFullKrw } from '../../lib/format';
import type { CreateTransactionRequest } from '../../types';

interface FormData {
  transactionDate: string;
  transactionType: 'INCOME' | 'EXPENSE';
  originalAmount: number;
  originalCurrency: string;
  conversionRate?: number;
  /** Kept as a string so the empty placeholder option can round-trip. */
  categoryId: string;
  memo: string;
  fixedCost: boolean;
}

const FORM_ID = 'transaction-form';

const emptyForm = (): FormData => ({
  // Most entries are for today, so pre-fill it instead of demanding a pick.
  transactionDate: format(new Date(), 'yyyy-MM-dd'),
  transactionType: 'EXPENSE',
  originalAmount: 0,
  originalCurrency: 'KRW',
  conversionRate: undefined,
  categoryId: '',
  memo: '',
  fixedCost: false,
});

export function TransactionFormModal() {
  const { transactionModalOpen, editingTransaction, closeTransactionModal } = useUIStore();
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();
  const { data: categories = [] } = useCategories();
  const { data: tags = [] } = useTags();
  const language = useSessionStore((s) => s.language);
  const t = useTranslation(language);

  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormData>({
    defaultValues: emptyForm(),
  });
  const originalCurrency = watch('originalCurrency');
  const isForeignCurrency = Boolean(originalCurrency) && originalCurrency !== 'KRW';
  const transactionType = watch('transactionType');
  // "고정비" describes money going out, so the flag is only offered on expenses.
  const isExpense = transactionType !== 'INCOME';
  const isSaving = createTransaction.isPending || updateTransaction.isPending;

  // Echo the entered figure back with separators — and in KRW for foreign
  // currency — so a mistyped digit or exchange rate is obvious immediately.
  const amountValue = Number(watch('originalAmount'));
  const rateValue = Number(watch('conversionRate'));
  const hasAmount = Number.isFinite(amountValue) && amountValue > 0;
  const amountPreview = !hasAmount
    ? null
    : isForeignCurrency
      ? rateValue > 0
        ? `≈ ${formatFullKrw(Math.round(amountValue * rateValue))}`
        : null
      : formatFullKrw(amountValue);

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
          categoryId: editingTransaction.category ? String(editingTransaction.category.id) : '',
          memo: editingTransaction.memo ?? '',
          fixedCost: editingTransaction.fixedCost ?? false,
        });
        setSelectedTags(editingTransaction.tags.map((tag) => tag.name));
      } else {
        reset(emptyForm());
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

  return (
    <Modal
      open={transactionModalOpen}
      onClose={closeTransactionModal}
      title={editingTransaction ? t('editTransaction') : t('addTransaction')}
      size="lg"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="secondary" type="button" onClick={closeTransactionModal} disabled={isSaving}>
            {t('cancel')}
          </Button>
          <Button type="submit" form={FORM_ID} loading={isSaving} data-testid="tx-submit">
            {editingTransaction ? t('update') : t('save')}
          </Button>
        </div>
      }
    >
      <form
        id={FORM_ID}
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-5"
        data-testid="transaction-form"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            type="date"
            label={t('date')}
            requiredMark
            error={errors.transactionDate?.message}
            {...register('transactionDate', { required: t('dateRequired') })}
          />
          <div className="flex flex-col gap-1.5">
            <FieldLabel required>{t('type')}</FieldLabel>
            {/* The segmented toggle carries the app-wide expense/income colours
                that a native select cannot; the value still lives in the form. */}
            <input type="hidden" {...register('transactionType')} />
            <TypeToggle
              value={transactionType === 'INCOME' ? 'INCOME' : 'EXPENSE'}
              onChange={(value) => setValue('transactionType', value, { shouldDirty: true })}
              incomeLabel={t('income')}
              expenseLabel={t('expense')}
              size="md"
              fullWidth
              testId="tx-type-toggle"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <FieldLabel htmlFor="tx-amount" required>
            {t('amount')}
          </FieldLabel>
          <div
            className={`${fieldShellClassName(Boolean(errors.originalAmount))} flex items-stretch overflow-hidden`}
          >
            <input
              id="tx-amount"
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              aria-invalid={errors.originalAmount ? true : undefined}
              // Spinner arrows only get in the way of an amount this size.
              className="w-full bg-transparent px-3 py-2 text-lg font-semibold tabular-nums text-gray-900 outline-none [appearance:textfield] placeholder:text-gray-400 dark:text-white dark:placeholder:text-gray-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              {...register('originalAmount', { required: t('amountRequired'), min: 0 })}
            />
            <select
              aria-label={t('currency')}
              className="cursor-pointer border-l border-gray-200 bg-transparent px-3 text-sm font-medium text-gray-600 outline-none dark:border-gray-700 dark:text-gray-300"
              {...register('originalCurrency')}
            >
              <option value="KRW">KRW</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="JPY">JPY</option>
            </select>
          </div>
          {amountPreview && !errors.originalAmount && (
            <span className="text-xs tabular-nums text-gray-500 dark:text-gray-400">{amountPreview}</span>
          )}
          <FieldError>{errors.originalAmount?.message}</FieldError>
        </div>

        {isForeignCurrency && (
          <div className="animate-slide-up">
            <Input
              type="number"
              step="0.0001"
              min="0.01"
              requiredMark
              label={`${t('conversionRate')} (1 ${originalCurrency} = ? KRW)`}
              error={errors.conversionRate?.message}
              data-testid="tx-conversion-rate"
              {...register('conversionRate', {
                required: t('conversionRateRequired'),
                min: { value: 0.01, message: t('conversionRateRequired') },
              })}
            />
          </div>
        )}

        <Select
          label={t('category')}
          requiredMark
          error={errors.categoryId?.message}
          data-testid="tx-category-select"
          {...register('categoryId', { required: t('categoryRequired') })}
        >
          <option value="">{t('selectCategory')}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>

        {/* A form field, so it belongs beside the others rather than down in
            the action bar where it read as a third button. */}
        <label
          className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
            isExpense
              ? 'cursor-pointer border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-800/60'
              : 'cursor-not-allowed border-gray-100 opacity-60 dark:border-gray-800'
          }`}
        >
          <span className="flex flex-col">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('fixedCost')}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {isExpense ? t('fixedCostHint') : t('fixedCostExpenseOnly')}
            </span>
          </span>
          <span className="relative inline-flex shrink-0">
            <input
              type="checkbox"
              disabled={!isExpense}
              className="peer sr-only"
              data-testid="tx-fixed-cost"
              {...register('fixedCost')}
            />
            <span className="h-6 w-11 rounded-full bg-gray-200 transition-colors peer-checked:bg-brand-600 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500/40 peer-disabled:opacity-50 dark:bg-gray-700" />
            <span className="pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-150 ease-smooth peer-checked:translate-x-5" />
          </span>
        </label>

        <TagInput
          label={t('tags')}
          value={selectedTags}
          onChange={setSelectedTags}
          options={tags}
          placeholder={t('tagPlaceholder')}
          createLabel={(query) => t('tagCreate').replace('{name}', query)}
          selectedLabel={t('tagSelected')}
          emptyLabel={t('tagNoMatch')}
          testId="tx-tag-input"
        />

        <Input label={t('memoOptional')} {...register('memo')} data-testid="tx-memo" />
      </form>
    </Modal>
  );
}
