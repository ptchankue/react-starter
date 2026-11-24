import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import App from './App'
import { ThemeProvider } from './context/ThemeContext'

beforeAll(() => {
  // jsdom does not implement matchMedia
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
})

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </MemoryRouter>,
  )
}

describe('App', () => {
  it('renders the overview with links to every section', () => {
    renderAt('/')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Showcase')
    expect(screen.getAllByRole('link', { name: /hooks/i }).length).toBeGreaterThan(0)
  })

  it('lazy-loads a page and updates state on click', async () => {
    const user = userEvent.setup()
    renderAt('/hooks')
    const count = await screen.findByLabelText('count')
    expect(count).toHaveTextContent('0')
    await user.click(screen.getByRole('button', { name: 'increment' }))
    expect(count).toHaveTextContent('1')
    await user.click(screen.getByRole('button', { name: '+3 (batched)' }))
    expect(count).toHaveTextContent('4')
  })

  it('switches theme through context', async () => {
    const user = userEvent.setup()
    renderAt('/')
    await user.click(screen.getByRole('radio', { name: 'dark theme' }))
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
  })

  it('shows a 404 for unknown routes', () => {
    renderAt('/nope')
    expect(screen.getByRole('heading', { name: '404' })).toBeInTheDocument()
  })
})

describe('every page', () => {
  const pages = ['/basics', '/hooks', '/context', '/forms', '/data', '/performance', '/patterns', '/routing/users', '/mobile']
  it.each(pages)('%s renders without crashing', async (path) => {
    renderAt(path)
    // Each page renders at least one demo card heading once its lazy chunk loads.
    expect((await screen.findAllByRole('heading', { level: 3 })).length).toBeGreaterThan(0)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
