import { useState } from 'react'
import blogService from '../services/blogs'

const Blog = ({ blog, updateBlog, deleteBlog, user }) => {
  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }
  const [mode, setMode] = useState('view')
  const handleMode = () => {
    let tempMode = ''
    if (mode === 'view') {
      tempMode = 'hide'
    } else {
      tempMode = 'view'
    }
    setMode(tempMode)
  }

  const handleDelete = async (event) => {
    event.stopPropagation()
    const confirmed = window.confirm(`Remove blog ${blog.title} by ${blog.author}`)
    if (confirmed) {
      try {
        await blogService.remove(blog.id)
        console.log('blog removed')
        // Update the parent component's state immediately
        deleteBlog(blog.id)

      } catch (error) {
        console.log(error)
      }
    }
  }
  const handleLike = async () => {
    const updatedBlog = {
      ...blog,
      likes: blog.likes + 1
    }

    try {
      const res = await blogService.update(updatedBlog)
      console.log('likes updated', res)
      // Update the parent component's state immediately
      updateBlog(res)
    } catch (error) {
      console.log(error)
    }

  }
  return (
    <div className='blog' style={blogStyle}>
      {blog.title} {blog.author}<button className='modeButton' onClick={handleMode}>{mode}</button>
      {mode === 'hide' && (
        <div>
          {blog.url}<br />
          likes {blog.likes} <button className='likeButton' onClick={handleLike}>like</button><br />
          {((user.id === blog.user) || (user.id === blog.user.id)) && (<button onClick={handleDelete}>remove</button>)}
        </div>
      )}
    </div>
  )

}
export default Blog