import { useState, useEffect } from 'react'
import Blog from './components/Blog'
import blogService from './services/blogs'
import loginService from './services/login'
import Notification from './components/Notification'
import BlogForm from './components/BlogForm'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [user, setUser] = useState(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const [notification, setNotification] = useState({ message: null })


  useEffect(() => {
    blogService.getAll().then(blogs => {
      blogs.sort((a, b) => b.likes - a.likes)
      setBlogs(blogs)
    }
    )
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  // clear notification message
  const clearNotification = () => {
    setTimeout(() => {
      setNotification({
        ...notification,
        message: null
      })
    }, 5000)
  }

  // sort blogs by likes
  // const sortedBlogs = blogs.sort((a, b) => b.likes - a.likes)

  const handleLogin = async (event) => {
    event.preventDefault()
    try {
      const user = await loginService.login({
        username,
        password
      })
      window.localStorage.setItem('loggedBlogappUser', JSON.stringify(user))
      blogService.setToken(user.token)
      setUser(user)
      setNotification({
        mode: 'success',
        message: `${user.name} logged in...`
      })
      setPassword('')
      setUsername('')
    } catch (error) {
      // console.log('login error')
      console.log(error.response.data.error)
      setNotification({
        mode: 'error',
        message: error.response.data.error,
      })
    }
    clearNotification()
  }

  const handleLogout = () => {
    console.log('logout!!!')
    window.localStorage.removeItem('loggedBlogappUser')
    setNotification({
      mode: 'success',
      message: `${user.name} has logged out...`
    })
    setUser(null)
    clearNotification()
  }

  const addBlog = async (blogObject) => {
    const res = await blogService.create(blogObject)
    console.log('resresr@!!!!!', res)
    console.log('24j5ljlsjflksajdflajldfjlajdlkjflasjflkasjkd')
    setBlogs(blogs.concat(res))
    // blogService.getAll().then(blogs =>
    //   setBlogs(blogs)
    // )
    // blogFormRef.current.toggleVisibility()
    clearNotification()
  }

  const updateBlog = (updatedBlog) => {
    setBlogs(blogs.map(blog =>
      blog.id === updatedBlog.id ? updatedBlog : blog
    ))
  }

  const deleteBlog = (blogId) => {
    setBlogs(blogs.filter(blog => blog.id !== blogId))
  }

  if (user === null) {
    return (
      <div>
        <h2>Log in to application</h2>
        <Notification info={notification} />
        <form onSubmit={handleLogin}>
          <div>
            <label>username
              <input type='text' value={username} onChange={({ target }) => setUsername(target.value)} />
            </label>
          </div>
          <div>
            <label>password
              <input type='password' value={password} onChange={({ target }) => setPassword(target.value)} />
            </label>
          </div>
          <button type='submit'>login</button>
        </form>
      </div>
    )
  }
  return (
    <div>
      <h2>blogs</h2>
      <Notification info={notification} />
      <div><span>{user.name} logged in</span><button onClick={handleLogout}>logout</button></div><br />
      <BlogForm setNotification={setNotification} clearNotification={clearNotification} createBlog={addBlog} />
      <div>
        {blogs.map(blog =>
          <Blog key={blog.id} blog={blog} updateBlog={updateBlog} deleteBlog={deleteBlog} user={user} />
        )}
      </div>
    </div>
  )
}

export default App