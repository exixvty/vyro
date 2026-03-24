import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useTheme, PRESET_THEMES, COLOR_MAP, FONT_MAP } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Palette, Type, Zap, Upload, Save, Loader2, Flame, Crown, Lock } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

const COLORS = Object.keys(COLOR_MAP);
const FONTS = Object.keys(FONT_MAP) as Array<keyof typeof FONT_MAP>;
const BUTTON_STYLES = ["solid", "outline", "gradient", "glassmorphism"] as const;

export default function Appearance() {
  const { customization, setCustomization } = useTheme();
  const { data: savedTheme } = trpc.theme.get.useQuery();
  const updateTheme = trpc.theme.upsert.useMutation();
  const applyPreset = trpc.theme.applyPreset.useMutation();

  const [local, setLocal] = useState(customization);
  const [isSaving, setIsSaving] = useState(false);
  const [, navigate] = useLocation();

  const { data: premiumData } = trpc.recovery.checkPremium.useQuery();
  const isPremium = premiumData?.isPremium;

  useEffect(() => {
    setLocal(customization);
  }, [customization]);

  const handleColorChange = (key: "primaryColor" | "accentColor" | "secondaryColor", value: string) => {
    const updated = { ...local, [key]: value };
    setLocal(updated);
    setCustomization(updated);
  };

  const handlePresetApply = async (presetName: string) => {
    try {
      await applyPreset.mutateAsync(presetName as any);
      const preset = PRESET_THEMES[presetName];
      const updated = { ...local, ...preset };
      setLocal(updated);
      setCustomization(updated);
      toast.success(`Applied "${presetName}" theme`);
    } catch (e) {
      toast.error("Failed to apply preset");
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateTheme.mutateAsync(local);
      // Sync saved preferences back into ThemeContext to apply live
      setCustomization(local);
      toast.success("Theme preferences saved!");
    } catch (e) {
      toast.error("Failed to save theme");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-nav">
      {/* Header */}
      <div className="px-5 pt-12 pb-6">
        <h1 className="text-2xl font-display font-bold text-foreground mb-1">Appearance</h1>
        <p className="text-sm text-muted-foreground">Customize colors, fonts, and branding</p>
      </div>

      {/* Live Preview */}
      <div className="px-5 mb-6">
        <div className="rounded-2xl border border-border overflow-hidden bg-card p-6">
          <p className="text-xs text-muted-foreground mb-3 font-semibold">LIVE PREVIEW</p>
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
              style={{ background: COLOR_MAP[local.primaryColor] || COLOR_MAP.violet }}
            >
              {local.appName.charAt(0)}
            </div>
            <div>
              <p className="font-display font-bold text-foreground">{local.appName}</p>
              <p className="text-xs text-muted-foreground">{local.presetTheme}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Preset Themes */}
      <div className="px-5 mb-6">
        <p className="text-xs text-muted-foreground mb-3 font-semibold">PRESET THEMES</p>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(PRESET_THEMES).map(([name, preset]) => (
            <button
              key={name}
              onClick={() => handlePresetApply(name as keyof typeof PRESET_THEMES)}
              className="p-3 rounded-lg border border-border bg-card hover:bg-card/80 transition-colors text-left"
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-6 h-6 rounded"
                  style={{ background: COLOR_MAP[preset.primaryColor || "violet"] }}
                />
                <div
                  className="w-6 h-6 rounded"
                  style={{ background: COLOR_MAP[preset.accentColor || "cyan"] }}
                />
                <div
                  className="w-6 h-6 rounded"
                  style={{ background: COLOR_MAP[preset.secondaryColor || "pink"] }}
                />
              </div>
              <p className="text-sm font-semibold text-foreground capitalize">{name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Color Customization */}
      <div className="px-5 mb-6">
        <p className="text-xs text-muted-foreground mb-3 font-semibold flex items-center gap-2">
          <Palette size={14} /> PRIMARY COLORS
        </p>
        <div className="space-y-4">
          {(["primaryColor", "accentColor", "secondaryColor"] as const).map((key) => (
            <div key={key}>
              <label className="text-sm font-medium text-foreground capitalize mb-2 block">
                {key.replace("Color", "")} Color
              </label>
              <div className="grid grid-cols-5 gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorChange(key, color)}
                    className={`w-full aspect-square rounded-lg border-2 transition-all ${
                      local[key] === color ? "border-foreground scale-110" : "border-border"
                    }`}
                    style={{ background: COLOR_MAP[color] }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Font Selection — Premium */}
      <div className="px-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-muted-foreground font-semibold flex items-center gap-2">
            <Type size={14} /> FONT FAMILY
          </p>
          {!isPremium && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-400/10 border border-yellow-400/20">
              <Crown size={10} className="text-yellow-400" />
              <span className="text-[10px] font-bold text-yellow-400">Pro</span>
            </div>
          )}
        </div>
        {!isPremium ? (
          <button onClick={() => navigate("/premium")}
            className="w-full p-4 rounded-xl border border-dashed border-yellow-400/30 bg-yellow-400/5 flex items-center gap-3 text-left hover:bg-yellow-400/10 transition-colors">
            <Lock size={16} className="text-yellow-400 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-foreground">Custom Fonts</p>
              <p className="text-xs text-muted-foreground">Upgrade to Premium to unlock font customization</p>
            </div>
            <Crown size={14} className="text-yellow-400 ml-auto shrink-0" />
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {FONTS.map((font) => (
              <button key={font} onClick={() => setLocal({ ...local, fontFamily: font as any })}
                className={`p-3 rounded-lg border-2 transition-all ${
                  local.fontFamily === font ? "border-primary bg-primary/10" : "border-border bg-card"
                }`}
                style={{ fontFamily: FONT_MAP[font] }}>
                <p className="text-sm font-semibold capitalize">{font.replace("-", " ")}</p>
                <p className="text-xs text-muted-foreground">Aa</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Button Style — Premium */}
      <div className="px-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-muted-foreground font-semibold flex items-center gap-2">
            <Zap size={14} /> BUTTON STYLE
          </p>
          {!isPremium && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-400/10 border border-yellow-400/20">
              <Crown size={10} className="text-yellow-400" />
              <span className="text-[10px] font-bold text-yellow-400">Pro</span>
            </div>
          )}
        </div>
        {!isPremium ? (
          <button onClick={() => navigate("/premium")}
            className="w-full p-4 rounded-xl border border-dashed border-yellow-400/30 bg-yellow-400/5 flex items-center gap-3 text-left hover:bg-yellow-400/10 transition-colors">
            <Lock size={16} className="text-yellow-400 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-foreground">Outline & Border Styles</p>
              <p className="text-xs text-muted-foreground">Upgrade to Premium to unlock button style customization</p>
            </div>
            <Crown size={14} className="text-yellow-400 ml-auto shrink-0" />
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {BUTTON_STYLES.map((style) => (
              <button key={style} onClick={() => setLocal({ ...local, buttonStyle: style })}
                className={`p-3 rounded-lg border-2 transition-all ${
                  local.buttonStyle === style ? "border-primary bg-primary/10" : "border-border bg-card"
                }`}>
                <p className="text-sm font-semibold capitalize mb-2">{style}</p>
                <div className={`px-3 py-1.5 rounded text-xs font-medium text-white ${
                  style === "solid" ? "bg-primary"
                    : style === "outline" ? "border border-primary text-primary bg-transparent"
                    : style === "gradient" ? "bg-gradient-to-r from-primary to-accent"
                    : "bg-primary/20 backdrop-blur border border-primary/50"
                }`}>Preview</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* App Name — Premium */}
      <div className="px-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-foreground">App Name & Logo</label>
          {!isPremium && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-400/10 border border-yellow-400/20">
              <Crown size={10} className="text-yellow-400" />
              <span className="text-[10px] font-bold text-yellow-400">Pro</span>
            </div>
          )}
        </div>
        {!isPremium ? (
          <button onClick={() => navigate("/premium")}
            className="w-full p-4 rounded-xl border border-dashed border-yellow-400/30 bg-yellow-400/5 flex items-center gap-3 text-left hover:bg-yellow-400/10 transition-colors">
            <Lock size={16} className="text-yellow-400 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-foreground">Custom App Name & Logo</p>
              <p className="text-xs text-muted-foreground">Upgrade to Premium to personalize your app identity</p>
            </div>
            <Crown size={14} className="text-yellow-400 ml-auto shrink-0" />
          </button>
        ) : (
          <input type="text" value={local.appName} onChange={(e) => setLocal({ ...local, appName: e.target.value })}
            className="w-full px-4 py-2 rounded-lg bg-card border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="VYRO" />
        )}
      </div>

      {/* Beast Mode Toggle */}
      <div className="px-5 mb-6">
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Flame size={20} className="text-orange-400" />
              <div>
                <p className="font-semibold text-foreground">Beast Mode</p>
                <p className="text-xs text-muted-foreground">2x XP rewards, harder workouts</p>
              </div>
            </div>
            <button
              onClick={() => setLocal({ ...local, beastModeActive: !local.beastModeActive })}
              className={`w-12 h-6 rounded-full transition-colors ${
                local.beastModeActive ? 'bg-orange-500' : 'bg-muted'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  local.beastModeActive ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="px-5 mb-6">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2"
        >
          {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {isSaving ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </div>
  );
}
