const { test, expect, beforeEach, describe } = require('@playwright/test');
const { loginWith, createBlog } = require('./blog_helper')
describe('Blog App', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('/api/testing/reset')
    await request.post('/api/users', {
      data: {
        username: 'smq',
        name: 'SHAN MENGQI',
        password: '123456'
      }
    })
    await page.goto('/');
  });

  test('Login form in shown', async ({ page }) => {
    const username = page.getByLabel('username')
    const password = page.getByLabel('password')

    await expect(username).toBeVisible();
    await expect(password).toBeVisible();
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await loginWith(page, 'smq', '123456')

      await expect(page.getByText('SHAN MENGQI logged in', { exact: true })).toBeVisible();
    })

    test('fails with incorrect credentials', async ({ page }) => {
      await loginWith(page, 'smq', 'wrong-password')

      await expect(page.getByText('invalid username or password')).toBeVisible()

      await expect(page.getByText('SHAN MENGQI logged in', { exact: true })).not.toBeVisible()
    })

    describe('When logged in', () => {
      beforeEach(async ({ page }) => {
        await loginWith(page, 'smq', '123456')
        // 等待登录成功后的页面加载完成
        await expect(page.getByText('SHAN MENGQI logged in', { exact: true })).toBeVisible()
      })

      test('a new blog can be created', async ({ page }) => {
        // page.getByLabel('title:').fill('a new blog')
        await createBlog(page, 'a new blog', 'vikin007', 'https://www.google.com')
        // 使用 first() 来选择第一个匹配的元素，避免严格模式问题
        // await expect(page.getByText('a new blog').first()).toBeVisible()
        const blog = page.locator('.blog')
        await expect(blog).toContainText('a new blog')
        // await expect(page.locator('.blog').isVisible())
      })

      test('blogs are arranged in the order according to likes, with most liked first', async ({ page }) => {
        // 创建多个博客并验证创建成功
        await createBlog(page, 'First blog', 'author1', 'https://example1.com')
        await expect(page.locator('.blog').filter({ hasText: 'First blog' })).toBeVisible()

        await createBlog(page, 'Second blog', 'author2', 'https://example2.com')
        await expect(page.locator('.blog').filter({ hasText: 'Second blog' })).toBeVisible()

        await createBlog(page, 'Third blog', 'author3', 'https://example3.com')
        await expect(page.locator('.blog').filter({ hasText: 'Third blog' })).toBeVisible()

        // 验证所有3个博客都存在
        const viewButtons = page.getByText('view')
        await expect(viewButtons).toHaveCount(3)

        // 为第二个博客点赞2次
        await viewButtons.nth(1).click()
        await page.getByRole('button', { name: 'like' }).click()
        await expect(page.getByText('likes 1')).toBeVisible()
        await page.getByRole('button', { name: 'like' }).click()
        await expect(page.getByText('likes 2')).toBeVisible()
        await page.getByText('hide').click()

        // 为第三个博客点赞1次
        await expect(viewButtons.nth(2)).toBeVisible({ timeout: 15000 })
        await viewButtons.nth(2).click()
        await page.getByRole('button', { name: 'like' }).click()
        await expect(page.getByText('likes 1')).toBeVisible()
        await page.getByText('hide').click()

        // 刷新页面以重新获取博客数据并按点赞数排序
        await page.reload()
        await page.waitForLoadState('networkidle')

        // 获取所有博客元素
        const blogs = page.locator('.blog')

        // 验证博客按点赞数排序：Second blog(2 likes) > Third blog(1 like) > First blog(0 likes)
        await expect(blogs.nth(0)).toContainText('Second blog')
        await expect(blogs.nth(1)).toContainText('Third blog')
        await expect(blogs.nth(2)).toContainText('First blog')
      })


      describe('and a blog exists', () => {
        beforeEach(async ({ page }) => {
          // 创建博客并等待创建成功
          await createBlog(page, 'a new blog', 'vikin007', 'https://www.google.com')
          // 等待页面稳定
          await page.waitForLoadState('networkidle')
        })

        test('a blog can be liked', async ({ page }) => {
          // 等待页面稳定后直接点击 view 按钮
          await page.getByText('view').first().click()

          // 等待博客详情展开，确保 like 按钮可见
          const likeButton = page.getByRole('button', { name: 'like' })
          await expect(likeButton).toBeVisible({ timeout: 15000 })

          // 点击 like 按钮
          await likeButton.click()

          // 验证点赞数增加（假设初始值为 0）
          await expect(page.getByText('likes 1')).toBeVisible()
        })

        test('a blog can be deleted', async ({ page }) => {
          // 等待页面稳定后直接点击 view 按钮
          await page.getByText('view').first().click()

          // 等待博客详情展开，确保 remove 按钮可见
          const deleteButton = page.getByRole('button', { name: 'remove' })
          await expect(deleteButton).toBeVisible({ timeout: 15000 })

          // Set up dialog handler for window.confirm
          page.on('dialog', dialog => dialog.accept())

          await deleteButton.click()

          // 验证博客不再可见（简单检查 view 按钮不存在）
          await expect(page.getByText('view')).not.toBeVisible()
        })

        test('only the user who added the blog sees the delete button', async ({ page, request }) => {
          // 创建另一个用户
          await request.post('/api/users', {
            data: {
              username: 'another_user',
              name: 'Another User',
              password: '123456'
            }
          })

          // 当前用户（smq）已经登录并创建了博客
          // 展开博客详情，验证删除按钮存在
          await page.getByText('view').first().click()
          const deleteButton = page.getByRole('button', { name: 'remove' })
          await expect(deleteButton).toBeVisible({ timeout: 15000 })

          // 登出当前用户
          await page.getByRole('button', { name: 'logout' }).click()
          await expect(page.getByText('SHAN MENGQI logged in')).not.toBeVisible()

          // 用另一个用户登录
          await loginWith(page, 'another_user', '123456')
          await expect(page.getByText('Another User logged in', { exact: true })).toBeVisible()

          // 展开同一个博客的详情
          await page.getByText('view').first().click()

          // 验证删除按钮不存在（因为这个博客不是当前用户创建的）
          await expect(page.getByRole('button', { name: 'remove' })).not.toBeVisible()
        })
      })
    })
  })
});