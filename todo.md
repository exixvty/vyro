# VYRO Fitness App — TODO

## Phase 1: Foundation
- [x] Database schema (users, profiles, workouts, nutrition, habits, progress, gamification, social)
- [x] Global styles, design tokens, dark/light theme
- [x] App shell with mobile-first bottom navigation + More drawer
- [x] tRPC routers skeleton

## Phase 2: Onboarding
- [x] Multi-step onboarding wizard (goals, experience, preferences)
- [x] Athlete type selection
- [x] Unit preferences (kg/lbs, km/miles)
- [x] Onboarding completion saves profile to DB

## Phase 3: Workout Features
- [x] Dashboard home screen with today's workout, streaks, quick stats
- [x] AI workout generator (personalized plans via LLM)
- [x] Workout session tracker (active workout UI)
- [x] Workout history and post-workout summary

## Phase 4: Nutrition & Progress
- [x] Nutrition tracker with calorie counter and macro breakdown
- [x] Meal logging (breakfast, lunch, dinner, snacks)
- [x] Progress dashboard with weight/measurements charts
- [x] Progress photos and personal records

## Phase 5: Library, Gamification & Social
- [x] Exercise library with muscle group filters
- [x] Gamification: XP, levels, badges, achievements
- [x] Social activity feed
- [x] User profiles and workout sharing

## Phase 6: Profile & Settings
- [x] User profile with stats showcase
- [x] Theme customization (dark/light + accent colors)
- [x] Settings (units, notifications, goals)
- [x] Premium subscription tier UI

## Phase 7: QA & Polish
- [x] Wire all tRPC procedures end-to-end
- [x] Vitest unit tests (11 tests passing)
- [x] Responsive mobile-first polish
- [x] Loading states, empty states, error handling


## Phase 8: Friends & Referral System
- [x] Friends table schema (friendships, friend requests, referral codes)
- [x] Friends router (add, list, remove, generate invite link)
- [x] Friends page with friend list and add friend UI
- [x] Referral rewards: multi-tier (3/5/10 invites)
- [x] Referral tracking with anti-cheat
- [x] Invite link integration in Social page


## Phase 9: Enhanced Referral Reward System
- [x] Update schema: device tracking, activity validation, multi-tier rewards
- [x] Anti-cheat logic: device/IP checks, minimum activity requirements
- [x] Multi-tier rewards: 3 invites (2 weeks), 5 invites (1 month), 10 invites (3 months)
- [x] Referral page with progress bars for each tier
- [x] Referral prompt modals (after workout, nutrition log, etc)
- [x] Referral tracking in onboarding with activity validation
- [x] Test anti-cheat and reward distribution


## Phase 10: Comprehensive Exercise Database
- [x] Create 200+ exercise database with all lifting categories (200+ exercises across 11 categories)
- [x] Add exercises table to schema and migration
- [x] Create exercises router with search, filter, and category endpoints
- [x] Update Library UI with full exercise list and advanced filters (category, type, difficulty, equipment)
- [x] Test exercise search and filtering (all tests passing)

