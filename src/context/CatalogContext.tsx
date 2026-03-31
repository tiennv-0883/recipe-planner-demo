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
import type { CatalogEntry } from '@/src/types'
import { useAuth } from '@/src/context/AuthContext'

// ---- State ----

interface CatalogState {
  entries: CatalogEntry[]
  loading: boolean
  error: string | null
}

const initialState: CatalogState = {
  entries: [],
  loading: false,
  error: null,
}

// ---- Actions ----

type CatalogAction =
  | { type: 'SET_ENTRIES'; payload: CatalogEntry[] }
  | { type: 'ADD_ENTRY'; payload: CatalogEntry }
  | { type: 'UPDATE_ENTRY'; payload: CatalogEntry }
  | { type: 'DELETE_ENTRY'; payload: { id: string } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }

// ---- Reducer ----

function catalogReducer(state: CatalogState, action: CatalogAction): CatalogState {
  switch (action.type) {
    case 'SET_ENTRIES':
      return { ...state, entries: action.payload, loading: false, error: null }
    case 'ADD_ENTRY':
      return { ...state, entries: [...state.entries, action.payload] }
    case 'UPDATE_ENTRY':
      return {
        ...state,
        entries: state.entries.map((e) =>
          e.id === action.payload.id ? action.payload : e,
        ),
      }
    case 'DELETE_ENTRY':
      return {
        ...state,
        entries: state.entries.filter((e) => e.id !== action.payload.id),
      }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    default:
      return state
  }
}

// ---- Context ----

interface CatalogContextValue {
  state: CatalogState
  dispatch: Dispatch<CatalogAction>
  apiDispatch: (action: CatalogAction) => Promise<void>
}

const CatalogContext = createContext<CatalogContextValue | null>(null)

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(catalogReducer, initialState)
  const { user, loading: authLoading } = useAuth()

  // Load all entries on mount (once user is authenticated)
  useEffect(() => {
    if (authLoading || !user) return
    dispatch({ type: 'SET_LOADING', payload: true })
    fetch('/api/catalog')
      .then((res) => res.json())
      .then((data) => {
        if (data.entries) {
          dispatch({ type: 'SET_ENTRIES', payload: data.entries })
        } else {
          dispatch({ type: 'SET_ERROR', payload: data.error ?? 'Failed to load' })
        }
      })
      .catch(() => dispatch({ type: 'SET_ERROR', payload: 'Network error' }))
  }, [user, authLoading])

  const apiDispatch = useCallback(async (action: CatalogAction) => {
    switch (action.type) {
      case 'ADD_ENTRY': {
        const { name, price, unit, storeName, storeType, sellerPhone, notes } = action.payload
        const body = { name, price, unit, storeName, storeType, sellerPhone, notes }
        const res = await fetch('/api/catalog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (res.ok) {
          const data = await res.json()
          if (data.entry) dispatch({ type: 'ADD_ENTRY', payload: data.entry })
        } else {
          const data = await res.json()
          dispatch({ type: 'SET_ERROR', payload: data.error ?? 'Failed to create' })
        }
        return
      }
      case 'UPDATE_ENTRY': {
        const { id, name, price, unit, storeName, storeType, sellerPhone, notes } = action.payload
        const body = { name, price, unit, storeName, storeType, sellerPhone, notes }
        const res = await fetch(`/api/catalog/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (res.ok) {
          const data = await res.json()
          if (data.entry) dispatch({ type: 'UPDATE_ENTRY', payload: data.entry })
        } else {
          const data = await res.json()
          dispatch({ type: 'SET_ERROR', payload: data.error ?? 'Failed to update' })
        }
        return
      }
      case 'DELETE_ENTRY': {
        // Optimistic
        dispatch(action)
        const res = await fetch(`/api/catalog/${action.payload.id}`, { method: 'DELETE' })
        if (!res.ok) {
          // Reload to restore state on failure
          fetch('/api/catalog')
            .then((r) => r.json())
            .then((data) => {
              if (data.entries) dispatch({ type: 'SET_ENTRIES', payload: data.entries })
            })
        }
        return
      }
      default:
        dispatch(action)
    }
  }, [])

  const value = useMemo(
    () => ({ state, dispatch, apiDispatch }),
    [state, dispatch, apiDispatch],
  )

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}

export function useCatalog(): CatalogContextValue {
  const ctx = useContext(CatalogContext)
  if (!ctx) throw new Error('useCatalog must be used within CatalogProvider')
  return ctx
}
