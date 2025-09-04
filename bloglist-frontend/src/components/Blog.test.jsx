import { render, screen } from '@testing-library/react'
import Blog from './Blog'
import { describe, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import blogService from '../services/blogs'

// Mock the blog service
vi.mock('../services/blogs', () => ({
  default: {
    update: vi.fn(),
    remove: vi.fn()
  }
}))

describe('Blog Component Test...', () => {

  test('renders blog title and author, not URL and likes', async () => {
    const blog = {
      title: 'blog test with jsdom',
      author: 'blog author',
      url: 'blog url',
      likes: 10,
      user: {
        username: 'testuser'
      }
    }

    const user = {
      username: 'testuser'
    }

    render(<Blog blog={blog} user={user} />)

    // Use partial text matching for title
    const titleElement = await screen.findByText(/blog test with jsdom/)
    expect(titleElement).toBeDefined()

    // Use partial text matching for author
    const authorElement = await screen.findByText(/blog author/)
    expect(authorElement).toBeDefined()

    // URL should not be visible by default
    const url = screen.queryByText('blog url')
    expect(url).toBeNull()

    // likes should not be visible by default
    const likes = screen.queryByText(10)
    expect(likes).toBeNull()
  })


  test('shows URL and likes when show details button is clicked', async () => {
    const blog = {
      title: 'blog test with jsdom',
      author: 'blog author',
      url: 'blog url',
      likes: 10,
      user: {
        username: 'testuser'
      }
    }

    const user = {
      username: 'testuser'
    }

    render(<Blog blog={blog} user={user} />)

    const user1 = userEvent.setup()

    // render(<Blog blog={blog} user={user} />)

    // Find and click the show details button
    const showButton = screen.getByText('view')
    await user1.click(showButton)

    // After clicking, URL should be visible
    const urlElement = screen.getByText(/blog url/)
    expect(urlElement).toBeDefined()

    // After clicking, likes should be visible
    const likesElement = screen.getByText(/10/)
    expect(likesElement).toBeDefined()
  })

  test('calls updateBlog event handler twice when like button is clicked twice', async () => {
    const blog = {
      id: '12345',
      title: 'blog test with jsdom',
      author: 'blog author',
      url: 'blog url',
      likes: 5,
      user: {
        username: 'testuser'
      }
    }

    const user = {
      username: 'testuser'
    }

    // Create mock function for updateBlog prop
    const mockUpdateBlog = vi.fn()

    // Mock the blogService.update method to return a resolved promise
    blogService.update.mockResolvedValue({
      ...blog,
      likes: blog.likes + 1
    })

    const userEvent1 = userEvent.setup()

    render(<Blog blog={blog} user={user} updateBlog={mockUpdateBlog} />)

    // First, click the view button to show the details
    const showButton = screen.getByText('view')
    await userEvent1.click(showButton)

    // Find the like button
    const likeButton = screen.getByText('like')

    // Click the like button twice
    await userEvent1.click(likeButton)
    await userEvent1.click(likeButton)

    console.log(mockUpdateBlog.mock.calls)

    // Verify that updateBlog was called twice
    expect(mockUpdateBlog.mock.calls).toHaveLength(2)
  })


})