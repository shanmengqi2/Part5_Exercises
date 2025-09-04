const { expect } = require('@playwright/test');

const loginWith = async (page, username, password) => {
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Login' }).click();
}

const createBlog = async (page, title, author, url) => {
  // 首先点击按钮展开创建博客表单
  await page.getByRole('button', { name: 'create new blog' }).click()

  // 等待表单元素可见后填写
  await expect(page.getByLabel('title:')).toBeVisible()
  await page.getByLabel('title:').fill(title)
  await page.getByLabel('author:').fill(author)
  await page.getByLabel('url:').fill(url)

  // 点击创建按钮
  const button = page.getByRole('button', { name: 'create' })
  await button.click()

  // 等待成功消息显示，但不用于后续定位
  // await expect(page.getByText(`${title} ${title} by ${author} added`)).toBeVisible({ timeout: 10000 })

  // 等待页面刷新后博客列表显示
  await page.waitForLoadState('networkidle')
}

module.exports = { loginWith, createBlog }