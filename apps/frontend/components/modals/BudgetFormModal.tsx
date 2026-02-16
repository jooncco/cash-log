'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useUIStore } from '@/lib/stores/uiStore';
import { useBudgetStore } from '@/lib/stores/budgetStore';
import { useSessionStore } from '@/lib/stores/sessionStore';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CreateBudgetRequest } from '@/types';

export function BudgetFormModal() {
  const { budgetModalOpen, editingBudget, closeBudgetModal } = useUIStore();
  const { addBudget, updateBudget } = useBudgetStore();
  const { language } = useSessionStore();
  const t = useTranslation(language);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateBudgetRequest>();
  
  useEffect(() => {
    if (budgetModalOpen && editingBudget) {
      reset({
        category: editingBudget.category,
        amount: editingBudget.amount,
        period: editingBudget.period,
        alertThreshold: editingBudget.alertThreshold,
      });
    } else if (budgetModalOpen) {
      reset({ category: '', amount: 0, period: '', alertThreshold: 80 });
    }
  }, [budgetModalOpen, editingBudget, reset]);
  
  const onSubmit = async (data: CreateBudgetRequest) => {
    try {
      if (editingBudget) {
        await updateBudget(editingBudget.id, data);
      } else {
        await addBudget(data);
      }
      closeBudgetModal();
    } catch (error) {
      console.error('Failed to save budget:', error);
    }
  };
  
  if (!budgetModalOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={closeBudgetModal}
      role="dialog"
      aria-modal="true"
      aria-labelledby="budget-modal-title"
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 id="budget-modal-title" className="text-2xl font-bold mb-6">
            {editingBudget ? t('editBudget') : t('addBudget')}
          </h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium mb-1">
                {t('category')}
              </label>
              <Input
                id="category"
                data-testid="budget-category-input"
                {...register('category', { required: t('categoryRequired') })}
                placeholder={t('category')}
                aria-required="true"
                aria-invalid={errors.category ? 'true' : 'false'}
              />
              {errors.category && (
                <p className="text-red-600 text-sm mt-1" role="alert">{errors.category.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="amount" className="block text-sm font-medium mb-1">
                {t('amount')}
              </label>
              <Input
                id="amount"
                type="number"
                data-testid="budget-amount-input"
                {...register('amount', { 
                  required: t('amountRequired'),
                  min: { value: 1, message: 'Amount must be greater than 0' }
                })}
                placeholder={t('amount')}
                aria-required="true"
                aria-invalid={errors.amount ? 'true' : 'false'}
              />
              {errors.amount && (
                <p className="text-red-600 text-sm mt-1" role="alert">{errors.amount.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="period" className="block text-sm font-medium mb-1">
                {t('period')}
              </label>
              <Input
                id="period"
                type="month"
                data-testid="budget-period-input"
                {...register('period', { required: 'Period is required' })}
                aria-required="true"
                aria-invalid={errors.period ? 'true' : 'false'}
              />
              {errors.period && (
                <p className="text-red-600 text-sm mt-1" role="alert">{errors.period.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="alertThreshold" className="block text-sm font-medium mb-1">
                {t('alertThreshold')} (%)
              </label>
              <Input
                id="alertThreshold"
                type="number"
                data-testid="budget-threshold-input"
                {...register('alertThreshold', { 
                  required: 'Alert threshold is required',
                  min: { value: 0, message: 'Must be at least 0' },
                  max: { value: 100, message: 'Must be at most 100' }
                })}
                placeholder="80"
                aria-required="true"
                aria-invalid={errors.alertThreshold ? 'true' : 'false'}
              />
              {errors.alertThreshold && (
                <p className="text-red-600 text-sm mt-1" role="alert">{errors.alertThreshold.message}</p>
              )}
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={closeBudgetModal}
                className="flex-1"
                data-testid="budget-cancel-button"
              >
                {t('cancel')}
              </Button>
              <Button
                type="submit"
                className="flex-1"
                data-testid="budget-save-button"
              >
                {editingBudget ? t('update') : t('save')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
