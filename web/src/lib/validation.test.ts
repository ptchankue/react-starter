import { describe, expect, it } from 'vitest'
import { validate } from './validation'

describe('validate', () => {
  it('reports every invalid field', () => {
    expect(validate({ email: 'nope', password: '123', plan: 'free', terms: false })).toEqual({
      email: 'Enter a valid email',
      password: 'At least 8 characters',
      terms: 'You must accept the terms',
    })
  })

  it('accepts valid input', () => {
    expect(validate({ email: 'a@b.co', password: '12345678', plan: 'pro', terms: true })).toEqual({})
  })
})
