export interface SignUp {
  email: string
  password: string
  plan: 'free' | 'pro'
  terms: boolean
}
export type Errors = Partial<Record<keyof SignUp, string>>

export function validate(v: SignUp): Errors {
  const errors: Errors = {}
  if (!/^\S+@\S+\.\S+$/.test(v.email)) errors.email = 'Enter a valid email'
  if (v.password.length < 8) errors.password = 'At least 8 characters'
  if (!v.terms) errors.terms = 'You must accept the terms'
  return errors
}
