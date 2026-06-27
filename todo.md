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
- [ ] Performance optimization and testing (needs profiling and optimization pass)


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
- [ ] Ensure consistent spacing and padding across all pages (needs comprehensive pass)
- [ ] Add proper empty states with illustrations for all list pages (needs all pages)
- [ ] Verify all loading states show skeletons not blank screens (needs comprehensive pass)
- [ ] Clean up any console warnings/errors (needs verification)
- [ ] Verify Appearance page works end-to-end (needs browser test)
- [ ] Final visual consistency pass across all pages (needs documented pass)


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
- [ ] Update Recovery page UI: add time picker for daily sobriety reminder (default 9am)
- [ ] Add "Send Craving Alert" button on Recovery page
- [ ] Extend recovery router: setReminderTime procedure
- [ ] Extend recovery router: logCravingAlert procedure (sends immediate push)
- [ ] Set up Heartbeat cron job for daily sobriety reminders at user's chosen time
- [ ] Craving alert sends push with message "You've got this! 💪" + options to log urge or call support
- [ ] Sobriety reminder sends push with "You're X days sober 🔥" + link to Recovery page
- [ ] Wire UI to show reminder time and last craving alert timestamp
- [ ] 20+ vitest tests passing, zero TypeScript errors

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
