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
import type { Recipe } from '@/src/types'
import { searchRecipes } from '@/src/services/recipes'

// ---- State ----

interface RecipeState {
  recipes: Recipe[]
  searchQuery: string
  selectedTags: string[]
  viewMode: 'grid' | 'list'
  loading: boolean
}

const initialState: RecipeState = {
  recipes: [],
  searchQuery: '',
  selectedTags: [],
  viewMode: 'grid',
  loading: true,
}

// ---- Actions ----

type RecipeAction =
  | { type: 'LOAD'; payload: Recipe[] }
  | { type: 'ADD'; payload: Recipe }
  | { type: 'UPDATE'; payload: Recipe }
  | { type: 'DELETE'; payload: string }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'TOGGLE_TAG'; payload: string }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'SET_VIEW_MODE'; payload: 'grid' | 'list' }
  | { type: 'SET_LOADING'; payload: boolean }

// ---- Reducer ----

function recipeReducer(state: RecipeState, action: RecipeAction): RecipeState {
  switch (action.type) {
    case 'LOAD':
      return { ...state, recipes: action.payload, loading: false }
    case 'ADD':
      return { ...state, recipes: [action.payload, ...state.recipes] }
    case 'UPDATE':
      return {
        ...state,
        recipes: state.recipes.map((r) =>
          r.id === action.payload.id ? action.payload : r,
        ),
      }
    case 'DELETE':
      return {
        ...state,
        recipes: state.recipes.map((r) =>
          r.id === action.payload
            ? { ...r, deletedAt: new Date().toISOString() }
            : r,
        ),
      }
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.payload }
    case 'TOGGLE_TAG': {
      const exists = state.selectedTags.includes(action.payload)
      return {
        ...state,
        selectedTags: exists
          ? state.selectedTags.filter((t) => t !== action.payload)
          : [...state.selectedTags, action.payload],
      }
    }
    case 'CLEAR_FILTERS':
      return { ...state, searchQuery: '', selectedTags: [] }
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    default:
      return state
  }
}

// ---- Context ----

interface RecipeContextValue {
  state: RecipeState
  dispatch: Dispatch<RecipeAction>
  /** API-backed dispatch: intercepts ADD/UPDATE/DELETE and calls the API */
  apiDispatch: (action: RecipeAction) => Promise<void>
  /** Active (non-deleted) recipes, filtered by current search/tags */
  filteredRecipes: Recipe[]
  /** All active (non-deleted) recipes */
  allRecipes: Recipe[]
}

const RecipeContext = createContext<RecipeContextValue | null>(null)

export function RecipeProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(recipeReducer, initialState)

  // Load from API on mount
  useEffect(() => {
    async function loadRecipes() {
      try {
        const res = await fetch('/api/recipes')
        if (res.ok) {
          const data = await res.json()
          dispatch({ type: 'LOAD', payload: data.recipes ?? [] })
        } else {
          dispatch({ type: 'SET_LOADING', payload: false })
        }
      } catch {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }
    loadRecipes()
  }, [])

  /**
   * API-backed dispatch.
   * For ADD/UPDATE/DELETE it calls the API and updates local state with the DB response.
   * For all other actions it falls through to the local reducer.
   */
  const apiDispatch = useCallback(async (action: RecipeAction) => {
    switch (action.type) {
      case 'ADD': {
        const res = await fetch('/api/recipes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.payload),
        })
        if (res.ok) {
          const data = await res.json()
          dispatch({ type: 'ADD', payload: data.recipe })
        }
        return
      }
      case 'UPDATE': {
        const res = await fetch(`/api/recipes/${action.payload.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.payload),
        })
        if (res.ok) {
          const data = await res.json()
          dispatch({ type: 'UPDATE', payload: data.recipe })
        }
        return
      }
      case 'DELETE': {
        await fetch(`/api/recipes/${action.payload}`, { method: 'DELETE' })
        dispatch(action)
        return
      }
      default:
        dispatch(action)
    }
  }, [])

  const allRecipes = useMemo(
    () => state.recipes.filter((r) => !r.deletedAt),
    [state.recipes],
  )

  const filteredRecipes = useMemo(
    () =>
      searchRecipes(
        allRecipes,
        state.searchQuery,
        state.selectedTags.length > 0 ? state.selectedTags : undefined,
      ),
    [allRecipes, state.searchQuery, state.selectedTags],
  )

  const value = useMemo(
    () => ({ state, dispatch, apiDispatch, filteredRecipes, allRecipes }),
    [state, dispatch, apiDispatch, filteredRecipes, allRecipes],
  )

  return <RecipeContext.Provider value={value}>{children}</RecipeContext.Provider>
}

export function useRecipes(): RecipeContextValue {
  const ctx = useContext(RecipeContext)
  if (!ctx) throw new Error('useRecipes must be used within RecipeProvider')
  return ctx
}

// Convenience hooks
export function useRecipeDispatch(): Dispatch<RecipeAction> {
  return useRecipes().dispatch
}
