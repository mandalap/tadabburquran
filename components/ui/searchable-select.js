'use client'

import { useState, useRef, useEffect } from 'react'
import { Check, ChevronDown, X } from 'lucide-react'

export default function SearchableSelect({
  options = [],
  value = '',
  onChange,
  placeholder = 'Pilih...',
  searchPlaceholder = 'Cari...',
  displayKey = 'name',
  valueKey = 'id',
  renderOption,
  className = '',
  disabled = false
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)

  // Get display value for selected option
  const selectedOption = options.find(opt => opt[valueKey] === value)
  const displayValue = selectedOption ? (renderOption ? renderOption(selectedOption) : selectedOption[displayKey]) : ''

  // Filter options based on search
  const filteredOptions = options.filter(opt => {
    const searchLower = search.toLowerCase()
    const displayValue = opt[displayKey]?.toLowerCase() || ''
    return displayValue.includes(searchLower)
  })

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (option) => {
    onChange(option[valueKey])
    setIsOpen(false)
    setSearch('')
  }

  const handleClear = (e) => {
    e.stopPropagation()
    onChange('')
    setSearch('')
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between px-3 py-2 text-left bg-white border rounded-md transition ${
          isOpen ? 'border-gray-400 ring-1 ring-gray-400' : 'border-gray-300'
        } ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-50' : 'hover:border-gray-400 cursor-pointer'}`}
      >
        <span className={`truncate ${!displayValue ? 'text-gray-400' : 'text-gray-900'}`}>
          {displayValue || placeholder}
        </span>
        <div className="flex items-center gap-1 ml-2">
          {displayValue && !disabled && (
            <X
              className="w-4 h-4 text-gray-400 hover:text-gray-600"
              onClick={handleClear}
            />
          )}
          <ChevronDown className={`w-4 h-4 text-gray-400 transition ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden flex flex-col">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
              autoFocus
            />
          </div>

          {/* Options List */}
          <div className="overflow-y-auto flex-1">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-4 text-sm text-gray-500 text-center">
                Tidak ada hasil
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = option[valueKey] === value
                return (
                  <button
                    key={option[valueKey]}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className={`w-full px-3 py-2 text-left text-sm flex items-center justify-between transition ${
                      isSelected ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="truncate">
                      {renderOption ? renderOption(option) : option[displayKey]}
                    </span>
                    {isSelected && <Check className="w-4 h-4 flex-shrink-0 ml-2" />}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
