import { useRef, useState } from 'react'
// import blogService from '../services/blogs'
import Togglable from './Togglable'

const BlogForm = (props) => {
  const [blogTitle, setBlogTitle] = useState('')
  const [blogAuthor, setBlogAuthor] = useState('')
  const [blogUrl, setBlogUrl] = useState('')

  const TogglableRef = useRef()

  const handleCreate = async (event) => {
    event.preventDefault()
    try {
      props.createBlog({
        title: blogTitle,
        author: blogAuthor,
        url: blogUrl
      })
      props.setNotification({
        mode: 'success',
        message: `a new blog ${blogTitle} by ${blogAuthor} added`
      })
      setBlogAuthor('')
      setBlogTitle('')
      setBlogUrl('')
      TogglableRef.current.toggleVisibility()
    } catch (error) {
      props.setNotification({
        mode: 'error',
        message: error
      })
    }

    // props.clearNotification()

  }
  return (
    <div>
      <Togglable buttonLabel='create new blog' ref={TogglableRef} >
        <h2>create new</h2>
        <form onSubmit={handleCreate}>
          <div>
            <label>title:
              <input type='text' value={blogTitle} onChange={({ target }) => setBlogTitle(target.value)} />
            </label>
          </div>
          <div>
            <label>author:
              <input type='text' value={blogAuthor} onChange={({ target }) => setBlogAuthor(target.value)} />
            </label>
          </div>
          <div>
            <label>url:
              <input type='text' value={blogUrl} onChange={({ target }) => setBlogUrl(target.value)} />
            </label>
          </div>
          <button type='submit'>create</button>
        </form>
      </Togglable >
    </div>
  )
}

export default BlogForm