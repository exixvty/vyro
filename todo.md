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
