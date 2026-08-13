import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import { lazy, Suspense } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { VyroThemeProvider } from "./contexts/VyroThemeContext";
import AppLayout from "./components/AppLayout";
import { XPToastProvider } from "./components/XPToastProvider";

const NotFound = lazy(() => import("@/pages/NotFound"));
const Home = lazy(() => import("@/pages/Home"));
const Onboarding = lazy(() => import("@/pages/Onboarding"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Workout = lazy(() => import("@/pages/Workout"));
const Nutrition = lazy(() => import("@/pages/Nutrition"));
const Progress = lazy(() => import("@/pages/Progress"));
const Habits = lazy(() => import("@/pages/Habits"));
const Library = lazy(() => import("@/pages/Library"));
const Gamification = lazy(() => import("@/pages/Gamification"));
const Social = lazy(() => import("@/pages/Social"));
const Profile = lazy(() => import("@/pages/Profile"));
const Settings = lazy(() => import("@/pages/Settings"));
const Premium = lazy(() => import("@/pages/Premium"));
const Referral = lazy(() => import("@/pages/Referral"));
const Friends = lazy(() => import("@/pages/Friends"));
const WorkoutBuilder = lazy(() => import("@/pages/WorkoutBuilder"));
const Tiers = lazy(() => import("@/pages/Tiers"));
const Performance = lazy(() => import("@/pages/Performance"));
const Appearance = lazy(() => import("@/pages/Appearance"));
const Notifications = lazy(() => import("@/pages/Notifications"));
const Recovery = lazy(() => import("@/pages/Recovery"));

function PageLoadingFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center animate-pulse">
          <span className="text-primary font-display font-bold">V</span>
        </div>
        <span className="text-sm">Loading VYRO…</span>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoadingFallback />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/onboarding" component={Onboarding} />
        <Route path="/dashboard">
          <AppLayout><Dashboard /></AppLayout>
        </Route>
        <Route path="/workout">
          <AppLayout><Workout /></AppLayout>
        </Route>
        <Route path="/workout/builder">
          <AppLayout><WorkoutBuilder /></AppLayout>
        </Route>
        <Route path="/nutrition">
          <AppLayout><Nutrition /></AppLayout>
        </Route>
        <Route path="/fuel">
          <AppLayout><Nutrition /></AppLayout>
        </Route>
        <Route path="/progress">
          <AppLayout><Progress /></AppLayout>
        </Route>
        <Route path="/habits">
          <AppLayout><Habits /></AppLayout>
        </Route>
        <Route path="/library">
          <AppLayout><Library /></AppLayout>
        </Route>
        <Route path="/gamification">
          <AppLayout><Gamification /></AppLayout>
        </Route>
        <Route path="/social">
          <AppLayout><Social /></AppLayout>
        </Route>
        <Route path="/profile">
          <AppLayout><Profile /></AppLayout>
        </Route>
        <Route path="/settings">
          <AppLayout><Settings /></AppLayout>
        </Route>
        <Route path="/premium" component={Premium} />
        <Route path="/referral">
          <AppLayout><Referral /></AppLayout>
        </Route>
        <Route path="/friends">
          <AppLayout><Friends /></AppLayout>
        </Route>
        <Route path="/tiers">
          <AppLayout><Tiers /></AppLayout>
        </Route>
        <Route path="/performance">
          <AppLayout><Performance /></AppLayout>
        </Route>
        <Route path="/appearance">
          <AppLayout><Appearance /></AppLayout>
        </Route>
        <Route path="/notifications">
          <AppLayout><Notifications /></AppLayout>
        </Route>
        <Route path="/recovery">
          <AppLayout><Recovery /></AppLayout>
        </Route>
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" switchable>
        <VyroThemeProvider>
          <XPToastProvider>
            <TooltipProvider>
              <Toaster position="top-center" richColors />
              <Router />
            </TooltipProvider>
          </XPToastProvider>
        </VyroThemeProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
