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
import type { GroceryList, GroceryItem } from '@/src/types'
import { currentIsoWeek } from '@/src/lib/weekUtils'

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
  /** API-backed dispatch for mutating actions */
  apiDispatch: (action: GroceryAction) => Promise<void>
  activeList: GroceryList
}

const GroceryContext = createContext<GroceryContextValue | null>(null)

export function GroceryProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(groceryReducer, initialState)

  // Load active week's grocery list from API on mount
  useEffect(() => {
    async function loadActiveList() {
      const res = await fetch(`/api/grocery-lists/${state.activeWeek}`)
      if (res.ok) {
        const data = await res.json()
        if (data.groceryList) {
          dispatch({ type: 'SET_LIST', payload: data.groceryList })
        }
      }
    }
    loadActiveList()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const apiDispatch = useCallback(async (action: GroceryAction) => {
    switch (action.type) {
      case 'SET_ACTIVE_WEEK': {
        dispatch(action)
        const res = await fetch(`/api/grocery-lists/${action.payload}`)
        if (res.ok) {
          const data = await res.json()
          if (data.groceryList) {
            dispatch({ type: 'SET_LIST', payload: data.groceryList })
          }
        }
        return
      }
      case 'SET_LIST': {
        // Generate grocery list via API
        const res = await fetch(`/api/grocery-lists/${action.payload.isoWeek}/generate`, {
          method: 'POST',
        })
        if (res.ok) {
          const data = await res.json()
          if (data.groceryList) {
            dispatch({ type: 'SET_LIST', payload: data.groceryList })
          }
        }
        return
      }
      case 'TOGGLE_ITEM': {
        const { isoWeek, itemId } = action.payload
        // Optimistic update
        dispatch(action)
        const list = state.lists[isoWeek]
        const item = list?.items.find((i) => i.id === itemId)
        if (item) {
          await fetch(`/api/grocery-lists/${isoWeek}/items/${itemId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ checked: !item.checked }),
          })
        }
        return
      }
      case 'ADD_MANUAL_ITEM': {
        const { isoWeek, item } = action.payload
        const res = await fetch(`/api/grocery-lists/${isoWeek}/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            category: item.category,
          }),
        })
        if (res.ok) {
          const data = await res.json()
          if (data.groceryList) {
            dispatch({ type: 'SET_LIST', payload: data.groceryList })
          }
        }
        return
      }
      case 'REMOVE_ITEM': {
        const { isoWeek, itemId } = action.payload
        dispatch(action)
        await fetch(`/api/grocery-lists/${isoWeek}/items/${itemId}`, {
          method: 'DELETE',
        })
        return
      }
      case 'UPDATE_ITEM_QUANTITY': {
        const { isoWeek, itemId, quantity } = action.payload
        dispatch(action)
        await fetch(`/api/grocery-lists/${isoWeek}/items/${itemId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity }),
        })
        return
      }
      default:
        dispatch(action)
    }
  }, [state.lists])

  const activeList = useMemo(
    () => state.lists[state.activeWeek] ?? makeEmptyList(state.activeWeek),
    [state.lists, state.activeWeek],
  )

  const value = useMemo(
    () => ({ state, dispatch, apiDispatch, activeList }),
    [state, dispatch, apiDispatch, activeList],
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
