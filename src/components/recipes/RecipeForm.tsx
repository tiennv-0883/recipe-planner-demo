'use client'

import { useState } from 'react'
import { clsx } from 'clsx'
import type { Tag, IngredientLine, PreparationStep } from '@/src/types'
import ImageUploadInput from '@/src/components/recipes/ImageUploadInput'
import { validateImageFile } from '@/src/lib/imageValidation'
import { useTranslations } from 'next-intl'

const ALL_TAGS: Tag[] = ['breakfast', 'lunch', 'dinner', 'healthy', 'vegan', 'vegetarian']

interface RecipeFormValues {
  title: string
  cookTimeMinutes: number
  servings: number
  tags: Tag[]
  ingredients: Omit<IngredientLine, 'id'>[]
  steps: Omit<PreparationStep, 'order'>[]
  photoUrl?: string
  /** The File selected by the user, to be uploaded by the parent page on submit. */
  imageFile?: File | null
}

export type { RecipeFormValues }

interface RecipeFormProps {
  initialValues?: Partial<RecipeFormValues>
  onSubmit: (values: RecipeFormValues) => void
  onCancel?: () => void
  isSubmitting?: boolean
  submitLabel?: string
}

function emptyIngredient(): { name: string; quantity: string; unit: string } {
  return { name: '', quantity: '', unit: '' }
}

