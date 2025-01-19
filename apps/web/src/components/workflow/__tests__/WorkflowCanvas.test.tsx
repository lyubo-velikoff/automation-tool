import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import WorkflowCanvas from '../WorkflowCanvas'

jest.mock('reactflow', () => ({
  ReactFlow: jest.fn(() => null),
  Background: jest.fn(() => null),
  Controls: jest.fn(() => null),
  useNodesState: () => [[], jest.fn()],
  useEdgesState: () => [[], jest.fn()],
}))

describe('WorkflowCanvas', () => {
  it('renders workflow canvas with basic controls', () => {
    render(<WorkflowCanvas />)
    
    // Basic UI elements should be present
    expect(screen.getByRole('button', { name: /add node/i })).toBeInTheDocument()
  })

  it('allows adding new nodes', async () => {
    const user = userEvent.setup()
    render(<WorkflowCanvas />)
    
    // Click add node button
    const addButton = screen.getByRole('button', { name: /add node/i })
    await user.click(addButton)
    
    // Node selector should appear
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
}) 
