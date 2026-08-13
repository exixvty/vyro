# Live Workout Verification

The authenticated VYRO dashboard loaded for the signed-in account. From the dashboard, the **Start Workout** action correctly opened the Workout programme. A workout name was accepted, and the exercise picker opened successfully with **324** searchable exercise entries, including Barbell Bench Press and other categories.

Barbell Bench Press was added successfully, and the workout started with an active-session timer and set controls. The **Cancel** control was then activated. It immediately returned the app to the New Workout screen, cleared the active session fields, and displayed the `Workout cancelled` confirmation. This verifies cancellation and draft cleanup for the live test workout.

The next live check is to repeat the flow, complete a set, finish the workout, and confirm the session appears in History.

A second workout named **Completion Verification** was created. Barbell Bench Press was again added successfully, leaving the workout ready to start and complete.

The second workout started successfully. A set was logged as **60 kg × 8 reps** and marked complete; the session correctly displayed 1/3 completed sets, 480 kg volume, and the Finish summary. However, after the user-approved **Complete Workout** action, the summary remained open and the active session did not clear. This reproduces the reported workout completion failure in the authenticated browser.

Diagnosis identified the root cause: `PageTransition` always applied an identity `translateY(0)` transform after its animation. That transform created a containing block for nested `fixed` elements, collapsing the finish overlay to a zero-height container and positioning its completion button outside the visible viewport. The transition now removes its transform once visible. The finish panel became visible and the approved completion action successfully cleared the active session and returned to the New Workout screen.

The completed workout was confirmed in History and on the dashboard as **Completion Verification** with the expected 5-minute duration and 24-calorie estimate. The user-approved **Start 21-Day Free Trial** action then completed and returned to the dashboard. Opening the Premium-gated Recovery programme showed its full tracker interface with a **Pro** badge, motivation, tracker tabs, reminder controls, and craving-alert status rather than a subscription gate. This confirms the persisted trial unlock works for a live account.
