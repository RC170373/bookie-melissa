'use client'

/**
 * Client-side API wrapper to replace Supabase client
 * Provides methods for authentication and database operations
 */

interface ApiResponse<T> {
  data?: T
  error?: string
}

class LocalClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  }

  /**
   * Authentication methods
   */
  auth = {
    signUp: async (email: string, password: string, username: string, fullName?: string) => {
      const response = await fetch(`${this.baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username, fullName }),
        credentials: 'include',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Registration failed')
      }

      return response.json()
    },

    signInWithPassword: async (email: string, password: string) => {
      const response = await fetch(`${this.baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Login failed')
      }

      return response.json()
    },

    signOut: async () => {
      await fetch(`${this.baseUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    },

    getUser: async () => {
      const response = await fetch(`${this.baseUrl}/api/auth/user`, {
        credentials: 'include',
      })

      if (!response.ok) {
        return { data: { user: null } }
      }

      return response.json()
    },
  }

  /**
   * Database query builder
   */
  from = (table: string) => {
    return new QueryBuilder(this.baseUrl, table)
  }
}

class QueryBuilder {
  private baseUrl: string
  private table: string
  private filters: Record<string, any> = {}
  private selectedFields: string[] = []
  private orderByField: string = ''
  private orderByAsc: boolean = true
  private limitValue: number = 0

  constructor(baseUrl: string, table: string) {
    this.baseUrl = baseUrl
    this.table = table
  }

  select(fields: string | string[]) {
    if (typeof fields === 'string') {
      this.selectedFields = fields.split(',').map(f => f.trim())
    } else {
      this.selectedFields = fields
    }
    return this
  }

  eq(field: string, value: any) {
    this.filters[field] = value
    return this
  }

  order(field: string, options?: { ascending?: boolean }) {
    this.orderByField = field
    this.orderByAsc = options?.ascending !== false
    return this
  }

  limit(count: number) {
    this.limitValue = count
    return this
  }

  async single() {
    const result = await this.execute()
    return { data: result?.[0] || null, error: null }
  }

  async execute() {
    const params = new URLSearchParams()

    if (this.selectedFields.length > 0) {
      params.append('select', this.selectedFields.join(','))
    }

    Object.entries(this.filters).forEach(([key, value]) => {
      params.append(`filter_${key}`, value)
    })

    if (this.orderByField) {
      params.append('orderBy', this.orderByField)
      params.append('orderAsc', this.orderByAsc.toString())
    }

    if (this.limitValue > 0) {
      params.append('limit', this.limitValue.toString())
    }

    const url = `${this.baseUrl}/api/${this.table}?${params.toString()}`

    try {
      const response = await fetch(url, {
        credentials: 'include',
      })

      if (!response.ok) {
        return null
      }

      const data = await response.json()
      return data[this.table] || data.data || []
    } catch (error) {
      console.error('Query error:', error)
      return null
    }
  }

  async insert(data: any) {
    const response = await fetch(`${this.baseUrl}/api/${this.table}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    })

    if (!response.ok) {
      const error = await response.json()
      return { data: null, error: error.error }
    }

    const result = await response.json()
    return { data: result.data || result, error: null }
  }
}

export const createClient = () => new LocalClient()

