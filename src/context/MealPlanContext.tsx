'use client'

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type Dispatch,
} from 'react'
import type { MealPlan, MealSlot, DayOfWeek, MealType } from '@/src/types'
import { currentIsoWeek } from '@/src/lib/weekUtils'
import { getItem, setItem } from '@/src/lib/storage'

// ---- State ----

interface MealPlanState {
  plans: Record<string, MealPlan>
  /** Current week being viewed/edited */
  activeWeek: string
}

function makeEmptyPlan(isoWeek: string): MealPlan {
  return { isoWeek, slots: [], updatedAt: new Date().toISOString() }
}

const initialState: MealPlanState = {
  plans: {},
  activeWeek: currentIsoWeek(),
}

// ---- Actions ----

type MealPlanAction =
  | { type: 'LOAD'; payload: Record<string, MealPlan> }
  | { type: 'SET_ACTIVE_WEEK'; payload: string }
  | { type: 'ASSIGN'; payload: { isoWeek: string; day: DayOfWeek; mealType: MealType; recipeId: string } }
  | { type: 'CLEAR_SLOT'; payload: { isoWeek: string; day: DayOfWeek; mealType: MealType } }
  | { type: 'CLEAR_WEEK'; payload: string }

// ---- Reducer ----

function mealPlanReducer(state: MealPlanState, action: MealPlanAction): MealPlanState {
  switch (action.type) {
    case 'LOAD':
      return { ...state, plans: action.payload }

    case 'SET_ACTIVE_WEEK':
      return { ...state, activeWeek: action.payload }

    case 'ASSIGN': {
      const { isoWeek, day, mealType, recipeId } = action.payload
      const plan = state.plans[isoWeek] ?? makeEmptyPlan(isoWeek)
      const newSlot: MealSlot = { id: `${isoWeek}-${day}-${mealType}`, day, mealType, recipeId }
      const slots = plan.slots.filter(
        (s) => !(s.day === day && s.mealType === mealType),
      )
      const updatedPlan: MealPlan = {
        ...plan,
        slots: [...slots, newSlot],
        updatedAt: new Date().toISOString(),
      }
      return { ...state, plans: { ...state.plans, [isoWeek]: updatedPlan } }
    }

    case 'CLEAR_SLOT': {
      const { isoWeek, day, mealType } = action.payload
      const plan = state.plans[isoWeek]
      if (!plan) return state
      const updatedPlan: MealPlan = {
        ...plan,
        slots: plan.slots.filter(
          (s) => !(s.day === day && s.mealType === mealType),
        ),
        updatedAt: new Date().toISOString(),
      }
      return { ...state, plans: { ...state.plans, [isoWeek]: updatedPlan } }
    }

    case 'CLEAR_WEEK': {
      const isoWeek = action.payload
      const updatedPlan = makeEmptyPlan(isoWeek)
      return { ...state, plans: { ...state.plans, [isoWeek]: updatedPlan } }
    }

    default:
      return state
  }
}

// ---- Context ----

interface MealPlanContextValue {
  state: MealPlanState
  dispatch: Dispatch<MealPlanAction>
  /** Active week's meal plan (always defined) */
  activePlan: MealPlan
}

const MealPlanContext = createContext<MealPlanContextValue | null>(null)

const STORAGE_KEY = 'meal-plans'

export function MealPlanProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(mealPlanReducer, initialState)

  // Hydrate
  useEffect(() => {
    const stored = getItem<Record<string, MealPlan>>(STORAGE_KEY)
    if (stored) dispatch({ type: 'LOAD', payload: stored })
  }, [])

  // Persist
  useEffect(() => {
    if (Object.keys(state.plans).length > 0) {
      setItem(STORAGE_KEY, state.plans)
    }
  }, [state.plans])

  const activePlan = useMemo(
    () => state.plans[state.activeWeek] ?? makeEmptyPlan(state.activeWeek),
    [state.plans, state.activeWeek],
  )

  const value = useMemo(
    () => ({ state, dispatch, activePlan }),
    [state, dispatch, activePlan],
  )

  return (
    <MealPlanContext.Provider value={value}>{children}</MealPlanContext.Provider>
  )
}

export function useMealPlan(): MealPlanContextValue {
  const ctx = useContext(MealPlanContext)
  if (!ctx) throw new Error('useMealPlan must be used within MealPlanProvider')
  return ctx
}

export function useMealPlanDispatch(): Dispatch<MealPlanAction> {
  return useMealPlan().dispatch
}
