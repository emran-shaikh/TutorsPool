// Basic TestSprite test
const { test, expect } = require('testsprite');

test('Homepage loads correctly', async ({ page }) => {
  // Navigate to the homepage
  await page.goto('http://localhost:5173');
  
  // Check that the page title contains the expected text
  const title = await page.title();
  expect(title).toContain('TutorsPool');
  
  // Check that the main content is visible
  const mainContent = await page.waitForSelector('main', { timeout: 5000 });
  expect(await mainContent.isVisible()).toBe(true);
});

test('Navigation works', async ({ page }) => {
  // Navigate to the homepage
  await page.goto('http://localhost:5173');
  
  // Click on the About link
  const aboutLink = await page.waitForSelector('a[href="/about"]', { timeout: 5000 });
  await aboutLink.click();
  
  // Check that we're on the About page
  await page.waitForURL('**/about');
});

test('Login form validation', async ({ page }) => {
  // Navigate to the login page
  await page.goto('http://localhost:5173/login');
  
  // Try to submit the form without filling in any fields
  const submitButton = await page.waitForSelector('button[type="submit"]', { timeout: 5000 });
  await submitButton.click();
  
  // Check that validation errors are displayed
  const errorMessage = await page.waitForSelector('.error-message', { timeout: 5000 });
  expect(await errorMessage.isVisible()).toBe(true);
});