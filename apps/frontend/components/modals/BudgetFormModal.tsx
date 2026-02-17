'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useUIStore } from '@/lib/stores/uiStore';
import { useBudgetStore } from '@/lib/stores/budgetStore';
import { useCategoryStore } from '@/lib/stores/categoryStore';
import { useSessionStore } from '@/lib/stores/sessionStore';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CreateBudgetRequest } from '@/types';

export function BudgetFormModal() {
  const { budgetModalOpen, editingBudget, closeBudgetModal } = useUIStore();
  const { addBudget, updateBudget } = useBudgetStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { language } = useSessionStore();
  const t = useTranslation(language);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Omit<CreateBudgetRequest, 'categoryIds'>>({
    defaultValues: {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      targetAmount: undefined,
    },
  });
  
  useEffect(() => {
    if (budgetModalOpen) {
      fetchCategories();
    }
  }, [budgetModalOpen]);
  
  useEffect(() => {
    if (budgetModalOpen && editingBudget) {
      reset({
        year: editingBudget.year,
        month: editingBudget.month,
        targetAmount: editingBudget.targetAmount,
      });
      setSelectedCategories((editingBudget.categories || []).map(c => c.id));
    } else if (budgetModalOpen) {
      reset({ 
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        targetAmount: undefined,
      });
      setSelectedCategories([]);
    }
  }, [budgetModalOpen, editingBudget, reset]);
  
  const handleClose = () => {
    closeBudgetModal();
    reset({
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      targetAmount: undefined,
    });
    setSelectedCategories([]);
  };

  const onSubmit = async (data: Omit<CreateBudgetRequest, 'categoryIds'>) => {
    if (selectedCategories.length === 0) {
      alert(t('selectAtLeastOneCategory'));
      return;
    }
    
    try {
      const submitData: CreateBudgetRequest = {
        ...data,
        categoryIds: selectedCategories,
      };
      if (editingBudget) {
        await updateBudget(editingBudget.id, submitData);
      } else {
        await addBudget(submitData);
      }
      handleClose();
    } catch (error) {
      console.error('Failed to save budget:', error);
    }
  };
  
  if (!budgetModalOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleClose}
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="year" className="block text-sm font-medium mb-1">
                  연도
                </label>
                <Input
                  id="year"
                  type="number"
                  {...register('year', { 
                    required: '연도를 입력해주세요',
                    valueAsNumber: true,
                    min: { value: 2000, message: '2000년 이상이어야 합니다' }
                  })}
                  placeholder="2026"
                />
                {errors.year && (
                  <p className="text-red-600 text-sm mt-1">{errors.year.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="month" className="block text-sm font-medium mb-1">
                  월
                </label>
                <Input
                  id="month"
                  type="number"
                  {...register('month', { 
                    required: '월을 입력해주세요',
                    valueAsNumber: true,
                    min: { value: 1, message: '1-12 사이여야 합니다' },
                    max: { value: 12, message: '1-12 사이여야 합니다' }
                  })}
                  placeholder="1"
                />
                {errors.month && (
                  <p className="text-red-600 text-sm mt-1">{errors.month.message}</p>
                )}
              </div>
            </div>
            
            <div>
              <label htmlFor="targetAmount" className="block text-sm font-medium mb-1">
                {t('amount')}
              </label>
              <Input
                id="targetAmount"
                type="number"
                {...register('targetAmount', { 
                  required: t('amountRequired'),
                  valueAsNumber: true,
                  min: { value: 1, message: 'Amount must be greater than 0' }
                })}
                placeholder={t('amount')}
              />
              {errors.targetAmount && (
                <p className="text-red-600 text-sm mt-1">{errors.targetAmount.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                카테고리 선택 (필수)
              </label>
              <div className="flex flex-wrap gap-2">
                {(categories || []).map(category => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => {
                      if (selectedCategories.includes(category.id)) {
                        setSelectedCategories(selectedCategories.filter(id => id !== category.id));
                      } else {
                        setSelectedCategories([...selectedCategories, category.id]);
                      }
                    }}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                      selectedCategories.includes(category.id)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
              {selectedCategories.length === 0 && (
                <p className="text-red-600 text-sm mt-1">최소 1개 이상의 카테고리를 선택해주세요</p>
              )}
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={handleClose}
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