export default function RecipeForm({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel,
}: RecipeFormProps) {
  const t = useTranslations('recipes')
  const tTag = useTranslations('recipes.tags')
  const [title, setTitle] = useState(initialValues?.title ?? '')
  const [cookTime, setCookTime] = useState(String(initialValues?.cookTimeMinutes ?? ''))
  const [servings, setServings] = useState(String(initialValues?.servings ?? ''))
  const [tags, setTags] = useState<Tag[]>(initialValues?.tags ?? [])
  const [ingredients, setIngredients] = useState<{ name: string; quantity: string; unit: string }[]>(
    initialValues?.ingredients?.map((i) => ({
      name: i.name,
      quantity: String(i.quantity),
      unit: i.unit,
    })) ?? [emptyIngredient()],
  )
  const [steps, setSteps] = useState<string[]>(
    initialValues?.steps?.map((s) => s.description) ?? [''],
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageError, setImageError] = useState('')

  function toggleTag(tag: Tag) {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    )
  }

  function handleIngredientChange(
    idx: number,
    field: 'name' | 'quantity' | 'unit',
    value: string,
  ) {
    setIngredients((prev) => prev.map((i, n) => (n === idx ? { ...i, [field]: value } : i)))
  }

  function addIngredient() {
    setIngredients((prev) => [...prev, emptyIngredient()])
  }

  function removeIngredient(idx: number) {
    setIngredients((prev) => prev.filter((_, n) => n !== idx))
  }

  function handleStepChange(idx: number, value: string) {
    setSteps((prev) => prev.map((s, n) => (n === idx ? value : s)))
  }

  function addStep() {
    setSteps((prev) => [...prev, ''])
  }

  function removeStep(idx: number) {
    setSteps((prev) => prev.filter((_, n) => n !== idx))
  }

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!title.trim()) errs.title = t('form.errors.titleRequired')
    if (!cookTime || isNaN(Number(cookTime)) || Number(cookTime) < 1)
      errs.cookTime = t('form.errors.cookTimeInvalid')
    if (!servings || isNaN(Number(servings)) || Number(servings) < 1)
      errs.servings = t('form.errors.servingsInvalid')
    if (tags.length === 0) errs.tags = t('form.errors.tagsRequired')
    if (ingredients.some((i) => !i.name.trim() || !i.quantity || !i.unit.trim()))
      errs.ingredients = t('form.errors.ingredientsRequired')
    if (steps.some((s) => !s.trim()))
      errs.steps = t('form.errors.stepsRequired')
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    onSubmit({
      title: title.trim(),
      cookTimeMinutes: Number(cookTime),
      servings: Number(servings),
      tags,
      ingredients: ingredients.map((i) => ({
        name: i.name.trim(),
        quantity: Number(i.quantity),
        unit: i.unit.trim(),
      })),
      steps: steps.map((s) => ({ description: s.trim() })),
      photoUrl: initialValues?.photoUrl,
      imageFile,
    })
  }

  const fieldClass = (error?: string) =>
    clsx(
      'w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1',
      error
        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
        : 'border-gray-300 focus:border-brand-500 focus:ring-brand-500',
    )

  function handleFileSelect(file: File | null) {
    if (!file) {
      setImageFile(null)
      setImageError('')
      return
    }
    const result = validateImageFile(file)
    if (!result.valid) {
      setImageFile(null)
      setImageError(result.error)
    } else {
      setImageFile(file)
      setImageError('')
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6 max-w-2xl">
      {/* Photo upload */}
      <ImageUploadInput
        currentUrl={initialValues?.photoUrl}
        onFileSelect={handleFileSelect}
        error={imageError}
      />

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          {t('form.titleLabel')} <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={fieldClass(errors.title)}
          placeholder={t('form.titlePlaceholder')}
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? 'title-error' : undefined}
        />
        {errors.title && (
          <p id="title-error" className="mt-1 text-xs text-red-600">{errors.title}</p>
        )}
      </div>

      {/* Cook time + Servings */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="cookTime" className="block text-sm font-medium text-gray-700 mb-1">
            {t('form.cookTimeLabel')} <span aria-hidden="true" className="text-red-500">*</span>
          </label>
          <input
            id="cookTime"
            type="number"
            min={1}
            value={cookTime}
            onChange={(e) => setCookTime(e.target.value)}
            className={fieldClass(errors.cookTime)}
            aria-invalid={!!errors.cookTime}
          />
          {errors.cookTime && <p className="mt-1 text-xs text-red-600">{errors.cookTime}</p>}
        </div>
        <div>
          <label htmlFor="servings" className="block text-sm font-medium text-gray-700 mb-1">
            {t('form.servingsLabel')} <span aria-hidden="true" className="text-red-500">*</span>
          </label>
          <input
            id="servings"
            type="number"
            min={1}
            value={servings}
            onChange={(e) => setServings(e.target.value)}
            className={fieldClass(errors.servings)}
            aria-invalid={!!errors.servings}
          />
          {errors.servings && <p className="mt-1 text-xs text-red-600">{errors.servings}</p>}
        </div>
      </div>

      {/* Tags */}
      <div>
        <fieldset>
          <legend className="block text-sm font-medium text-gray-700 mb-2">
            {t('form.tagsLabel')} <span aria-hidden="true" className="text-red-500">*</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {ALL_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={clsx(
                  'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                  tags.includes(tag)
                    ? 'bg-brand-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                )}
                aria-pressed={tags.includes(tag)}
              >
                {tTag(tag as Parameters<typeof tTag>[0])}
              </button>
            ))}
          </div>
          {errors.tags && <p className="mt-1 text-xs text-red-600">{errors.tags}</p>}
        </fieldset>
      </div>

      {/* Ingredients */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            {t('form.ingredientsLabel')} <span aria-hidden="true" className="text-red-500">*</span>
          </span>
        </div>
        <div className="space-y-2">
          {ingredients.map((ing, idx) => (
            <div key={idx} className="grid grid-cols-[1fr_100px_100px_32px] gap-2 items-center">
              <input
                type="text"
                placeholder={t('form.namePlaceholder')}
                value={ing.name}
                onChange={(e) => handleIngredientChange(idx, 'name', e.target.value)}
                className={fieldClass(errors.ingredients)}
                aria-label={`Ingredient ${idx + 1} name`}
              />
              <input
                type="number"
                placeholder={t('form.qtyPlaceholder')}
                min={0}
                step="any"
                value={ing.quantity}
                onChange={(e) => handleIngredientChange(idx, 'quantity', e.target.value)}
                className={fieldClass(errors.ingredients)}
                aria-label={`Ingredient ${idx + 1} quantity`}
              />
              <input
                type="text"
                placeholder={t('form.unitPlaceholder')}
                value={ing.unit}
                onChange={(e) => handleIngredientChange(idx, 'unit', e.target.value)}
                className={fieldClass(errors.ingredients)}
                aria-label={`Ingredient ${idx + 1} unit`}
              />
              <button
                type="button"
                onClick={() => removeIngredient(idx)}
                disabled={ingredients.length === 1}
                className="flex items-center justify-center text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label={`Remove ingredient ${idx + 1}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          {errors.ingredients && (
            <p className="text-xs text-red-600">{errors.ingredients}</p>
          )}
          <button
            type="button"
            onClick={addIngredient}
            className="text-sm text-brand-600 hover:text-brand-700 font-medium"
          >
            {t('form.addIngredient')}
          </button>
        </div>
      </div>

      {/* Steps */}
      <div>
        <span className="block text-sm font-medium text-gray-700 mb-2">
          {t('form.stepsLabel')} <span aria-hidden="true" className="text-red-500">*</span>
        </span>
        <div className="space-y-2">
          {steps.map((step, idx) => (
            <div key={idx} className="flex gap-2 items-start">
              <span className="mt-2 flex-shrink-0 text-sm font-bold text-brand-500 w-5 text-right">
                {idx + 1}.
              </span>
              <textarea
                value={step}
                onChange={(e) => handleStepChange(idx, e.target.value)}
                rows={2}
                placeholder={`Step ${idx + 1}…`}
                className={clsx(fieldClass(errors.steps), 'flex-1 resize-none')}
                aria-label={`Step ${idx + 1}`}
              />
              <button
                type="button"
                onClick={() => removeStep(idx)}
                disabled={steps.length === 1}
                className="mt-2 flex items-center justify-center text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label={`Remove step ${idx + 1}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          {errors.steps && (
            <p className="text-xs text-red-600">{errors.steps}</p>
          )}
          <button
            type="button"
            onClick={addStep}
            className="text-sm text-brand-600 hover:text-brand-700 font-medium"
          >
            {t('form.addStep')}
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-brand-500 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? t('form.saving') : (submitLabel ?? t('form.save'))}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {t('form.cancel')}
          </button>
        )}
      </div>
    </form>
  )
}
