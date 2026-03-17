'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type Dispatch,
} from 'react'
import type { MealPlan, MealSlot, DayOfWeek, MealType } from '@/src/types'
import { useAuth } from '@/src/context/AuthContext'
import { currentIsoWeek } from '@/src/lib/weekUtils'

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
  | { type: 'ADD_RECIPE'; payload: { isoWeek: string; day: DayOfWeek; mealType: MealType; recipeId: string } }
  | { type: 'REMOVE_RECIPE'; payload: { isoWeek: string; slotId: string; recipeId: string } }
  | { type: 'CLEAR_SLOT'; payload: { isoWeek: string; day: DayOfWeek; mealType: MealType } }
  | { type: 'CLEAR_WEEK'; payload: string }

// ---- Reducer ----

function mealPlanReducer(state: MealPlanState, action: MealPlanAction): MealPlanState {
  switch (action.type) {
    case 'LOAD':
      // Merge incoming week(s) into existing plans instead of replacing all
      return { ...state, plans: { ...state.plans, ...action.payload } }

    case 'SET_ACTIVE_WEEK':
      return { ...state, activeWeek: action.payload }

    case 'ADD_RECIPE': {
      const { isoWeek, day, mealType, recipeId } = action.payload
      const plan = state.plans[isoWeek] ?? makeEmptyPlan(isoWeek)
      const existing = plan.slots.find((s) => s.day === day && s.mealType === mealType)
      const currentIds = existing?.recipeIds ?? []
      const updatedSlot: MealSlot = {
        id: existing?.id ?? `${isoWeek}-${day}-${mealType}`,
        day,
        mealType,
        recipeIds: [...currentIds, recipeId],
      }
      const otherSlots = plan.slots.filter(
        (s) => !(s.day === day && s.mealType === mealType),
      )
      const updatedPlan: MealPlan = {
        ...plan,
        slots: [...otherSlots, updatedSlot],
        updatedAt: new Date().toISOString(),
      }
      return { ...state, plans: { ...state.plans, [isoWeek]: updatedPlan } }
    }

    case 'REMOVE_RECIPE': {
      const { isoWeek, slotId, recipeId } = action.payload
      const plan = state.plans[isoWeek]
      if (!plan) return state
      const slot = plan.slots.find((s) => s.id === slotId)
      if (!slot) return state
      const newRecipeIds = slot.recipeIds.filter((id) => id !== recipeId)
      const otherSlots = plan.slots.filter((s) => s.id !== slotId)
      const updatedPlan: MealPlan = {
        ...plan,
        slots:
          newRecipeIds.length === 0
            ? otherSlots
            : [...otherSlots, { ...slot, recipeIds: newRecipeIds }],
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
  /** API-backed dispatch for ADD_RECIPE, REMOVE_RECIPE, CLEAR_SLOT, CLEAR_WEEK */
  apiDispatch: (action: MealPlanAction) => Promise<void>
  /** Active week's meal plan (always defined) */
  activePlan: MealPlan
}

const MealPlanContext = createContext<MealPlanContextValue | null>(null)

export function MealPlanProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(mealPlanReducer, initialState)
  const { user, loading: authLoading } = useAuth()

  // Load the active week's plan from API only when user is authenticated
  useEffect(() => {
    if (authLoading || !user) return
    async function loadActiveWeek() {
      const res = await fetch(`/api/meal-plans/${state.activeWeek}`)
      if (res.ok) {
        const data = await res.json()
        if (data.mealPlan) {
          dispatch({
            type: 'LOAD',
            payload: { [state.activeWeek]: data.mealPlan },
          })
        }
      }
    }
    loadActiveWeek()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading])

  const apiDispatch = useCallback(async (action: MealPlanAction) => {
    switch (action.type) {
      case 'SET_ACTIVE_WEEK': {
        dispatch(action)
        const res = await fetch(`/api/meal-plans/${action.payload}`)
        if (res.ok) {
          const data = await res.json()
          if (data.mealPlan) {
            dispatch({ type: 'LOAD', payload: { [action.payload]: data.mealPlan } })
          }
        }
        return
      }
      case 'ADD_RECIPE': {
        const { isoWeek, day, mealType, recipeId } = action.payload
        const res = await fetch(`/api/meal-plans/${isoWeek}/slots`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ day, mealType, recipeId }),
        })
        if (res.ok) {
          const data = await res.json()
          if (data.mealPlan) {
            dispatch({ type: 'LOAD', payload: { [isoWeek]: data.mealPlan } })
          }
        }
        return
      }
      case 'REMOVE_RECIPE': {
        const { isoWeek, slotId, recipeId } = action.payload
        // Optimistic update
        dispatch(action)
        const res = await fetch(
          `/api/meal-plans/${isoWeek}/slots/${slotId}/recipes/${recipeId}`,
          { method: 'DELETE' },
        )
        if (!res.ok) {
          // Revert: reload the week's plan from API
          const reload = await fetch(`/api/meal-plans/${isoWeek}`)
          if (reload.ok) {
            const data = await reload.json()
            if (data.mealPlan) {
              dispatch({ type: 'LOAD', payload: { [isoWeek]: data.mealPlan } })
            }
          }
        }
        return
      }
      case 'CLEAR_SLOT': {
        const { isoWeek, day, mealType } = action.payload
        const plan = state.plans[isoWeek]
        const slot = plan?.slots.find(
          (s) => s.day === day && s.mealType === mealType,
        )
        if (slot) {
          await fetch(`/api/meal-plans/${isoWeek}/slots/${slot.id}`, {
            method: 'DELETE',
          })
        }
        dispatch(action)
        return
      }
      case 'CLEAR_WEEK': {
        const isoWeek = action.payload
        const plan = state.plans[isoWeek]
        if (plan?.slots.length) {
          await Promise.all(
            plan.slots.map((s) =>
              fetch(`/api/meal-plans/${isoWeek}/slots/${s.id}`, {
                method: 'DELETE',
              }),
            ),
          )
        }
        dispatch(action)
        return
      }
      default:
        dispatch(action)
    }
  }, [state.plans])

  const activePlan = useMemo(
    () => state.plans[state.activeWeek] ?? makeEmptyPlan(state.activeWeek),
    [state.plans, state.activeWeek],
  )

  const value = useMemo(
    () => ({ state, dispatch, apiDispatch, activePlan }),
    [state, dispatch, apiDispatch, activePlan],
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