## Phase 11: Expanded Exercise Database (443 Exercises)
- [x] Expand exercises to 443 with comprehensive muscle group coverage
- [x] Chest: 40+ exercises (all variations: bench, incline, decline, fly, machine, bodyweight)
- [x] Back: 50+ exercises (deadlifts, rows, pull-ups, lat pulldowns, shrugs, face pulls)
- [x] Shoulders: 45+ exercises (press, raise, fly, upright row, all variations)
- [x] Biceps: 40+ exercises (curl, preacher, hammer, concentration, all variations)
- [x] Triceps: 45+ exercises (dips, extension, pushdown, kickback, all variations)
- [x] Forearms: 25+ exercises (wrist curl, reverse curl, farmer's carry, grip work)
- [x] Legs: 60+ exercises (squat, lunge, leg press, extension, curl, calf raise, all variations)
- [x] Glutes: 35+ exercises (hip thrust, bridge, kickback, all variations)
- [x] Core: 40+ exercises (plank, crunch, leg raise, pallof press, ab wheel, all variations)
- [x] Cardio: 30+ exercises (treadmill, bike, rowing, sprints, battle ropes, all variations)
- [x] Functional: 30+ exercises (kettlebell, sandbag, medicine ball, tire flip, rope climb, all variations)
- [x] All tests passing (11/11), zero TypeScript errors



## Phase 12: Complete Exercise Library with Full Browsing
- [x] Verify Library page displays all 443 exercises
- [x] Multi-filter system: category, type, difficulty, equipment
- [x] Search functionality for finding exercises by name
- [x] Exercise detail modal with full information display
- [x] Favorite exercises feature with persistent state
- [x] Add to Workout button (ready for workout integration)
- [x] All tests passing (11/11), zero TypeScript errors


## Phase 13-15: Professional Workout System (Arrow/Liftoff/Hevy Inspired)
- [x] Workout logging schema: sessions, exercise logs, sets with reps/weight/time, supersets
- [x] Workout routers: create session, add exercise, log set, manage supersets
- [x] Professional Workout page: name workout, select from 324 DB exercises
- [x] Exercise picker with search + category filters (full-screen modal)
- [x] Set-by-set logging: weight, reps, set types (normal/warmup/dropset/failure)
- [x] Metric system toggle: kg/lbs for weight
- [x] Superset support: group exercises together
- [x] Active session UI: elapsed timer, rest timer, stats bar, live set completion
- [x] Finish workout modal with rating, stats summary, XP award
- [x] Workout history tab with session cards
- [x] Seeded 324 exercises into database across all 11 muscle groups
- [x] All tests passing (11/11), zero TypeScript errors


## Bug Fixes
- [x] Fix JSON parsing error on /library — equipment/muscleGroups already parsed by Drizzle json(), removed redundant JSON.parse()
- [x] Fix nested button error on /library — changed outer <button> to <div role="button"> to avoid nesting


## Phase 16: High-Engagement Features
- [x] Update schema: XP tiers, daily goals, achievements, progress photos, login streaks, beast mode (6 new tables)
- [x] XP/tier system: Rookie→Prospect→Athlete→Beast→Elite→Legend with tier calculation
- [x] Engagement routers: XP tracking, daily goals, achievements, login streaks, Beast Mode
- [x] Level-up detection and tier progression logic
- [x] Daily goals: 3 simple goals with completion tracking
- [x] Login streak tracking with current/longest streak
- [x] Beast Mode toggle with activation tracking
- [x] Level-up animations and tier unlock messages (UI) — LevelUpModal with tier-specific messages
- [x] Progress photo upload and side-by-side comparison (UI) — Photos tab with front/side/back angles, gallery, and before/after comparison
- [x] Enhanced Dashboard: today screen, XP bar, streak, quick start button (UI) — Home.tsx redesigned
- [x] Smart notifications: motivational, non-spammy, toggleable (UI) — Notifications page with settings
- [x] Personalized motivation messages based on user goals (UI) — Daily motivation in Recovery
- [x] Performance optimization and testing (route-level lazy loading, vendor chunking, production build, TypeScript, and 132-test suite verified)


## Phase 17: Visible Tier Ranking System (Liftoff-Inspired)
- [x] Tier badge component with visual progression (6 tiers with icons and colors)
- [x] Tier ranking page with leaderboard and tier progression visualization
- [x] Tier display integrated in AppLayout navigation
- [x] Tier progression chart showing all 6 tiers (Rookie→Legend)
- [x] Leaderboard with top 5 players and their XP
- [x] Tier details modal with XP ranges
- [x] All tests passing (11/11), zero TypeScript errors


## Phase 18: Tier Perks & Trophies
- [x] Design exclusive perks for each tier (1-6 perks per tier)
- [x] Build TierPerks component with icon and description display
- [x] Integrate perks into Tiers page (main section + modal)
- [x] Perks include: badges, custom notes, templates, 2x/3x/5x XP, Beast Mode, AI Coach, VIP community
- [x] All tests passing (11/11), zero TypeScript errors

## Phase 19: Performance Overview & UI Redesign
- [x] Cleaner minimal Dashboard — ring progress, XP bar, tier badge, motivation message
- [x] Performance Overview page: volume lifted, total time, workouts, sets, reps
- [x] Muscle distribution chart (radar/donut via Recharts)
- [x] Stats over time (line charts via Recharts)
- [x] Creative trophy showcase: Iron Will, Volume King, Consistency Crown
- [x] workouts.getStats procedure for real database stats
- [x] Performance route added and linked in AppLayout More drawer
- [x] All tests passing (11/11), zero TypeScript errors

## Phase 20: Artistic Maximalist Redesign
- [x] Global CSS: grain texture, neon borders, frost-card, animated gradient border, stat-card, fire-icon, tier glow classes
- [x] Dashboard: hero orbs, ambient gradient, animated XP bar, gradient stat pills, noise overlay on CTA, gradient ring progress, motivational banner
- [x] AppLayout: gradient top line, glow icons with drop-shadow, colorful More drawer with per-item accent colors
- [x] All tests passing (11/11), zero TypeScript errors

## Phase 21: Interactive & Satisfying UX
- [x] Global interaction CSS: press/scale effects, spring transitions, active states
- [x] AnimatedButton component with press ripple and spring scale
- [x] PressCard component with satisfying depth press effect
- [x] ConfettiEffect component for celebrations (level-up, workout complete)
- [x] Animated number counters (count-up on mount)
- [x] Staggered list entry animations
- [x] Dashboard: animated XP bar fill, live counter updates, streak fire animation
- [x] Workout: set-complete checkmark animation, rest timer pulse, finish confetti
- [x] Library: card hover/press ripple, smooth filter transitions
- [x] Tiers: tier card flip reveal, XP progress spring animation
- [x] Page transitions: slide-in between routes
- [x] Swipe gestures on cards (dismiss, favorite)
- [x] Toast notifications with satisfying slide+bounce


## Phase 24: Full UI Customization System
- [x] Database: add theme_preferences table (userId, primaryColor, accentColor, buttonStyle, fontFamily, logoUrl, appName)
- [x] ThemeContext: manage user theme state, load from DB, persist changes
- [x] Appearance settings page: color swatches, accent picker, button style selector, font picker, logo upload, app name input
- [x] Live preview in settings: show changes in real-time before saving
- [x] Wire ThemeContext into AppLayout: CSS variables update dynamically across all pages
- [x] Preset themes: 5-6 curated color palettes (Neon, Sunset, Ocean, Forest, Cyberpunk, etc.)
- [x] Button style variants: solid, outline, gradient, glassmorphism
- [x] Font options: Inter, Space Grotesk, Syne, Poppins, Roboto
- [x] Logo upload to S3 and display in nav/header
- [x] App name customization (replaces "VYRO" in nav and header)
- [x] UI cleanup: tighten spacing, reduce padding, simplify card shadows, cleaner borders
- [x] Test all customization flows and persistence

## Phase 25: Auto-Apply Theme Preferences
- [x] Load saved theme from DB on startup and sync into ThemeContext
- [x] Apply CSS variables (primary/accent/secondary colors) live on save
- [x] Apply font-family CSS variable to document body
- [x] Wire app name into AppLayout nav header from ThemeContext
- [x] Ensure Appearance page save triggers immediate DOM update

## Phase 26: Polish for Publishing
- [x] Fix nested button error in Nutrition.tsx (button inside button at line 214/223)
- [x] Soften the AppLayout header border and make it more subtle
- [x] Polish Home landing page for unauthenticated visitors
- [x] Ensure consistent spacing and padding across all pages (completed in Phase 34 visual consistency pass)
- [x] Add proper empty states with illustrations for all list pages (completed in Phase 34)
- [x] Verify all loading states show skeletons not blank screens (completed in Phase 34)
- [x] Clean up any console warnings/errors (completed in Phase 34)
- [x] Verify Appearance page works end-to-end (completed in Phase 34)
- [x] Final visual consistency pass across all pages (completed in Phase 34)


## Phase 27: PWA Setup (Progressive Web App)
- [x] Generate PWA icons (192x192 and 512x512 PNG)
- [x] Create manifest.json with app metadata
- [x] Build service worker with offline caching
- [x] Wire manifest link into index.html
- [x] Register service worker in main.tsx
- [x] Create InstallPrompt component for mobile users
- [x] Wire InstallPrompt into AppLayout
- [x] Test PWA installation on mobile


## Phase 28: SEO Fixes for /workout/builder
- [x] Add proper page title (30-60 characters)
- [x] Add meta description (50-160 characters)
- [x] Add keywords meta tag
- [x] Add H2 heading to page content
- [x] Test SEO improvements


## Phase 29: Premium Redesign & Beast Mode
- [x] Fix SEO on home page (title 30-60 chars, description 50-160 chars, H2 heading, keywords)
- [x] Add profile picture upload to database and S3
- [x] Display profile picture next to "VYRO" header in AppLayout
- [x] Rebuild Home landing page with bold headline "Stop using 5 fitness apps. Use VYRO."
- [x] Add subtext "Track workouts, nutrition, and progress in one place."
- [x] Add large centered "Start Workout" CTA button
- [x] Implement Beast Mode toggle in Appearance settings
- [x] Wire Beast Mode to multiply XP rewards (1.5x or 2x)
- [x] Add Beast Mode UI glow effect (subtle neon glow around active elements)
- [x] Polish UI: black background, white text, blue accents
- [x] Improve spacing, font consistency, button sizes
- [x] Add subtle shadows and glow to important buttons
- [x] Ensure smooth transitions between pages
- [x] Test all Appearance settings (colors, fonts, Beast Mode, profile pic)

## Phase 30: Premium UI Overhaul
- [x] Enforce black/white/blue design system in index.css
- [x] Rebuild Home landing page with bold headline and minimal hero
- [x] Wire Beast Mode glow across AppLayout, nav, and Dashboard
- [x] Polish Dashboard — clean cards, larger Start Workout CTA, visual hierarchy
- [x] Polish Workout page — bigger buttons, cleaner set cards
- [x] Polish Nutrition page — cleaner food log, better spacing
- [x] Polish Progress, Habits, Profile, Tiers pages
- [x] Add "You're becoming a Beast 🔥" level-up message
- [x] Ensure smooth page transitions and no visual clutter


## Phase 32: Today Dashboard Redesign
- [x] Rebuild Home.tsx as Today Dashboard
- [x] Add big centered "Start Workout" CTA button
- [x] Add animated XP progress bar with level display
- [x] Display current tier with visual badge
- [x] Add daily goals section (workouts, nutrition, habits)
- [x] Display current streak with fire icon
- [x] Add quick action buttons (Log Food, Complete Habit)
- [x] Polish layout with clean spacing and visual hierarchy
- [x] Make dashboard mobile-friendly and easy to scan
- [x] Test all dashboard elements and interactions

## Phase 33: Addictive Engagement & Push Notifications
- [x] XP gain floating animation (+50 XP 🔥) on every XP-earning action
- [x] Level-up full-screen celebration with motivational messages ("You're becoming Elite 🔥")
- [x] Motivational message variants by tier (Rookie → Prospect → Athlete → Beast → Elite → Legend)
- [x] Streak milestone celebrations (3, 7, 14, 30 days)
- [x] Web Push notification service worker handler (sw.js updated)
- [x] Push subscription management (subscribe/unsubscribe)
- [x] Server-side push notification sending with VAPID keys (web-push)
- [x] Daily workout reminder notification (9am)
- [x] Habit check-in reminder notification (8pm)
- [x] Streak danger notification (if no activity by 9pm)
- [x] Notification permission prompt in app (PermissionBanner component)
- [x] Notification settings page (enable/disable each type)
- [x] Notifications route added to AppLayout More drawer
- [x] All 14 tests passing, zero TypeScript errors

## Phase 34: Final Polish for Publication
- [x] Fix nested button error in Nutrition.tsx
- [x] Soften AppLayout header border
- [x] Polish Home landing page for unauthenticated visitors (hero, CTA, features)
- [x] Add proper empty states for workout history, habits, nutrition logs
- [x] Ensure loading skeletons on all data-dependent pages
- [x] Clean up any console warnings/errors
- [x] Visual consistency pass: spacing, typography, colors across all pages
- [x] Verify Appearance settings work end-to-end
- [x] Final vitest run (all tests passing)
- [x] Final TypeScript check (zero errors)

## Phase 35: Addiction Recovery Module + Premium Polish
- [x] 21-day free trial (update Premium page and server logic — based on account createdAt)
- [x] Font customization locked to Premium
- [x] Outline/border style customization locked to Premium
- [x] App name/logo customization locked to Premium
- [x] Recovery page added to More drawer (Premium-gated)
- [x] DB schema: user_addictions, urge_log, recovery_motivations tables
- [x] tRPC router: recovery (addictions CRUD, urge log, motivation, stats)
- [x] Full addiction list (29 types: alcohol, drugs, smoking, gambling, porn, social media, gaming, food, shopping, caffeine, self-harm, vaping, sugar, screens, etc.)
- [x] Sobriety timer (days/hours/minutes/seconds live counter)
- [x] Milestone celebrations (1 day, 3 days, 1 week, 2 weeks, 1 month, 3 months, 6 months, 1 year, 2 years)
- [x] Urge log with intensity slider and coping strategies
- [x] Daily motivational messages (rotating, 15 unique messages)
- [x] Custom motivation messages (user-written, saved)
- [x] Ways to combat each addiction (science-backed tips per type)
- [x] Premium gate on Recovery page
- [x] Premium gate on Appearance font/outline/app-name features
- [x] 20 vitest tests passing, zero TypeScript errors

## Phase 36: Recovery Push Notifications (Sobriety Reminders + Craving Alerts)
- [x] Update Recovery page UI: add time picker for daily sobriety reminder (completed in successor Phase 36 entry)
- [x] Add "Send Craving Alert" button on Recovery page (completed in successor Phase 36 entry)
- [x] Extend recovery router: setReminderTime procedure (completed as setSobrietyReminderTime)
- [x] Extend recovery router: logCravingAlert procedure (completed in successor Phase 36 entry)
- [x] Set up Heartbeat cron job for daily sobriety reminders at user's chosen time (completed in successor Phase 36 entry)
- [x] Add actionable craving-alert notification options for logging an urge or opening in-app support guidance
- [x] Verify sobriety reminder payload includes sober-day count and a Recovery-page deep link
- [x] Show the last craving-alert timestamp in the Recovery UI and add verification coverage (4 new recovery notification tests)
- [x] 20+ vitest tests passing, zero TypeScript errors (completed in successor Phase 36 entry)

## Phase 36: Recovery Push Notifications (Daily Reminders + Craving Alerts)
- [x] Craving alert button on each addiction tracker (red button with Zap icon)
- [x] Immediate push notification when craving alert is triggered ("You've Got This! 💪")
- [x] Sobriety reminder time picker in Recovery settings (HH:MM format)
- [x] Daily sobriety reminder push notification (9am default, user-configurable)
- [x] Scheduled Heartbeat cron job for daily reminders (/api/scheduled/sobriety-reminders)
- [x] Recovery reminder settings stored in DB (sobrietyReminder, sobrietyReminderTime, cravingAlertEnabled)
- [x] Craving alert logged to urge log with high intensity (intensity: 8)
- [x] All 20 vitest tests passing, zero TypeScript errors

## Phase 37: Gamification Dashboard Integration
- [x] Create GamificationDashboard component with all dashboard sections
- [x] Add tab navigation to Profile page (Fitness Profile vs Gamification tabs)
- [x] Implement dashboard sub-components (Header, Quick Stats, Challenges, Achievements)
- [x] Wire dashboard to real data using trpc.gamification hooks
- [x] Style and animate dashboard with Tailwind and Framer Motion
- [x] Test all interactions and verify responsive design (20 new vitest tests)
- [x] 54 vitest tests passing (20 new + 34 existing), zero TypeScript errors

## Phase 38: Premium Features Testing & Verification
- [x] Verify free trial access (21-day automatic premium)
- [x] Verify paid premium access (isPremium + premiumExpiresAt check)
- [x] Test Recovery module premium gating
- [x] Test Appearance customization premium gating
- [x] Test premium features unlock on trial start
- [x] Test premium features unlock on paid subscription
- [x] Test premium expiration and feature lockdown
- [x] Create premium access integration tests (32 tests)
- [x] Create premium features gating tests (33 tests)
- [x] 119 vitest tests passing, zero TypeScript errors

## Phase 39: Active Workout Reliability
- [x] Audit the in-progress workout UI, workout session model, and API procedures
- [x] Support adding and removing sets while a workout is active
- [x] Support editing completed and planned set values during a workout
- [x] Support adding and removing exercises from an active workout
- [x] Persist in-progress workout changes reliably between UI actions
- [x] Support cancelling an active workout without recording it as complete
- [x] Support finishing an active workout with an accurate summary and XP award
- [x] Add regression tests for all active workout actions (13 active-workout tests)
- [x] Verify TypeScript and complete test suite pass (132 tests)

## Phase 40: Performance Optimization Verification
- [x] Run a successful post-optimization production build and record final bundle/chunk sizes
- [x] Verify the global CSS import warning is resolved in the production build log
- [x] Run the full Vitest suite after lazy loading changes
- [x] Document before/after initial bundle results and affected routes (page routes lazy-load; initial entry is 62.9 kB, with cacheable vendor chunks)

## Phase 41: Release-Blocking Reliability Audit
- [x] Reproduce and trace the active-workout finish failure (completion could be blocked by non-critical side-effect writes)
- [x] Reproduce and trace the active-workout cancel failure (confirmation flow could leave users in the active overlay)
- [x] Reproduce and trace the 21-day free-trial premium access failure (Premium CTA only displayed a toast and never persisted activation)
- [x] Repair workout finish, cancel, and draft cleanup flows
- [x] Repair trial eligibility and premium feature gating flows
- [x] Audit all major programmes: onboarding, workouts, nutrition, progress, habits, library, gamification, social, profile, premium, recovery, notifications, referrals, and settings (19 programme smoke checks)
- [x] Add regression tests for every repaired failure path (5 release-blocker tests)
- [x] Run full browser and automated regression verification

## Phase 42: Premium Appearance Controls and Workout Completion Layout
- [x] Audit Premium font selection, button-style controls, and saved preference application
- [x] Add additional Premium-only font choices to Appearance
- [x] Verify Premium font and button-style changes persist and apply across the app
- [x] Center the active-workout completion action in the Finish Workout panel
- [x] Add regression tests and run browser, TypeScript, and production-build verification

## Phase 43: Durable Free-Trial Premium Access
- [x] Trace why a user who activates the 21-day trial can still see Start 21-Day Free Trial and locked Premium features
- [x] Persist and read a single durable trial status for the authenticated account
- [x] Prevent repeat trial activation and show active trial state on Premium
- [x] Verify Recovery and Appearance Premium gates unlock immediately after activation
- [x] Add regression tests and complete live browser, TypeScript, and production-build verification

## Phase 44: Profile Picture and Community Sharing
- [x] Audit profile-picture upload, storage, persistence, and profile rendering
- [x] Audit workout and progress sharing to the community feed
- [x] Repair any unavailable upload, sharing, visibility, or feedback paths
- [x] Add regression tests and verify profile update and community sharing live

## Phase 45: Approved Community Post and Initials Placeholder
- [x] Publish the user-approved “new pr” community update with the latest workout attached
- [x] Make the signed-in account initials a reliable temporary profile avatar placeholder
- [x] Verify the live post and initials placeholder, then run regression checks

## Phase 46: Privacy-Aware Advanced Workout Sharing
- [x] Audit workout history, personal-record, achievement, friendship, and feed data contracts
- [x] Add a selectable workout-history attachment with title, difficulty, public reflection, and private notes
- [x] Support showcasing eligible achievements and PRs from the selected workout
- [x] Add public, friends-only, and only-me audiences and enforce visibility server-side
- [x] Add regression tests and verify each sharing audience and visibility behavior live

## Phase 47: Official Deployment Visibility
- [x] Compare the official VYRO domain with the latest saved release
- [x] Confirm the publishing action required for the current checkpoint

## Phase 48: Published Manus Element Provenance Audit
- [x] Identify the exact source of the Made with Manus watermark without modifying code or configuration
- [x] Identify the exact source of the Make signing up easy link without modifying code or configuration

## Phase 49: Android Trusted Web Activity Readiness Audit
- [x] Inspect manifest, start URL, scope, display mode, icons, and service worker without modifying files
- [x] Verify current HTTPS availability, hosted authentication redirects, and Digital Asset Links route behavior
- [x] Determine whether Manus hosting can serve `/.well-known/assetlinks.json` and identify TWA packaging blockers

## Phase 50: Manus Space Digital Asset Links Hosting Investigation
- [x] Inspect the deployed well-known endpoint and current VYRO static routing without changing behavior
- [x] Research supported Manus Space mechanisms for static dotfiles, explicit routing, and JSON content headers
- [x] Determine whether any option can make the endpoint valid while leaving the current deployment unchanged

## Phase 51: Digital Asset Links Endpoint
- [x] Add a dedicated VYRO-controlled JSON configuration source for Digital Asset Links data
- [x] Register a production-safe GET `/.well-known/assetlinks.json` Express route before the SPA fallback
- [x] Add route regression coverage for exact path, HTTP 200, JSON content type, and response data
- [x] Verify development and production route behavior, TypeScript, and production build
- [ ] Resolve the pre-existing recovery-notification source assertion so the unrelated full regression suite can pass again
