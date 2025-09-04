import { render, screen } from '@testing-library/react'
import BlogForm from './BlogForm'
import userEvent from '@testing-library/user-event'
import { expect, vi } from 'vitest'

test('form calls the event handler it received as props with the right details when a new blog is created', async () => {
  // Create mock functions for props
  const mockCreateBlog = vi.fn()
  const mockSetNotification = vi.fn()

  // Set up userEvent
  const user = userEvent.setup()

  // Render the component with mock props
  render(
    <BlogForm
      createBlog={mockCreateBlog}
      setNotification={mockSetNotification}
    />
  )

  // First, click the button to show the form (inside Togglable)
  const createButton = screen.getByText('create new blog')
  await user.click(createButton)

  // Find input fields by their labels
  const titleInput = screen.getByLabelText(/title/i)
  const authorInput = screen.getByLabelText(/author/i)
  const urlInput = screen.getByLabelText(/url/i)
  const submitButton = screen.getByText('create')

  // Fill in the form
  await user.type(titleInput, 'Test Blog Title')
  await user.type(authorInput, 'Test Author')
  await user.type(urlInput, 'https://testblog.com')

  // Submit the form
  await user.click(submitButton)

  // Verify that createBlog was called with the correct arguments
  expect(mockCreateBlog).toHaveBeenCalledTimes(1)
  expect(mockCreateBlog).toHaveBeenCalledWith({
    title: 'Test Blog Title',
    author: 'Test Author',
    url: 'https://testblog.com'
  })

  // Verify that setNotification was called for success message
  expect(mockSetNotification).toHaveBeenCalledWith({
    mode: 'success',
    message: 'a new blog Test Blog Title by Test Author added'
  })
})

