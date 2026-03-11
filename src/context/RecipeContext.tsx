'use client'

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type Dispatch,
} from 'react'
import type { Recipe } from '@/src/types'
import { SEED_RECIPES } from '@/src/data/recipes'
import { searchRecipes } from '@/src/services/recipes'
import { getItem, setItem } from '@/src/lib/storage'

const STORAGE_KEY = 'recipes'

// ---- State ----

interface RecipeState {
  recipes: Recipe[]
  /** null = not yet searched */
  searchQuery: string
  selectedTags: string[]
  viewMode: 'grid' | 'list'
}

const initialState: RecipeState = {
  recipes: [],
  searchQuery: '',
  selectedTags: [],
  viewMode: 'grid',
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

// ---- Reducer ----

function recipeReducer(state: RecipeState, action: RecipeAction): RecipeState {
  switch (action.type) {
    case 'LOAD':
      return { ...state, recipes: action.payload }
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
    default:
      return state
  }
}

// ---- Context ----

interface RecipeContextValue {
  state: RecipeState
  dispatch: Dispatch<RecipeAction>
  /** Active (non-deleted) recipes, filtered by current search/tags */
  filteredRecipes: Recipe[]
  /** All active (non-deleted) recipes */
  allRecipes: Recipe[]
}

const RecipeContext = createContext<RecipeContextValue | null>(null)

export function RecipeProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(recipeReducer, initialState)

  // Hydrate from localStorage (or seeds)
  useEffect(() => {
    const stored = getItem<Recipe[]>(STORAGE_KEY)
    dispatch({ type: 'LOAD', payload: stored ?? SEED_RECIPES })
  }, [])

  // Persist to localStorage on every change
  useEffect(() => {
    if (state.recipes.length > 0) {
      setItem(STORAGE_KEY, state.recipes)
    }
  }, [state.recipes])

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
    () => ({ state, dispatch, filteredRecipes, allRecipes }),
    [state, dispatch, filteredRecipes, allRecipes],
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
