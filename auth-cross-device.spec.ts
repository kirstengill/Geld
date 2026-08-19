import { test, expect } from '@playwright/test';

test('cross-device auth flow', async ({ page }) => {
  const qaDiagnosis = (await import('./qa-auth-diagnosis.mjs')).default;
  const result = await qaDiagnosis(page);
  console.log('QA Diagnosis Result:', JSON.stringify(result, null, 2));

  expect(result.signup.text).toContain('Welcome');
  expect(result.signin.text).toContain('Welcome Back');
  expect(result.signin.authStorage.length).toBeGreaterThan(0);
});
