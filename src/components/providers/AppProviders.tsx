'use client'

import { RecipeProvider } from '@/src/context/RecipeContext'
import { MealPlanProvider } from '@/src/context/MealPlanContext'
import { GroceryProvider } from '@/src/context/GroceryContext'

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <RecipeProvider>
      <MealPlanProvider>
        <GroceryProvider>{children}</GroceryProvider>
      </MealPlanProvider>
    </RecipeProvider>
  )
}
