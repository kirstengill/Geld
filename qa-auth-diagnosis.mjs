export default async function run(page) {
  const username = `crossdevice${Date.now()}`;
  const password = 'CrossDeviceTest!2026';
  const fullName = 'Cross Device Test';
  const requests = [];
  page.on('response', response => {
    if (response.url().includes('supabase.co')) {
      requests.push({ url: response.url(), status: response.status() });
    }
  });

  await page.goto('http://localhost:3002/signup');
  await page.locator('#signup-fullname-input').fill(fullName);
  await page.locator('#signup-username-input').fill(username);
  await page.locator('#signup-password-input').fill(password);
  await page.locator('#signup-confirm-password-input').fill(password);
  await page.locator('#signup-submit-btn').click();
  await page.waitForTimeout(3000);
  const signup = await page.evaluate(() => ({
    text: document.body.innerText,
    storageKeys: Object.keys(localStorage),
    authStorage: Object.entries(localStorage).filter(([key]) => key.includes('supabase')),
  }));

  const secondContext = await page.context().browser().newContext();
  const secondPage = await secondContext.newPage();
  const secondRequests = [];
  secondPage.on('response', response => {
    if (response.url().includes('supabase.co')) {
      secondRequests.push({ url: response.url(), status: response.status() });
    }
  });
  await secondPage.goto('http://localhost:3002/');
  await secondPage.getByRole('button', { name: 'Start Investing' }).first().click();
  await secondPage.locator('#switch-to-signin-btn').click();
  await secondPage.locator('#signin-username-input').fill(username);
  await secondPage.locator('#signin-password-input').fill(password);
  await secondPage.locator('#signin-submit-btn').click();
  await secondPage.waitForTimeout(3000);
  const signin = await secondPage.evaluate(() => ({
    text: document.body.innerText,
    storageKeys: Object.keys(localStorage),
    authStorage: Object.entries(localStorage).filter(([key]) => key.includes('supabase')),
  }));

  await secondContext.close();
  return { username, signup, signin, requests, secondRequests };
}
