import { useState, useEffect } from 'react'

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue))
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue])

  return [storedValue, setStoredValue]
}

export const STORAGE_KEYS = {
  CONSTITUTION: 'kairos-constitution',
  ARCHIVES: 'kairos-archives',
  ARCHAEOLOGY: 'kairos-archaeology',
  PROJECT_TREE: 'kairos-project-tree'
}