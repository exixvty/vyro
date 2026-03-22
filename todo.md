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
- [ ] Referral rewards: 3 signups = 1 week free premium for referrer + all 3 friends
- [ ] Referral tracking in onboarding (detect ref code and track signup)
- [ ] Invite link integration in Social page


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
