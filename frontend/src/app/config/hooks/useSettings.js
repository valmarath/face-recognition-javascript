import { useContext } from 'react'
import { SettingsContext } from '../context/settingsContext'

export const useSettings = () => useContext(SettingsContext)
