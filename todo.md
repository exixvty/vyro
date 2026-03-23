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
- [ ] Level-up animations and tier unlock messages (UI)
- [ ] Progress photo upload and side-by-side comparison (UI)
- [ ] Enhanced Dashboard: today screen, XP bar, streak, quick start button (UI)
- [ ] Smart notifications: motivational, non-spammy, toggleable (UI)
- [ ] Personalized motivation messages based on user goals (UI)
- [ ] Performance optimization and testing


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

## Phase 22: Level-Up Celebration Modal
- [ ] LevelUpModal component: full-screen confetti burst, tier badge reveal, XP summary
- [ ] Tier-up variant: special animation when crossing into a new tier (e.g. Rookie → Prospect)
- [ ] useLevelUp hook: detects XP threshold crossing, stores prev level in localStorage
- [ ] Wire into workout finish (highest XP event)
- [ ] Wire into habit completion and food log
- [ ] Global LevelUpModal mounted in AppLayout so any page can trigger it
- [ ] CSS keyframes: burst-scale, tier-glow-pulse, star-orbit animations


## Phase 23: Design Refresh (Black + Vibrant Minimalist)
- [x] Update index.css: black base (#0a0a0a), vibrant accent (neon cyan/electric blue), modern sans-serif
- [x] Redesign card styling: minimal borders, subtle shadows, clean spacing
- [x] Update button styling: sleek, modern, vibrant hover states
- [x] Refresh nav bar: minimal, dark, with vibrant active indicators
- [x] Update modal styling: clean backdrop, minimal borders
- [x] Refresh all page layouts: remove clutter, emphasize content hierarchy
- [x] Update icon colors and sizing for modern look
- [x] Test all pages for visual consistency
