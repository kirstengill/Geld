# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth-cross-device.spec.ts >> cross-device auth flow
- Location: auth-cross-device.spec.ts:3:1

# Error details

```
Error: expect(received).toContain(expected) // indexOf

Expected substring: "Welcome"
Received string:    "ThreadInvest
Create Investor Account·
Join the community of verified apparel micro-investors in Uganda·
FULL NAME
USERNAME
@
PASSWORD
CONFIRM PASSWORD
I agree to the Terms of Service and Privacy Policy.
Creating Account...
Already have an account? Sign in
© 2024 ThreadInvest. All rights reserved."
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - generic [ref=e8]:
      - generic [ref=e9]: Account Created!
      - generic [ref=e10]: "Welcome to Geld, Cross Device Test! UGX 3,500 signup bonus added to your wallet. Your referral code: NEST-WKFVN"
    - button [ref=e11]
  - generic [ref=e16]:
    - complementary [ref=e17]:
      - generic [ref=e18]:
        - button "Thread Invest UGX Platform" [ref=e19] [cursor=pointer]:
          - generic [ref=e23]:
            - generic [ref=e24]:
              - generic [ref=e25]: Thread
              - generic [ref=e26]: Invest
            - generic [ref=e27]: UGX Platform
        - navigation [ref=e28]:
          - button "Dashboard / Balance" [ref=e29] [cursor=pointer]
          - button "Investments" [ref=e36] [cursor=pointer]
          - button "Transactions / Wallet" [ref=e42] [cursor=pointer]
          - button "Refer & Earn" [ref=e48] [cursor=pointer]
          - button "Daily Rewards" [ref=e54] [cursor=pointer]
      - generic [ref=e59]:
        - generic [ref=e60]:
          - generic [ref=e61]:
            - generic [ref=e62]: Day Tracker
            - generic [ref=e65]: Day 1
          - button "Simulate Next Day (+1)" [ref=e66] [cursor=pointer]
          - paragraph [ref=e71]: Advances active 14-day lockup progress bars by 1 day increment.
        - generic [ref=e72]:
          - img "Cross Device Test" [ref=e73]
          - generic [ref=e74]:
            - generic [ref=e75]: Cross Device Test
            - generic [ref=e76]: UGX 3,500
        - button "Logout" [ref=e77] [cursor=pointer]
    - main [ref=e82]:
      - generic [ref=e83]:
        - textbox "Search projects, categories, transactions..." [ref=e89]
        - generic [ref=e90]:
          - button "Simulate Day +1" [ref=e91] [cursor=pointer]
          - button [ref=e96] [cursor=pointer]
          - generic [ref=e100]:
            - img "Cross Device Test" [ref=e101]
            - generic [ref=e102]:
              - generic [ref=e103]: Cross Device Test
              - generic [ref=e104]: UGX 3,500
      - generic [ref=e105]:
        - generic [ref=e107]:
          - generic [ref=e108]:
            - generic [ref=e109]: Ugandan Apparel Micro-Investing
            - heading "Welcome, Cross Device Test!" [level=1] [ref=e113]
            - paragraph [ref=e114]: Track your clothing production batches, monitor daily lockup maturation, and top up seamlessly with MTN MoMo & Airtel Money.
          - generic [ref=e115]:
            - button "Top Up Balance" [ref=e116] [cursor=pointer]
            - button "Withdraw" [ref=e121] [cursor=pointer]
        - generic [ref=e126]:
          - generic [ref=e127]:
            - generic [ref=e129]:
              - generic [ref=e130]: Available Balance
              - generic [ref=e131]: UGX 3,500
            - generic [ref=e136]: Ready to invest
          - generic [ref=e140]:
            - generic [ref=e142]:
              - generic [ref=e143]: Total Invested
              - generic [ref=e144]: UGX 0
            - generic [ref=e149]: In 0 apparel drops
          - generic [ref=e150]:
            - generic [ref=e152]:
              - generic [ref=e153]: Total Returns
              - generic [ref=e154]: +UGX 0
            - generic [ref=e158]: +15.0% avg yield
          - generic [ref=e159]:
            - generic [ref=e161]:
              - generic [ref=e162]: Active Lockups
              - generic [ref=e163]: "0"
            - generic [ref=e169]: 14-day daily increments
        - generic [ref=e170]:
          - generic [ref=e171]:
            - generic [ref=e173]:
              - heading "Clothing Business Project" [level=2] [ref=e174]
              - generic [ref=e175]: Active Drop
            - generic [ref=e176]:
              - generic [ref=e177]:
                - generic [ref=e183]:
                  - generic [ref=e184]: UGX 0 raised of UGX 0 goal
                  - generic [ref=e185]: NaN%
                - generic [ref=e188]:
                  - paragraph
                  - generic [ref=e189]:
                    - generic [ref=e190]: Category
                    - generic [ref=e192]:
                      - generic [ref=e193]: Lockup Period
                      - text: Days Cycle
                    - generic [ref=e194]:
                      - generic [ref=e195]: Expected Return
                      - generic [ref=e196]: +%
                    - generic [ref=e197]:
                      - generic [ref=e198]: Min Stake
                      - text: UGX 0
                    - generic [ref=e199]:
                      - generic [ref=e200]: Target Goal
                      - text: UGX 0
                    - generic [ref=e201]:
                      - generic [ref=e202]: Time Left
                      - text: Days
              - generic [ref=e203]:
                - generic [ref=e204]:
                  - generic [ref=e205]:
                    - heading "Invest in this Project" [level=3] [ref=e206]
                    - generic [ref=e207]: "Balance: UGX 3,500"
                  - generic [ref=e208]:
                    - generic [ref=e209]:
                      - generic [ref=e210]: Choose Stake Amount
                      - generic [ref=e211]:
                        - button "UGX 20k" [ref=e212] [cursor=pointer]
                        - button "UGX 50k" [ref=e213] [cursor=pointer]
                        - button "UGX 100k" [ref=e214] [cursor=pointer]
                        - button "UGX 250k" [ref=e215] [cursor=pointer]
                      - generic [ref=e216]: Custom Amount (UGX)
                      - generic [ref=e217]:
                        - generic [ref=e218]: UGX
                        - spinbutton "20000" [ref=e219]
                    - generic [ref=e220]:
                      - generic [ref=e221]: Lockup Period
                      - combobox [ref=e222]:
                        - option "14 Days Lockup (Daily Yield Increment)" [selected]
                        - option "30 Days Lockup"
                        - option "60 Days Lockup"
                    - generic [ref=e223]:
                      - generic [ref=e224]:
                        - generic [ref=e225]: "Daily Return (7.1% / 24h):"
                        - generic [ref=e226]: +UGX 1,420 / day
                      - generic [ref=e227]:
                        - generic [ref=e228]: "Total Return (%):"
                        - generic [ref=e229]: +UGX 0
                    - button "Invest UGX 20,000 Now" [disabled] [ref=e230] [cursor=pointer]
                - generic [ref=e231]: Verified UGX clothing production batch.
          - generic [ref=e236]:
            - generic [ref=e237]:
              - generic [ref=e238]:
                - heading "Active Investments" [level=3] [ref=e239]
                - paragraph [ref=e240]: 14-day lockup daily increment progress tracking
              - button "View All (0)" [ref=e241] [cursor=pointer]
            - generic [ref=e245]: No investments made yet. Choose a clothing project above to start!
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test('cross-device auth flow', async ({ page }) => {
  4  |   const qaDiagnosis = (await import('./qa-auth-diagnosis.mjs')).default;
  5  |   const result = await qaDiagnosis(page);
  6  |   console.log('QA Diagnosis Result:', JSON.stringify(result, null, 2));
  7  | 
> 8  |   expect(result.signup.text).toContain('Welcome');
     |                              ^ Error: expect(received).toContain(expected) // indexOf
  9  |   expect(result.signin.text).toContain('Welcome Back');
  10 |   expect(result.signin.authStorage.length).toBeGreaterThan(0);
  11 | });
  12 | 
```