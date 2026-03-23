import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { VyroThemeProvider } from "./contexts/VyroThemeContext";
import Home from "./pages/Home";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Workout from "./pages/Workout";
import Nutrition from "./pages/Nutrition";
import Progress from "./pages/Progress";
import Habits from "./pages/Habits";
import Library from "./pages/Library";
import Gamification from "./pages/Gamification";
import Social from "./pages/Social";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Premium from "./pages/Premium";
import Referral from "./pages/Referral";
import Friends from "./pages/Friends";
import WorkoutBuilder from "./pages/WorkoutBuilder";
import Tiers from "./pages/Tiers";
import Performance from "./pages/Performance";
import Appearance from "./pages/Appearance";
import AppLayout from "./components/AppLayout";

function Router() {
  return (
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
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" switchable>
        <VyroThemeProvider>
          <TooltipProvider>
            <Toaster position="top-center" richColors />
            <Router />
          </TooltipProvider>
        </VyroThemeProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
