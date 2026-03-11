'use client'

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type Dispatch,
} from 'react'
import type { GroceryList, GroceryItem } from '@/src/types'
import { currentIsoWeek } from '@/src/lib/weekUtils'
import { getItem, setItem } from '@/src/lib/storage'

// ---- State ----

interface GroceryState {
  lists: Record<string, GroceryList>
  activeWeek: string
}

function makeEmptyList(isoWeek: string): GroceryList {
  return {
    isoWeek,
    items: [],
    generatedAt: null,
    updatedAt: new Date().toISOString(),
  }
}

const initialState: GroceryState = {
  lists: {},
  activeWeek: currentIsoWeek(),
}

// ---- Actions ----

type GroceryAction =
  | { type: 'LOAD'; payload: Record<string, GroceryList> }
  | { type: 'SET_ACTIVE_WEEK'; payload: string }
  | { type: 'SET_LIST'; payload: GroceryList }
  | { type: 'TOGGLE_ITEM'; payload: { isoWeek: string; itemId: string } }
  | { type: 'ADD_MANUAL_ITEM'; payload: { isoWeek: string; item: GroceryItem } }
  | { type: 'REMOVE_ITEM'; payload: { isoWeek: string; itemId: string } }
  | { type: 'UPDATE_ITEM_QUANTITY'; payload: { isoWeek: string; itemId: string; quantity: number } }

// ---- Reducer ----

function groceryReducer(state: GroceryState, action: GroceryAction): GroceryState {
  switch (action.type) {
    case 'LOAD':
      return { ...state, lists: action.payload }

    case 'SET_ACTIVE_WEEK':
      return { ...state, activeWeek: action.payload }

    case 'SET_LIST':
      return {
        ...state,
        lists: { ...state.lists, [action.payload.isoWeek]: action.payload },
      }

    case 'TOGGLE_ITEM': {
      const { isoWeek, itemId } = action.payload
      const list = state.lists[isoWeek]
      if (!list) return state
      const updatedList: GroceryList = {
        ...list,
        items: list.items.map((item) =>
          item.id === itemId ? { ...item, checked: !item.checked } : item,
        ),
        updatedAt: new Date().toISOString(),
      }
      return { ...state, lists: { ...state.lists, [isoWeek]: updatedList } }
    }

    case 'ADD_MANUAL_ITEM': {
      const { isoWeek, item } = action.payload
      const list = state.lists[isoWeek] ?? makeEmptyList(isoWeek)
      const updatedList: GroceryList = {
        ...list,
        items: [...list.items, item],
        updatedAt: new Date().toISOString(),
      }
      return { ...state, lists: { ...state.lists, [isoWeek]: updatedList } }
    }

    case 'REMOVE_ITEM': {
      const { isoWeek, itemId } = action.payload
      const list = state.lists[isoWeek]
      if (!list) return state
      const updatedList: GroceryList = {
        ...list,
        items: list.items.filter((item) => item.id !== itemId),
        updatedAt: new Date().toISOString(),
      }
      return { ...state, lists: { ...state.lists, [isoWeek]: updatedList } }
    }

    case 'UPDATE_ITEM_QUANTITY': {
      const { isoWeek, itemId, quantity } = action.payload
      const list = state.lists[isoWeek]
      if (!list) return state
      const updatedList: GroceryList = {
        ...list,
        items: list.items.map((item) =>
          item.id === itemId ? { ...item, quantity } : item,
        ),
        updatedAt: new Date().toISOString(),
      }
      return { ...state, lists: { ...state.lists, [isoWeek]: updatedList } }
    }

    default:
      return state
  }
}

// ---- Context ----

interface GroceryContextValue {
  state: GroceryState
  dispatch: Dispatch<GroceryAction>
  activeList: GroceryList
}

const GroceryContext = createContext<GroceryContextValue | null>(null)

const STORAGE_KEY = 'grocery-lists'

export function GroceryProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(groceryReducer, initialState)

  // Hydrate
  useEffect(() => {
    const stored = getItem<Record<string, GroceryList>>(STORAGE_KEY)
    if (stored) dispatch({ type: 'LOAD', payload: stored })
  }, [])

  // Persist
  useEffect(() => {
    if (Object.keys(state.lists).length > 0) {
      setItem(STORAGE_KEY, state.lists)
    }
  }, [state.lists])

  const activeList = useMemo(
    () => state.lists[state.activeWeek] ?? makeEmptyList(state.activeWeek),
    [state.lists, state.activeWeek],
  )

  const value = useMemo(
    () => ({ state, dispatch, activeList }),
    [state, dispatch, activeList],
  )

  return (
    <GroceryContext.Provider value={value}>{children}</GroceryContext.Provider>
  )
}

export function useGrocery(): GroceryContextValue {
  const ctx = useContext(GroceryContext)
  if (!ctx) throw new Error('useGrocery must be used within GroceryProvider')
  return ctx
}

export function useGroceryDispatch(): Dispatch<GroceryAction> {
  return useGrocery().dispatch
}
