// Formatting utilities for numbers, dates, and text
import type { Dictionary } from 'ts-i18n'

export default {
  name: 'Name',
  age: 'Alter',
  email: 'E-Mail',
  // Number formatting
  numbers: {
    currency: ({ amount, currency = 'USD' }: {
      amount: number
      currency?: string
    }) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
      }).format(amount)
    },

    percentage: ({ value, decimals = 1 }: {
      value: number
      decimals?: number
    }) => {
      return new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(value / 100)
    },

    compact: ({ value }: { value: number }) => {
      if (value >= 1000000)
        return `${(value / 1000000).toFixed(1)}M`
      if (value >= 1000)
        return `${(value / 1000).toFixed(1)}K`
      return value.toString()
    },

    fileSize: ({ bytes }: { bytes: number }) => {
      const units = ['B', 'KB', 'MB', 'GB', 'TB']
      let size = bytes
      let unitIndex = 0

      while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024
        unitIndex++
      }

      return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
    },
  },

  // Date and time formatting
  dates: {
    relative: ({ date }: { date: Date }) => {
      const now = new Date()
      const diffInMs = date.getTime() - now.getTime()
      const diffInMinutes = Math.round(diffInMs / (1000 * 60))

      if (Math.abs(diffInMinutes) < 1)
        return 'just now'

      if (diffInMinutes > 0) {
        // Future
        if (diffInMinutes < 60)
          return `in ${diffInMinutes}m`

        const hours = Math.round(diffInMinutes / 60)
        if (hours < 24)
          return `in ${hours}h`

        const days = Math.round(hours / 24)
        if (days < 7)
          return `in ${days}d`

        const weeks = Math.round(days / 7)
        return `in ${weeks}w`
      }
      else {
        // Past
        const absMinutes = Math.abs(diffInMinutes)
        if (absMinutes < 60)
          return `${absMinutes}m ago`

        const hours = Math.round(absMinutes / 60)
        if (hours < 24)
          return `${hours}h ago`

        const days = Math.round(hours / 24)
        if (days < 7)
          return `${days}d ago`

        const weeks = Math.round(days / 7)
        return `${weeks}w ago`
      }
    },

    duration: ({ start, end }: { start: Date, end: Date }) => {
      const diffInMs = end.getTime() - start.getTime()
      const hours = Math.floor(diffInMs / (1000 * 60 * 60))
      const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60))

      if (hours === 0)
        return `${minutes}m`
      if (minutes === 0)
        return `${hours}h`
      return `${hours}h ${minutes}m`
    },

    businessDays: ({ start, end }: { start: Date, end: Date }) => {
      let count = 0
      const current = new Date(start)

      while (current <= end) {
        const dayOfWeek = current.getDay()
        if (dayOfWeek !== 0 && dayOfWeek !== 6)
          count++ // Not weekend
        current.setDate(current.getDate() + 1)
      }

      return `${count} business ${count === 1 ? 'day' : 'days'}`
    },
  },

  // Text formatting and manipulation
  text: {
    truncate: ({ text, length, suffix = '...' }: {
      text: string
      length: number
      suffix?: string
    }) => {
      if (text.length <= length)
        return text
      return text.slice(0, length - suffix.length) + suffix
    },

    initials: ({ name, maxLength = 2 }: {
      name: string
      maxLength?: number
    }) => {
      return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .slice(0, maxLength)
        .toUpperCase()
    },

    capitalize: ({ text, allWords = false }: {
      text: string
      allWords?: boolean
    }) => {
      if (allWords) {
        return text.replace(/\b\w/g, char => char.toUpperCase())
      }
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
    },

    highlight: ({ text, search }: {
      text: string
      search: string
    }) => {
      if (!search)
        return text
      const regex = new RegExp(`(${search})`, 'gi')
      return text.replace(regex, '**$1**') // Markdown-style highlighting
    },
  },

  // List formatting
  lists: {
    enumeration: ({ items, conjunction = 'and' }: {
      items: string[]
      conjunction?: 'and' | 'or'
    }) => {
      if (items.length === 0)
        return ''
      if (items.length === 1)
        return items[0]
      if (items.length === 2)
        return `${items[0]} ${conjunction} ${items[1]}`

      return `${items.slice(0, -1).join(', ')}, ${conjunction} ${items[items.length - 1]}`
    },

    summary: ({ items, limit = 3 }: {
      items: string[]
      limit?: number
    }) => {
      if (items.length <= limit) {
        return items.join(', ')
      }

      const shown = items.slice(0, limit)
      const remaining = items.length - limit
      return `${shown.join(', ')}, and ${remaining} more`
    },
  },

  // Progress and status
  progress: ({ completed, total, showPercentage = true }: {
    completed: number
    total: number
    showPercentage?: boolean
  }) => {
    const percentage = Math.round((completed / total) * 100)
    const base = `${completed}/${total}`

    if (showPercentage) {
      return `${base} (${percentage}%)`
    }
    return base
  },
} satisfies Dictionary
