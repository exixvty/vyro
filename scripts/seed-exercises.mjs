/**
 * Seed script: Insert all exercises into the database
 * Run with: node scripts/seed-exercises.mjs
 */
import { createConnection } from 'mysql2/promise';
import { config } from 'dotenv';

config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

function parseUrl(url) {
  const u = new URL(url);
  return {
    host: u.hostname,
    port: parseInt(u.port) || 3306,
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.slice(1),
    ssl: { rejectUnauthorized: false },
  };
}

const EXERCISES = [
  // ===== CHEST (40) =====
  { name: "Barbell Bench Press", category: "chest", type: "compound", difficulty: "beginner", equipment: ["barbell","bench"], description: "Classic horizontal pressing movement targeting the chest", muscleGroups: ["chest","triceps","shoulders"] },
  { name: "Dumbbell Bench Press", category: "chest", type: "compound", difficulty: "beginner", equipment: ["dumbbells","bench"], description: "Pressing with dumbbells for greater range of motion", muscleGroups: ["chest","triceps","shoulders"] },
  { name: "Incline Barbell Bench Press", category: "chest", type: "compound", difficulty: "intermediate", equipment: ["barbell","incline bench"], description: "Emphasizes upper chest development", muscleGroups: ["upper chest","shoulders","triceps"] },
  { name: "Incline Dumbbell Bench Press", category: "chest", type: "compound", difficulty: "intermediate", equipment: ["dumbbells","incline bench"], description: "Dumbbell variation for upper chest", muscleGroups: ["upper chest","shoulders","triceps"] },
  { name: "Decline Barbell Bench Press", category: "chest", type: "compound", difficulty: "intermediate", equipment: ["barbell","decline bench"], description: "Emphasizes lower chest", muscleGroups: ["lower chest","triceps"] },
  { name: "Decline Dumbbell Bench Press", category: "chest", type: "compound", difficulty: "intermediate", equipment: ["dumbbells","decline bench"], description: "Dumbbell variation for lower chest", muscleGroups: ["lower chest","triceps"] },
  { name: "Machine Chest Press", category: "chest", type: "compound", difficulty: "beginner", equipment: ["machine"], description: "Guided chest press on machine", muscleGroups: ["chest","triceps","shoulders"] },
  { name: "Chest Fly Machine", category: "chest", type: "isolation", difficulty: "beginner", equipment: ["machine"], description: "Isolates chest with guided motion", muscleGroups: ["chest"] },
  { name: "Dumbbell Chest Fly", category: "chest", type: "isolation", difficulty: "intermediate", equipment: ["dumbbells","bench"], description: "Free-weight chest fly for isolation", muscleGroups: ["chest"] },
  { name: "Cable Chest Fly", category: "chest", type: "isolation", difficulty: "intermediate", equipment: ["cable machine"], description: "Chest fly with constant cable tension", muscleGroups: ["chest"] },
  { name: "Push-ups", category: "chest", type: "compound", difficulty: "beginner", equipment: ["bodyweight"], description: "Bodyweight chest pressing movement", muscleGroups: ["chest","triceps","shoulders"] },
  { name: "Incline Push-ups", category: "chest", type: "compound", difficulty: "beginner", equipment: ["bodyweight"], description: "Easier variation of push-ups", muscleGroups: ["chest","triceps","shoulders"] },
  { name: "Decline Push-ups", category: "chest", type: "compound", difficulty: "advanced", equipment: ["bodyweight"], description: "Harder variation emphasizing upper chest", muscleGroups: ["upper chest","triceps","shoulders"] },
  { name: "Wide Grip Push-ups", category: "chest", type: "compound", difficulty: "intermediate", equipment: ["bodyweight"], description: "Wider hand placement for chest emphasis", muscleGroups: ["chest","shoulders"] },
  { name: "Close Grip Push-ups", category: "chest", type: "compound", difficulty: "intermediate", equipment: ["bodyweight"], description: "Narrower hand placement for triceps emphasis", muscleGroups: ["triceps","chest"] },
  { name: "Plyometric Push-ups", category: "chest", type: "compound", difficulty: "advanced", equipment: ["bodyweight"], description: "Explosive push-ups for power", muscleGroups: ["chest","triceps","shoulders"] },
  { name: "Pec Deck Machine", category: "chest", type: "isolation", difficulty: "beginner", equipment: ["machine"], description: "Machine-guided pec isolation", muscleGroups: ["chest"] },
  { name: "Smith Machine Bench Press", category: "chest", type: "compound", difficulty: "beginner", equipment: ["smith machine","bench"], description: "Guided barbell bench press", muscleGroups: ["chest","triceps","shoulders"] },
  { name: "Landmine Press", category: "chest", type: "compound", difficulty: "intermediate", equipment: ["landmine"], description: "Angled barbell press", muscleGroups: ["chest","triceps","shoulders"] },
  { name: "Machine Incline Press", category: "chest", type: "compound", difficulty: "beginner", equipment: ["machine"], description: "Machine incline chest press", muscleGroups: ["upper chest","shoulders","triceps"] },
  { name: "Machine Decline Press", category: "chest", type: "compound", difficulty: "beginner", equipment: ["machine"], description: "Machine decline chest press", muscleGroups: ["lower chest","triceps"] },
  { name: "Dumbbell Pullover", category: "chest", type: "isolation", difficulty: "intermediate", equipment: ["dumbbell","bench"], description: "Chest and back isolation movement", muscleGroups: ["chest","back"] },
  { name: "Cable Crossover", category: "chest", type: "isolation", difficulty: "intermediate", equipment: ["cable machine"], description: "Standing cable chest fly", muscleGroups: ["chest"] },
  { name: "Dumbbell Decline Fly", category: "chest", type: "isolation", difficulty: "intermediate", equipment: ["dumbbells","decline bench"], description: "Decline fly with dumbbells", muscleGroups: ["lower chest"] },
  { name: "Cable Incline Fly", category: "chest", type: "isolation", difficulty: "intermediate", equipment: ["cable machine"], description: "Cable incline fly for upper chest", muscleGroups: ["upper chest"] },
  { name: "Hammer Strength Chest Press", category: "chest", type: "compound", difficulty: "beginner", equipment: ["machine"], description: "Hammer strength chest press", muscleGroups: ["chest","triceps","shoulders"] },
  { name: "Floor Press", category: "chest", type: "compound", difficulty: "intermediate", equipment: ["barbell"], description: "Bench press from the floor", muscleGroups: ["chest","triceps"] },
  { name: "Dumbbell Floor Press", category: "chest", type: "compound", difficulty: "intermediate", equipment: ["dumbbells"], description: "Dumbbell press from the floor", muscleGroups: ["chest","triceps"] },
  { name: "Svend Press", category: "chest", type: "isolation", difficulty: "beginner", equipment: ["weight plate"], description: "Plate squeeze press for inner chest", muscleGroups: ["chest"] },
  { name: "Dips (Chest Focus)", category: "chest", type: "compound", difficulty: "intermediate", equipment: ["dip bars"], description: "Dips with forward lean for chest", muscleGroups: ["chest","triceps","shoulders"] },
  { name: "Ring Push-ups", category: "chest", type: "compound", difficulty: "advanced", equipment: ["gymnastic rings"], description: "Push-ups on unstable rings", muscleGroups: ["chest","triceps","shoulders"] },
  { name: "Weighted Push-ups", category: "chest", type: "compound", difficulty: "advanced", equipment: ["bodyweight","weight plate"], description: "Push-ups with added weight", muscleGroups: ["chest","triceps","shoulders"] },
  { name: "Cable Low-to-High Fly", category: "chest", type: "isolation", difficulty: "intermediate", equipment: ["cable machine"], description: "Low cable fly targeting upper chest", muscleGroups: ["upper chest"] },
  { name: "Cable High-to-Low Fly", category: "chest", type: "isolation", difficulty: "intermediate", equipment: ["cable machine"], description: "High cable fly targeting lower chest", muscleGroups: ["lower chest"] },
  { name: "Single Arm DB Chest Press", category: "chest", type: "compound", difficulty: "intermediate", equipment: ["dumbbell","bench"], description: "Unilateral dumbbell chest press", muscleGroups: ["chest","triceps","shoulders"] },
  { name: "Hex Press", category: "chest", type: "compound", difficulty: "intermediate", equipment: ["dumbbells","bench"], description: "Dumbbells pressed together for inner chest", muscleGroups: ["chest","triceps"] },
  { name: "Resistance Band Chest Press", category: "chest", type: "compound", difficulty: "beginner", equipment: ["resistance band"], description: "Chest press with bands", muscleGroups: ["chest","triceps","shoulders"] },
  { name: "Resistance Band Fly", category: "chest", type: "isolation", difficulty: "beginner", equipment: ["resistance band"], description: "Band chest fly", muscleGroups: ["chest"] },
  { name: "Iso-Lateral Chest Press", category: "chest", type: "compound", difficulty: "beginner", equipment: ["machine"], description: "Independent arm chest press", muscleGroups: ["chest","triceps","shoulders"] },
  { name: "Lever Chest Press", category: "chest", type: "compound", difficulty: "beginner", equipment: ["machine"], description: "Lever-based chest press machine", muscleGroups: ["chest","triceps","shoulders"] },

  // ===== BACK (40) =====
  { name: "Conventional Deadlift", category: "back", type: "compound", difficulty: "intermediate", equipment: ["barbell"], description: "Full-body pull from the floor", muscleGroups: ["back","glutes","hamstrings","traps"] },
  { name: "Sumo Deadlift", category: "back", type: "compound", difficulty: "intermediate", equipment: ["barbell"], description: "Wide-stance deadlift variation", muscleGroups: ["back","glutes","quads"] },
  { name: "Romanian Deadlift", category: "back", type: "compound", difficulty: "intermediate", equipment: ["barbell"], description: "Hip-hinge for posterior chain", muscleGroups: ["hamstrings","back","glutes"] },
  { name: "Trap Bar Deadlift", category: "back", type: "compound", difficulty: "beginner", equipment: ["trap bar"], description: "Deadlift with neutral grip trap bar", muscleGroups: ["back","glutes","quads"] },
  { name: "Pull-ups", category: "back", type: "compound", difficulty: "intermediate", equipment: ["pull-up bar"], description: "Bodyweight vertical pull", muscleGroups: ["lats","biceps","upper back"] },
  { name: "Chin-ups", category: "back", type: "compound", difficulty: "intermediate", equipment: ["pull-up bar"], description: "Supinated grip pull-ups", muscleGroups: ["lats","biceps","upper back"] },
  { name: "Wide Grip Pull-ups", category: "back", type: "compound", difficulty: "advanced", equipment: ["pull-up bar"], description: "Wide grip for lat emphasis", muscleGroups: ["lats","upper back"] },
  { name: "Neutral Grip Pull-ups", category: "back", type: "compound", difficulty: "intermediate", equipment: ["pull-up bar"], description: "Neutral grip pull-ups", muscleGroups: ["lats","biceps","upper back"] },
  { name: "Weighted Pull-ups", category: "back", type: "compound", difficulty: "advanced", equipment: ["pull-up bar","weight belt"], description: "Pull-ups with added weight", muscleGroups: ["lats","biceps","upper back"] },
  { name: "Lat Pulldown", category: "back", type: "compound", difficulty: "beginner", equipment: ["cable machine"], description: "Cable pulldown for lats", muscleGroups: ["lats","biceps"] },
  { name: "Close Grip Lat Pulldown", category: "back", type: "compound", difficulty: "beginner", equipment: ["cable machine"], description: "Close grip pulldown variation", muscleGroups: ["lats","biceps"] },
  { name: "Wide Grip Lat Pulldown", category: "back", type: "compound", difficulty: "beginner", equipment: ["cable machine"], description: "Wide grip pulldown for lat width", muscleGroups: ["lats","upper back"] },
  { name: "Reverse Grip Lat Pulldown", category: "back", type: "compound", difficulty: "beginner", equipment: ["cable machine"], description: "Underhand grip pulldown", muscleGroups: ["lats","biceps"] },
  { name: "Single Arm Lat Pulldown", category: "back", type: "compound", difficulty: "intermediate", equipment: ["cable machine"], description: "Unilateral lat pulldown", muscleGroups: ["lats","biceps"] },
  { name: "Barbell Bent-Over Row", category: "back", type: "compound", difficulty: "intermediate", equipment: ["barbell"], description: "Bent-over row for back thickness", muscleGroups: ["back","biceps","lats"] },
  { name: "Dumbbell Bent-Over Row", category: "back", type: "compound", difficulty: "beginner", equipment: ["dumbbells"], description: "Dumbbell row for back", muscleGroups: ["back","biceps","lats"] },
  { name: "Single Arm Dumbbell Row", category: "back", type: "compound", difficulty: "beginner", equipment: ["dumbbell","bench"], description: "One-arm dumbbell row", muscleGroups: ["lats","biceps","upper back"] },
  { name: "Pendlay Row", category: "back", type: "compound", difficulty: "advanced", equipment: ["barbell"], description: "Strict bent-over row from floor", muscleGroups: ["back","lats","biceps"] },
  { name: "T-Bar Row", category: "back", type: "compound", difficulty: "intermediate", equipment: ["t-bar machine"], description: "T-bar row for back thickness", muscleGroups: ["back","lats","biceps"] },
  { name: "Seated Cable Row", category: "back", type: "compound", difficulty: "beginner", equipment: ["cable machine"], description: "Seated row with cable", muscleGroups: ["back","biceps","lats"] },
  { name: "Machine Row", category: "back", type: "compound", difficulty: "beginner", equipment: ["machine"], description: "Machine-guided rowing motion", muscleGroups: ["back","biceps","lats"] },
  { name: "Chest Supported Row", category: "back", type: "compound", difficulty: "beginner", equipment: ["dumbbells","incline bench"], description: "Incline bench supported row", muscleGroups: ["back","biceps","rear delts"] },
  { name: "Meadows Row", category: "back", type: "compound", difficulty: "advanced", equipment: ["landmine"], description: "Landmine single arm row", muscleGroups: ["lats","upper back","biceps"] },
  { name: "Inverted Row", category: "back", type: "compound", difficulty: "beginner", equipment: ["barbell","rack"], description: "Bodyweight horizontal pull", muscleGroups: ["back","biceps"] },
  { name: "Cable Face Pull", category: "back", type: "isolation", difficulty: "beginner", equipment: ["cable machine"], description: "Face pulls for rear delts and upper back", muscleGroups: ["rear delts","upper back","traps"] },
  { name: "Barbell Shrug", category: "back", type: "isolation", difficulty: "beginner", equipment: ["barbell"], description: "Barbell shrugs for traps", muscleGroups: ["traps"] },
  { name: "Dumbbell Shrug", category: "back", type: "isolation", difficulty: "beginner", equipment: ["dumbbells"], description: "Dumbbell shrugs for traps", muscleGroups: ["traps"] },
  { name: "Rack Pull", category: "back", type: "compound", difficulty: "intermediate", equipment: ["barbell","rack"], description: "Partial deadlift from rack", muscleGroups: ["back","traps","glutes"] },
  { name: "Good Morning", category: "back", type: "compound", difficulty: "intermediate", equipment: ["barbell"], description: "Hip hinge with barbell on back", muscleGroups: ["back","hamstrings","glutes"] },
  { name: "Hyperextension", category: "back", type: "isolation", difficulty: "beginner", equipment: ["hyperextension bench"], description: "Back extension on bench", muscleGroups: ["back","glutes","hamstrings"] },
  { name: "Reverse Hyperextension", category: "back", type: "isolation", difficulty: "intermediate", equipment: ["machine"], description: "Reverse back extension", muscleGroups: ["back","glutes","hamstrings"] },
  { name: "Straight Arm Lat Pulldown", category: "back", type: "isolation", difficulty: "intermediate", equipment: ["cable machine"], description: "Straight arm pulldown for lats", muscleGroups: ["lats"] },
  { name: "Cable Pullover", category: "back", type: "isolation", difficulty: "intermediate", equipment: ["cable machine"], description: "Cable pullover for lats", muscleGroups: ["lats","chest"] },
  { name: "Seal Row", category: "back", type: "compound", difficulty: "intermediate", equipment: ["barbell","bench"], description: "Prone bench row for strict form", muscleGroups: ["back","lats","biceps"] },
  { name: "Kroc Row", category: "back", type: "compound", difficulty: "advanced", equipment: ["dumbbell"], description: "Heavy single arm row", muscleGroups: ["lats","upper back","biceps"] },
  { name: "Band Pull-Apart", category: "back", type: "isolation", difficulty: "beginner", equipment: ["resistance band"], description: "Band pull-apart for rear delts", muscleGroups: ["rear delts","upper back"] },
  { name: "Assisted Pull-ups", category: "back", type: "compound", difficulty: "beginner", equipment: ["assisted pull-up machine"], description: "Machine-assisted pull-ups", muscleGroups: ["lats","biceps","upper back"] },
  { name: "Smith Machine Row", category: "back", type: "compound", difficulty: "beginner", equipment: ["smith machine"], description: "Smith machine bent-over row", muscleGroups: ["back","biceps","lats"] },
  { name: "Trap Bar Shrug", category: "back", type: "isolation", difficulty: "beginner", equipment: ["trap bar"], description: "Trap bar shrugs", muscleGroups: ["traps"] },
  { name: "Close Grip Pull-ups", category: "back", type: "compound", difficulty: "intermediate", equipment: ["pull-up bar"], description: "Close grip for bicep emphasis", muscleGroups: ["lats","biceps"] },

  // ===== SHOULDERS (34) =====
  { name: "Overhead Press (Barbell)", category: "shoulders", type: "compound", difficulty: "intermediate", equipment: ["barbell"], description: "Standing barbell overhead press", muscleGroups: ["shoulders","triceps"] },
  { name: "Seated Dumbbell Press", category: "shoulders", type: "compound", difficulty: "beginner", equipment: ["dumbbells","bench"], description: "Seated dumbbell shoulder press", muscleGroups: ["shoulders","triceps"] },
  { name: "Arnold Press", category: "shoulders", type: "compound", difficulty: "intermediate", equipment: ["dumbbells"], description: "Rotating dumbbell press", muscleGroups: ["shoulders","triceps"] },
  { name: "Machine Shoulder Press", category: "shoulders", type: "compound", difficulty: "beginner", equipment: ["machine"], description: "Machine-guided shoulder press", muscleGroups: ["shoulders","triceps"] },
  { name: "Smith Machine Overhead Press", category: "shoulders", type: "compound", difficulty: "beginner", equipment: ["smith machine"], description: "Guided overhead press", muscleGroups: ["shoulders","triceps"] },
  { name: "Push Press", category: "shoulders", type: "compound", difficulty: "intermediate", equipment: ["barbell"], description: "Overhead press with leg drive", muscleGroups: ["shoulders","triceps","legs"] },
  { name: "Dumbbell Lateral Raise", category: "shoulders", type: "isolation", difficulty: "beginner", equipment: ["dumbbells"], description: "Side raises for lateral delts", muscleGroups: ["lateral delts"] },
  { name: "Cable Lateral Raise", category: "shoulders", type: "isolation", difficulty: "beginner", equipment: ["cable machine"], description: "Cable side raise", muscleGroups: ["lateral delts"] },
  { name: "Machine Lateral Raise", category: "shoulders", type: "isolation", difficulty: "beginner", equipment: ["machine"], description: "Machine lateral raise", muscleGroups: ["lateral delts"] },
  { name: "Dumbbell Front Raise", category: "shoulders", type: "isolation", difficulty: "beginner", equipment: ["dumbbells"], description: "Front raises for anterior delts", muscleGroups: ["front delts"] },
  { name: "Cable Front Raise", category: "shoulders", type: "isolation", difficulty: "beginner", equipment: ["cable machine"], description: "Cable front raise", muscleGroups: ["front delts"] },
  { name: "Plate Front Raise", category: "shoulders", type: "isolation", difficulty: "beginner", equipment: ["weight plate"], description: "Front raise with plate", muscleGroups: ["front delts"] },
  { name: "Dumbbell Rear Delt Fly", category: "shoulders", type: "isolation", difficulty: "beginner", equipment: ["dumbbells"], description: "Bent-over rear delt fly", muscleGroups: ["rear delts"] },
  { name: "Cable Rear Delt Fly", category: "shoulders", type: "isolation", difficulty: "beginner", equipment: ["cable machine"], description: "Cable rear delt fly", muscleGroups: ["rear delts"] },
  { name: "Reverse Pec Deck", category: "shoulders", type: "isolation", difficulty: "beginner", equipment: ["machine"], description: "Reverse pec deck for rear delts", muscleGroups: ["rear delts"] },
  { name: "Barbell Upright Row", category: "shoulders", type: "compound", difficulty: "intermediate", equipment: ["barbell"], description: "Upright row for shoulders and traps", muscleGroups: ["shoulders","traps"] },
  { name: "Dumbbell Upright Row", category: "shoulders", type: "compound", difficulty: "intermediate", equipment: ["dumbbells"], description: "Dumbbell upright row", muscleGroups: ["shoulders","traps"] },
  { name: "Cable Upright Row", category: "shoulders", type: "compound", difficulty: "intermediate", equipment: ["cable machine"], description: "Cable upright row", muscleGroups: ["shoulders","traps"] },
  { name: "Lu Raise", category: "shoulders", type: "isolation", difficulty: "intermediate", equipment: ["dumbbells"], description: "Front to lateral raise combo", muscleGroups: ["front delts","lateral delts"] },
  { name: "Handstand Push-ups", category: "shoulders", type: "compound", difficulty: "advanced", equipment: ["bodyweight"], description: "Inverted bodyweight press", muscleGroups: ["shoulders","triceps"] },
  { name: "Pike Push-ups", category: "shoulders", type: "compound", difficulty: "intermediate", equipment: ["bodyweight"], description: "Pike position push-ups for shoulders", muscleGroups: ["shoulders","triceps"] },
  { name: "Z Press", category: "shoulders", type: "compound", difficulty: "advanced", equipment: ["barbell"], description: "Seated floor overhead press", muscleGroups: ["shoulders","triceps","core"] },
  { name: "Behind the Neck Press", category: "shoulders", type: "compound", difficulty: "advanced", equipment: ["barbell"], description: "Behind neck overhead press", muscleGroups: ["shoulders","triceps"] },
  { name: "Kettlebell Press", category: "shoulders", type: "compound", difficulty: "intermediate", equipment: ["kettlebell"], description: "Kettlebell overhead press", muscleGroups: ["shoulders","triceps"] },
  { name: "Dumbbell Y Raise", category: "shoulders", type: "isolation", difficulty: "intermediate", equipment: ["dumbbells"], description: "Y-shaped raise for shoulders", muscleGroups: ["shoulders","upper back"] },
  { name: "Dumbbell W Raise", category: "shoulders", type: "isolation", difficulty: "intermediate", equipment: ["dumbbells"], description: "W-shaped raise for rear delts", muscleGroups: ["rear delts","upper back"] },
  { name: "Seated Barbell Press", category: "shoulders", type: "compound", difficulty: "intermediate", equipment: ["barbell","bench"], description: "Seated barbell overhead press", muscleGroups: ["shoulders","triceps"] },
  { name: "Bradford Press", category: "shoulders", type: "compound", difficulty: "advanced", equipment: ["barbell"], description: "Front to behind neck press", muscleGroups: ["shoulders","triceps"] },
  { name: "Resistance Band Shoulder Press", category: "shoulders", type: "compound", difficulty: "beginner", equipment: ["resistance band"], description: "Shoulder press with bands", muscleGroups: ["shoulders","triceps"] },
  { name: "Resistance Band Lateral Raise", category: "shoulders", type: "isolation", difficulty: "beginner", equipment: ["resistance band"], description: "Lateral raise with bands", muscleGroups: ["lateral delts"] },
  { name: "Bus Driver", category: "shoulders", type: "isolation", difficulty: "intermediate", equipment: ["weight plate"], description: "Plate rotation for shoulder endurance", muscleGroups: ["shoulders"] },
  { name: "Scarecrow", category: "shoulders", type: "isolation", difficulty: "beginner", equipment: ["dumbbells"], description: "External rotation for rotator cuff", muscleGroups: ["rear delts","rotator cuff"] },
  { name: "Landmine Lateral Raise", category: "shoulders", type: "isolation", difficulty: "intermediate", equipment: ["landmine"], description: "Landmine lateral raise", muscleGroups: ["lateral delts"] },
  { name: "Single Arm DB Shoulder Press", category: "shoulders", type: "compound", difficulty: "intermediate", equipment: ["dumbbell"], description: "Unilateral shoulder press", muscleGroups: ["shoulders","triceps","core"] },

  // ===== BICEPS (26) =====
  { name: "Barbell Curl", category: "biceps", type: "isolation", difficulty: "beginner", equipment: ["barbell"], description: "Classic barbell bicep curl", muscleGroups: ["biceps"] },
  { name: "EZ Bar Curl", category: "biceps", type: "isolation", difficulty: "beginner", equipment: ["EZ bar"], description: "EZ bar curl for wrist comfort", muscleGroups: ["biceps"] },
  { name: "Dumbbell Curl", category: "biceps", type: "isolation", difficulty: "beginner", equipment: ["dumbbells"], description: "Standard dumbbell bicep curl", muscleGroups: ["biceps"] },
  { name: "Hammer Curl", category: "biceps", type: "isolation", difficulty: "beginner", equipment: ["dumbbells"], description: "Neutral grip curl for brachialis", muscleGroups: ["biceps","forearms"] },
  { name: "Incline Dumbbell Curl", category: "biceps", type: "isolation", difficulty: "intermediate", equipment: ["dumbbells","incline bench"], description: "Incline curl for long head stretch", muscleGroups: ["biceps"] },
  { name: "Preacher Curl (Barbell)", category: "biceps", type: "isolation", difficulty: "beginner", equipment: ["barbell","preacher bench"], description: "Barbell preacher curl", muscleGroups: ["biceps"] },
  { name: "Preacher Curl (Dumbbell)", category: "biceps", type: "isolation", difficulty: "beginner", equipment: ["dumbbell","preacher bench"], description: "Dumbbell preacher curl", muscleGroups: ["biceps"] },
  { name: "Preacher Curl (EZ Bar)", category: "biceps", type: "isolation", difficulty: "beginner", equipment: ["EZ bar","preacher bench"], description: "EZ bar preacher curl", muscleGroups: ["biceps"] },
  { name: "Concentration Curl", category: "biceps", type: "isolation", difficulty: "beginner", equipment: ["dumbbell"], description: "Seated concentration curl", muscleGroups: ["biceps"] },
  { name: "Cable Curl", category: "biceps", type: "isolation", difficulty: "beginner", equipment: ["cable machine"], description: "Cable bicep curl", muscleGroups: ["biceps"] },
  { name: "Cable Hammer Curl", category: "biceps", type: "isolation", difficulty: "beginner", equipment: ["cable machine","rope attachment"], description: "Cable hammer curl with rope", muscleGroups: ["biceps","forearms"] },
  { name: "Spider Curl", category: "biceps", type: "isolation", difficulty: "intermediate", equipment: ["barbell","incline bench"], description: "Prone incline curl", muscleGroups: ["biceps"] },
  { name: "Cross Body Hammer Curl", category: "biceps", type: "isolation", difficulty: "beginner", equipment: ["dumbbells"], description: "Cross body hammer curl", muscleGroups: ["biceps","forearms"] },
  { name: "Zottman Curl", category: "biceps", type: "isolation", difficulty: "intermediate", equipment: ["dumbbells"], description: "Curl up supinated, lower pronated", muscleGroups: ["biceps","forearms"] },
  { name: "Reverse Curl (Barbell)", category: "biceps", type: "isolation", difficulty: "intermediate", equipment: ["barbell"], description: "Overhand grip barbell curl", muscleGroups: ["biceps","forearms"] },
  { name: "Reverse Curl (EZ Bar)", category: "biceps", type: "isolation", difficulty: "intermediate", equipment: ["EZ bar"], description: "Overhand grip EZ bar curl", muscleGroups: ["biceps","forearms"] },
  { name: "21s Bicep Curl", category: "biceps", type: "isolation", difficulty: "intermediate", equipment: ["barbell"], description: "7 bottom, 7 top, 7 full reps", muscleGroups: ["biceps"] },
  { name: "Machine Bicep Curl", category: "biceps", type: "isolation", difficulty: "beginner", equipment: ["machine"], description: "Machine-guided bicep curl", muscleGroups: ["biceps"] },
  { name: "Drag Curl", category: "biceps", type: "isolation", difficulty: "intermediate", equipment: ["barbell"], description: "Barbell drag curl along body", muscleGroups: ["biceps"] },
  { name: "Bayesian Curl", category: "biceps", type: "isolation", difficulty: "intermediate", equipment: ["cable machine"], description: "Cable curl behind body for stretch", muscleGroups: ["biceps"] },
  { name: "Resistance Band Curl", category: "biceps", type: "isolation", difficulty: "beginner", equipment: ["resistance band"], description: "Bicep curl with band", muscleGroups: ["biceps"] },
  { name: "Alternating Dumbbell Curl", category: "biceps", type: "isolation", difficulty: "beginner", equipment: ["dumbbells"], description: "Alternating arm dumbbell curls", muscleGroups: ["biceps"] },
  { name: "Seated Dumbbell Curl", category: "biceps", type: "isolation", difficulty: "beginner", equipment: ["dumbbells","bench"], description: "Seated dumbbell bicep curl", muscleGroups: ["biceps"] },
  { name: "Cable Preacher Curl", category: "biceps", type: "isolation", difficulty: "beginner", equipment: ["cable machine","preacher bench"], description: "Cable preacher curl", muscleGroups: ["biceps"] },
  { name: "High Cable Curl", category: "biceps", type: "isolation", difficulty: "intermediate", equipment: ["cable machine"], description: "Overhead cable curl", muscleGroups: ["biceps"] },
  { name: "Chin-up (Bicep Focus)", category: "biceps", type: "compound", difficulty: "intermediate", equipment: ["pull-up bar"], description: "Chin-ups emphasizing biceps", muscleGroups: ["biceps","lats"] },

  // ===== TRICEPS (24) =====
  { name: "Close Grip Bench Press", category: "triceps", type: "compound", difficulty: "intermediate", equipment: ["barbell","bench"], description: "Narrow grip bench for triceps", muscleGroups: ["triceps","chest"] },
  { name: "Tricep Dips", category: "triceps", type: "compound", difficulty: "intermediate", equipment: ["dip bars"], description: "Bodyweight dips for triceps", muscleGroups: ["triceps","chest","shoulders"] },
  { name: "Bench Dips", category: "triceps", type: "compound", difficulty: "beginner", equipment: ["bench"], description: "Dips using a bench", muscleGroups: ["triceps"] },
  { name: "Weighted Dips", category: "triceps", type: "compound", difficulty: "advanced", equipment: ["dip bars","weight belt"], description: "Dips with added weight", muscleGroups: ["triceps","chest","shoulders"] },
  { name: "Skull Crushers (Barbell)", category: "triceps", type: "isolation", difficulty: "intermediate", equipment: ["barbell","bench"], description: "Lying tricep extension", muscleGroups: ["triceps"] },
  { name: "Skull Crushers (EZ Bar)", category: "triceps", type: "isolation", difficulty: "intermediate", equipment: ["EZ bar","bench"], description: "EZ bar lying tricep extension", muscleGroups: ["triceps"] },
  { name: "Skull Crushers (Dumbbell)", category: "triceps", type: "isolation", difficulty: "intermediate", equipment: ["dumbbells","bench"], description: "Dumbbell lying tricep extension", muscleGroups: ["triceps"] },
  { name: "Cable Tricep Pushdown", category: "triceps", type: "isolation", difficulty: "beginner", equipment: ["cable machine"], description: "Cable pushdown for triceps", muscleGroups: ["triceps"] },
  { name: "Rope Tricep Pushdown", category: "triceps", type: "isolation", difficulty: "beginner", equipment: ["cable machine","rope attachment"], description: "Rope pushdown for triceps", muscleGroups: ["triceps"] },
  { name: "V-Bar Tricep Pushdown", category: "triceps", type: "isolation", difficulty: "beginner", equipment: ["cable machine","v-bar"], description: "V-bar pushdown for triceps", muscleGroups: ["triceps"] },
  { name: "Overhead Tricep Extension (DB)", category: "triceps", type: "isolation", difficulty: "beginner", equipment: ["dumbbell"], description: "Overhead dumbbell tricep extension", muscleGroups: ["triceps"] },
  { name: "Overhead Tricep Extension (Cable)", category: "triceps", type: "isolation", difficulty: "beginner", equipment: ["cable machine"], description: "Overhead cable tricep extension", muscleGroups: ["triceps"] },
  { name: "Overhead Tricep Extension (BB)", category: "triceps", type: "isolation", difficulty: "intermediate", equipment: ["barbell"], description: "Overhead barbell tricep extension", muscleGroups: ["triceps"] },
  { name: "Tricep Kickback", category: "triceps", type: "isolation", difficulty: "beginner", equipment: ["dumbbell"], description: "Dumbbell tricep kickback", muscleGroups: ["triceps"] },
  { name: "Cable Tricep Kickback", category: "triceps", type: "isolation", difficulty: "beginner", equipment: ["cable machine"], description: "Cable tricep kickback", muscleGroups: ["triceps"] },
  { name: "Diamond Push-ups", category: "triceps", type: "compound", difficulty: "intermediate", equipment: ["bodyweight"], description: "Close hand push-ups for triceps", muscleGroups: ["triceps","chest"] },
  { name: "JM Press", category: "triceps", type: "compound", difficulty: "advanced", equipment: ["barbell","bench"], description: "Hybrid bench press and skull crusher", muscleGroups: ["triceps","chest"] },
  { name: "Tate Press", category: "triceps", type: "isolation", difficulty: "intermediate", equipment: ["dumbbells","bench"], description: "Elbows-out dumbbell extension", muscleGroups: ["triceps"] },
  { name: "French Press", category: "triceps", type: "isolation", difficulty: "intermediate", equipment: ["EZ bar"], description: "Standing EZ bar tricep extension", muscleGroups: ["triceps"] },
  { name: "Machine Tricep Extension", category: "triceps", type: "isolation", difficulty: "beginner", equipment: ["machine"], description: "Machine-guided tricep extension", muscleGroups: ["triceps"] },
  { name: "Single Arm Cable Pushdown", category: "triceps", type: "isolation", difficulty: "beginner", equipment: ["cable machine"], description: "Unilateral cable pushdown", muscleGroups: ["triceps"] },
  { name: "Resistance Band Tricep Extension", category: "triceps", type: "isolation", difficulty: "beginner", equipment: ["resistance band"], description: "Band overhead tricep extension", muscleGroups: ["triceps"] },
  { name: "Bodyweight Tricep Extension", category: "triceps", type: "isolation", difficulty: "intermediate", equipment: ["bodyweight","bar"], description: "Bodyweight skull crusher on bar", muscleGroups: ["triceps"] },
  { name: "Cable Overhead Extension (Rope)", category: "triceps", type: "isolation", difficulty: "beginner", equipment: ["cable machine","rope attachment"], description: "Overhead rope cable extension", muscleGroups: ["triceps"] },

  // ===== FOREARMS (15) =====
  { name: "Barbell Wrist Curl", category: "forearms", type: "isolation", difficulty: "beginner", equipment: ["barbell"], description: "Wrist curl for forearm flexors", muscleGroups: ["forearms"] },
  { name: "Dumbbell Wrist Curl", category: "forearms", type: "isolation", difficulty: "beginner", equipment: ["dumbbell"], description: "Dumbbell wrist curl", muscleGroups: ["forearms"] },
  { name: "Reverse Wrist Curl (BB)", category: "forearms", type: "isolation", difficulty: "beginner", equipment: ["barbell"], description: "Reverse wrist curl for extensors", muscleGroups: ["forearms"] },
  { name: "Reverse Wrist Curl (DB)", category: "forearms", type: "isolation", difficulty: "beginner", equipment: ["dumbbell"], description: "Dumbbell reverse wrist curl", muscleGroups: ["forearms"] },
  { name: "Farmer's Walk", category: "forearms", type: "functional", difficulty: "beginner", equipment: ["dumbbells"], description: "Loaded carry for grip strength", muscleGroups: ["forearms","traps","core"] },
  { name: "Plate Pinch Hold", category: "forearms", type: "isolation", difficulty: "intermediate", equipment: ["weight plate"], description: "Pinch grip plate hold", muscleGroups: ["forearms"] },
  { name: "Dead Hang", category: "forearms", type: "isolation", difficulty: "beginner", equipment: ["pull-up bar"], description: "Hanging from bar for grip", muscleGroups: ["forearms"] },
  { name: "Towel Pull-ups", category: "forearms", type: "compound", difficulty: "advanced", equipment: ["pull-up bar","towel"], description: "Pull-ups gripping a towel", muscleGroups: ["forearms","lats","biceps"] },
  { name: "Wrist Roller", category: "forearms", type: "isolation", difficulty: "intermediate", equipment: ["wrist roller"], description: "Rolling weight up and down", muscleGroups: ["forearms"] },
  { name: "Gripper", category: "forearms", type: "isolation", difficulty: "beginner", equipment: ["hand gripper"], description: "Hand gripper for crush grip", muscleGroups: ["forearms"] },
  { name: "Behind the Back Wrist Curl", category: "forearms", type: "isolation", difficulty: "intermediate", equipment: ["barbell"], description: "Wrist curl behind back", muscleGroups: ["forearms"] },
  { name: "Finger Curl", category: "forearms", type: "isolation", difficulty: "beginner", equipment: ["barbell"], description: "Finger curl for grip strength", muscleGroups: ["forearms"] },
  { name: "Pronation/Supination", category: "forearms", type: "isolation", difficulty: "beginner", equipment: ["dumbbell"], description: "Forearm rotation exercise", muscleGroups: ["forearms"] },
  { name: "Reverse Barbell Curl", category: "forearms", type: "isolation", difficulty: "intermediate", equipment: ["barbell"], description: "Overhand grip curl for forearms", muscleGroups: ["forearms","biceps"] },
  { name: "Farmer's Walk (Trap Bar)", category: "forearms", type: "functional", difficulty: "beginner", equipment: ["trap bar"], description: "Trap bar farmer's walk", muscleGroups: ["forearms","traps","core"] },

  // ===== LEGS (42) =====
  { name: "Barbell Back Squat", category: "legs", type: "compound", difficulty: "intermediate", equipment: ["barbell","squat rack"], description: "King of leg exercises", muscleGroups: ["quads","glutes","hamstrings"] },
  { name: "Barbell Front Squat", category: "legs", type: "compound", difficulty: "advanced", equipment: ["barbell","squat rack"], description: "Front-loaded squat for quads", muscleGroups: ["quads","core","glutes"] },
  { name: "Goblet Squat", category: "legs", type: "compound", difficulty: "beginner", equipment: ["dumbbell"], description: "Dumbbell held at chest squat", muscleGroups: ["quads","glutes"] },
  { name: "Leg Press", category: "legs", type: "compound", difficulty: "beginner", equipment: ["leg press machine"], description: "Machine leg press", muscleGroups: ["quads","glutes","hamstrings"] },
  { name: "Hack Squat", category: "legs", type: "compound", difficulty: "intermediate", equipment: ["hack squat machine"], description: "Machine hack squat", muscleGroups: ["quads","glutes"] },
  { name: "Smith Machine Squat", category: "legs", type: "compound", difficulty: "beginner", equipment: ["smith machine"], description: "Guided squat on smith machine", muscleGroups: ["quads","glutes"] },
  { name: "Bulgarian Split Squat", category: "legs", type: "compound", difficulty: "intermediate", equipment: ["dumbbells","bench"], description: "Rear-foot elevated split squat", muscleGroups: ["quads","glutes"] },
  { name: "Walking Lunges", category: "legs", type: "compound", difficulty: "beginner", equipment: ["dumbbells"], description: "Walking forward lunges", muscleGroups: ["quads","glutes","hamstrings"] },
  { name: "Reverse Lunges", category: "legs", type: "compound", difficulty: "beginner", equipment: ["dumbbells"], description: "Stepping backward lunges", muscleGroups: ["quads","glutes"] },
  { name: "Lateral Lunges", category: "legs", type: "compound", difficulty: "intermediate", equipment: ["dumbbells"], description: "Side-stepping lunges", muscleGroups: ["quads","glutes","adductors"] },
  { name: "Barbell Lunges", category: "legs", type: "compound", difficulty: "intermediate", equipment: ["barbell"], description: "Barbell loaded lunges", muscleGroups: ["quads","glutes","hamstrings"] },
  { name: "Step-ups", category: "legs", type: "compound", difficulty: "beginner", equipment: ["dumbbells","box"], description: "Stepping up onto a box", muscleGroups: ["quads","glutes"] },
  { name: "Leg Extension", category: "legs", type: "isolation", difficulty: "beginner", equipment: ["leg extension machine"], description: "Machine leg extension for quads", muscleGroups: ["quads"] },
  { name: "Leg Curl (Lying)", category: "legs", type: "isolation", difficulty: "beginner", equipment: ["leg curl machine"], description: "Lying leg curl for hamstrings", muscleGroups: ["hamstrings"] },
  { name: "Leg Curl (Seated)", category: "legs", type: "isolation", difficulty: "beginner", equipment: ["leg curl machine"], description: "Seated leg curl for hamstrings", muscleGroups: ["hamstrings"] },
  { name: "Leg Curl (Standing)", category: "legs", type: "isolation", difficulty: "beginner", equipment: ["leg curl machine"], description: "Standing single leg curl", muscleGroups: ["hamstrings"] },
  { name: "Calf Raise (Standing)", category: "legs", type: "isolation", difficulty: "beginner", equipment: ["calf raise machine"], description: "Standing calf raise", muscleGroups: ["calves"] },
  { name: "Calf Raise (Seated)", category: "legs", type: "isolation", difficulty: "beginner", equipment: ["seated calf machine"], description: "Seated calf raise", muscleGroups: ["calves"] },
  { name: "Calf Raise (Smith Machine)", category: "legs", type: "isolation", difficulty: "beginner", equipment: ["smith machine"], description: "Smith machine calf raise", muscleGroups: ["calves"] },
  { name: "Donkey Calf Raise", category: "legs", type: "isolation", difficulty: "intermediate", equipment: ["machine"], description: "Donkey calf raise", muscleGroups: ["calves"] },
  { name: "Single Leg Calf Raise", category: "legs", type: "isolation", difficulty: "beginner", equipment: ["bodyweight"], description: "Single leg bodyweight calf raise", muscleGroups: ["calves"] },
  { name: "Leg Press Calf Raise", category: "legs", type: "isolation", difficulty: "beginner", equipment: ["leg press machine"], description: "Calf raise on leg press", muscleGroups: ["calves"] },
  { name: "Sissy Squat", category: "legs", type: "isolation", difficulty: "advanced", equipment: ["bodyweight"], description: "Leaning back squat for quads", muscleGroups: ["quads"] },
  { name: "Pistol Squat", category: "legs", type: "compound", difficulty: "advanced", equipment: ["bodyweight"], description: "Single leg squat", muscleGroups: ["quads","glutes"] },
  { name: "Box Squat", category: "legs", type: "compound", difficulty: "intermediate", equipment: ["barbell","box"], description: "Squat to a box", muscleGroups: ["quads","glutes","hamstrings"] },
  { name: "Pause Squat", category: "legs", type: "compound", difficulty: "advanced", equipment: ["barbell","squat rack"], description: "Squat with pause at bottom", muscleGroups: ["quads","glutes"] },
  { name: "Safety Bar Squat", category: "legs", type: "compound", difficulty: "intermediate", equipment: ["safety squat bar","squat rack"], description: "Squat with safety bar", muscleGroups: ["quads","glutes","hamstrings"] },
  { name: "Belt Squat", category: "legs", type: "compound", difficulty: "intermediate", equipment: ["belt squat machine"], description: "Squat with belt-loaded weight", muscleGroups: ["quads","glutes"] },
  { name: "Pendulum Squat", category: "legs", type: "compound", difficulty: "intermediate", equipment: ["machine"], description: "Pendulum squat machine", muscleGroups: ["quads","glutes"] },
  { name: "Wall Sit", category: "legs", type: "isolation", difficulty: "beginner", equipment: ["bodyweight"], description: "Isometric wall squat hold", muscleGroups: ["quads"] },
  { name: "Nordic Hamstring Curl", category: "legs", type: "isolation", difficulty: "advanced", equipment: ["bodyweight"], description: "Eccentric hamstring curl", muscleGroups: ["hamstrings"] },
  { name: "Glute Ham Raise", category: "legs", type: "compound", difficulty: "advanced", equipment: ["GHD machine"], description: "Glute ham raise on GHD", muscleGroups: ["hamstrings","glutes"] },
  { name: "Adductor Machine", category: "legs", type: "isolation", difficulty: "beginner", equipment: ["machine"], description: "Inner thigh adductor machine", muscleGroups: ["adductors"] },
  { name: "Abductor Machine", category: "legs", type: "isolation", difficulty: "beginner", equipment: ["machine"], description: "Outer thigh abductor machine", muscleGroups: ["abductors","glutes"] },
  { name: "Sumo Squat", category: "legs", type: "compound", difficulty: "beginner", equipment: ["dumbbell"], description: "Wide stance squat", muscleGroups: ["quads","glutes","adductors"] },
  { name: "Bodyweight Squat", category: "legs", type: "compound", difficulty: "beginner", equipment: ["bodyweight"], description: "Basic bodyweight squat", muscleGroups: ["quads","glutes"] },
  { name: "Jump Squat", category: "legs", type: "compound", difficulty: "intermediate", equipment: ["bodyweight"], description: "Explosive squat with jump", muscleGroups: ["quads","glutes","calves"] },
  { name: "Dumbbell Romanian Deadlift", category: "legs", type: "compound", difficulty: "beginner", equipment: ["dumbbells"], description: "Dumbbell RDL for hamstrings", muscleGroups: ["hamstrings","glutes","back"] },
  { name: "Single Leg Romanian Deadlift", category: "legs", type: "compound", difficulty: "intermediate", equipment: ["dumbbell"], description: "Unilateral RDL", muscleGroups: ["hamstrings","glutes"] },
  { name: "Stiff Leg Deadlift", category: "legs", type: "compound", difficulty: "intermediate", equipment: ["barbell"], description: "Straight leg deadlift", muscleGroups: ["hamstrings","back","glutes"] },
  { name: "Deficit Deadlift", category: "legs", type: "compound", difficulty: "advanced", equipment: ["barbell"], description: "Deadlift from elevated platform", muscleGroups: ["hamstrings","back","glutes"] },
  { name: "Zercher Squat", category: "legs", type: "compound", difficulty: "advanced", equipment: ["barbell"], description: "Barbell held in elbow crease", muscleGroups: ["quads","glutes","core"] },

  // ===== GLUTES (20) =====
  { name: "Barbell Hip Thrust", category: "glutes", type: "compound", difficulty: "intermediate", equipment: ["barbell","bench"], description: "Hip thrust for glute activation", muscleGroups: ["glutes","hamstrings"] },
  { name: "Dumbbell Hip Thrust", category: "glutes", type: "compound", difficulty: "beginner", equipment: ["dumbbell","bench"], description: "Dumbbell hip thrust", muscleGroups: ["glutes","hamstrings"] },
  { name: "Single Leg Hip Thrust", category: "glutes", type: "compound", difficulty: "intermediate", equipment: ["bench"], description: "Unilateral hip thrust", muscleGroups: ["glutes","hamstrings"] },
  { name: "Smith Machine Hip Thrust", category: "glutes", type: "compound", difficulty: "beginner", equipment: ["smith machine","bench"], description: "Smith machine hip thrust", muscleGroups: ["glutes","hamstrings"] },
  { name: "Glute Bridge", category: "glutes", type: "isolation", difficulty: "beginner", equipment: ["bodyweight"], description: "Bodyweight glute bridge", muscleGroups: ["glutes"] },
  { name: "Barbell Glute Bridge", category: "glutes", type: "compound", difficulty: "intermediate", equipment: ["barbell"], description: "Weighted glute bridge", muscleGroups: ["glutes","hamstrings"] },
  { name: "Single Leg Glute Bridge", category: "glutes", type: "isolation", difficulty: "intermediate", equipment: ["bodyweight"], description: "Unilateral glute bridge", muscleGroups: ["glutes"] },
  { name: "Cable Kickback", category: "glutes", type: "isolation", difficulty: "beginner", equipment: ["cable machine"], description: "Cable glute kickback", muscleGroups: ["glutes"] },
  { name: "Machine Kickback", category: "glutes", type: "isolation", difficulty: "beginner", equipment: ["machine"], description: "Machine glute kickback", muscleGroups: ["glutes"] },
  { name: "Donkey Kick", category: "glutes", type: "isolation", difficulty: "beginner", equipment: ["bodyweight"], description: "Bodyweight donkey kick", muscleGroups: ["glutes"] },
  { name: "Fire Hydrant", category: "glutes", type: "isolation", difficulty: "beginner", equipment: ["bodyweight"], description: "Hip abduction on all fours", muscleGroups: ["glutes","abductors"] },
  { name: "Banded Clamshell", category: "glutes", type: "isolation", difficulty: "beginner", equipment: ["resistance band"], description: "Clamshell with band", muscleGroups: ["glutes","abductors"] },
  { name: "Banded Lateral Walk", category: "glutes", type: "isolation", difficulty: "beginner", equipment: ["resistance band"], description: "Side-stepping with band", muscleGroups: ["glutes","abductors"] },
  { name: "Cable Pull-Through", category: "glutes", type: "compound", difficulty: "intermediate", equipment: ["cable machine"], description: "Cable pull-through for glutes", muscleGroups: ["glutes","hamstrings"] },
  { name: "Kettlebell Swing", category: "glutes", type: "compound", difficulty: "intermediate", equipment: ["kettlebell"], description: "Explosive hip hinge with kettlebell", muscleGroups: ["glutes","hamstrings","core"] },
  { name: "Frog Pump", category: "glutes", type: "isolation", difficulty: "beginner", equipment: ["bodyweight"], description: "Soles together glute bridge", muscleGroups: ["glutes"] },
  { name: "Curtsy Lunge", category: "glutes", type: "compound", difficulty: "intermediate", equipment: ["dumbbells"], description: "Cross-behind lunge for glutes", muscleGroups: ["glutes","quads"] },
  { name: "Sumo Deadlift (Glute Focus)", category: "glutes", type: "compound", difficulty: "intermediate", equipment: ["barbell"], description: "Wide stance deadlift for glutes", muscleGroups: ["glutes","hamstrings","back"] },
  { name: "Romanian Deadlift (Glute Focus)", category: "glutes", type: "compound", difficulty: "intermediate", equipment: ["barbell"], description: "RDL with glute emphasis", muscleGroups: ["glutes","hamstrings"] },
  { name: "Reverse Lunge (Glute Focus)", category: "glutes", type: "compound", difficulty: "beginner", equipment: ["dumbbells"], description: "Reverse lunge with glute emphasis", muscleGroups: ["glutes","quads"] },

  // ===== CORE (29) =====
  { name: "Plank", category: "core", type: "isolation", difficulty: "beginner", equipment: ["bodyweight"], description: "Isometric core hold", muscleGroups: ["core","abs"] },
  { name: "Side Plank", category: "core", type: "isolation", difficulty: "beginner", equipment: ["bodyweight"], description: "Lateral isometric core hold", muscleGroups: ["obliques","core"] },
  { name: "Plank with Shoulder Tap", category: "core", type: "isolation", difficulty: "intermediate", equipment: ["bodyweight"], description: "Plank with alternating shoulder taps", muscleGroups: ["core","abs","shoulders"] },
  { name: "Crunches", category: "core", type: "isolation", difficulty: "beginner", equipment: ["bodyweight"], description: "Basic abdominal crunch", muscleGroups: ["abs"] },
  { name: "Bicycle Crunches", category: "core", type: "isolation", difficulty: "beginner", equipment: ["bodyweight"], description: "Twisting crunch for obliques", muscleGroups: ["abs","obliques"] },
  { name: "Reverse Crunch", category: "core", type: "isolation", difficulty: "beginner", equipment: ["bodyweight"], description: "Lower ab focused crunch", muscleGroups: ["abs"] },
  { name: "Cable Crunch", category: "core", type: "isolation", difficulty: "intermediate", equipment: ["cable machine"], description: "Weighted cable crunch", muscleGroups: ["abs"] },
  { name: "Decline Sit-up", category: "core", type: "isolation", difficulty: "intermediate", equipment: ["decline bench"], description: "Sit-up on decline bench", muscleGroups: ["abs"] },
  { name: "Hanging Leg Raise", category: "core", type: "isolation", difficulty: "intermediate", equipment: ["pull-up bar"], description: "Hanging leg raise for lower abs", muscleGroups: ["abs","core"] },
  { name: "Hanging Knee Raise", category: "core", type: "isolation", difficulty: "beginner", equipment: ["pull-up bar"], description: "Hanging knee raise", muscleGroups: ["abs","core"] },
  { name: "Captain's Chair Leg Raise", category: "core", type: "isolation", difficulty: "intermediate", equipment: ["captain's chair"], description: "Leg raise on captain's chair", muscleGroups: ["abs","core"] },
  { name: "Lying Leg Raise", category: "core", type: "isolation", difficulty: "beginner", equipment: ["bodyweight"], description: "Lying flat leg raise", muscleGroups: ["abs"] },
  { name: "V-ups", category: "core", type: "isolation", difficulty: "intermediate", equipment: ["bodyweight"], description: "V-shaped sit-up", muscleGroups: ["abs","core"] },
  { name: "Russian Twist", category: "core", type: "isolation", difficulty: "beginner", equipment: ["bodyweight"], description: "Seated twisting for obliques", muscleGroups: ["obliques","abs"] },
  { name: "Weighted Russian Twist", category: "core", type: "isolation", difficulty: "intermediate", equipment: ["dumbbell"], description: "Russian twist with weight", muscleGroups: ["obliques","abs"] },
  { name: "Ab Wheel Rollout", category: "core", type: "isolation", difficulty: "intermediate", equipment: ["ab wheel"], description: "Ab wheel rollout", muscleGroups: ["abs","core"] },
  { name: "Pallof Press", category: "core", type: "isolation", difficulty: "intermediate", equipment: ["cable machine"], description: "Anti-rotation press", muscleGroups: ["core","obliques"] },
  { name: "Woodchop (Cable)", category: "core", type: "functional", difficulty: "intermediate", equipment: ["cable machine"], description: "Cable woodchop for rotational core", muscleGroups: ["obliques","core"] },
  { name: "Mountain Climbers", category: "core", type: "cardio", difficulty: "beginner", equipment: ["bodyweight"], description: "Dynamic plank with knee drives", muscleGroups: ["core","abs","shoulders"] },
  { name: "Dead Bug", category: "core", type: "isolation", difficulty: "beginner", equipment: ["bodyweight"], description: "Anti-extension core exercise", muscleGroups: ["core","abs"] },
  { name: "Bird Dog", category: "core", type: "isolation", difficulty: "beginner", equipment: ["bodyweight"], description: "Opposite arm/leg extension", muscleGroups: ["core","back"] },
  { name: "Flutter Kicks", category: "core", type: "isolation", difficulty: "beginner", equipment: ["bodyweight"], description: "Alternating leg kicks", muscleGroups: ["abs"] },
  { name: "Toe Touches", category: "core", type: "isolation", difficulty: "beginner", equipment: ["bodyweight"], description: "Lying toe touch crunch", muscleGroups: ["abs"] },
  { name: "Hollow Body Hold", category: "core", type: "isolation", difficulty: "intermediate", equipment: ["bodyweight"], description: "Gymnastic hollow body hold", muscleGroups: ["core","abs"] },
  { name: "L-Sit", category: "core", type: "isolation", difficulty: "advanced", equipment: ["dip bars"], description: "Isometric L-sit hold", muscleGroups: ["core","abs"] },
  { name: "Dragon Flag", category: "core", type: "isolation", difficulty: "advanced", equipment: ["bench"], description: "Advanced core exercise", muscleGroups: ["core","abs"] },
  { name: "Windshield Wipers", category: "core", type: "isolation", difficulty: "advanced", equipment: ["pull-up bar"], description: "Hanging leg rotation", muscleGroups: ["obliques","core"] },
  { name: "Suitcase Carry", category: "core", type: "functional", difficulty: "intermediate", equipment: ["dumbbell"], description: "Single arm loaded carry", muscleGroups: ["core","obliques","forearms"] },
  { name: "Scissor Kicks", category: "core", type: "isolation", difficulty: "beginner", equipment: ["bodyweight"], description: "Crossing leg kicks", muscleGroups: ["abs"] },

  // ===== CARDIO (26) =====
  { name: "Treadmill Running", category: "cardio", type: "cardio", difficulty: "beginner", equipment: ["treadmill"], description: "Running on treadmill", muscleGroups: ["legs","core"] },
  { name: "Treadmill Walking", category: "cardio", type: "cardio", difficulty: "beginner", equipment: ["treadmill"], description: "Walking on treadmill", muscleGroups: ["legs"] },
  { name: "Treadmill Incline Walk", category: "cardio", type: "cardio", difficulty: "beginner", equipment: ["treadmill"], description: "Incline walking on treadmill", muscleGroups: ["legs","glutes"] },
  { name: "Stationary Bike", category: "cardio", type: "cardio", difficulty: "beginner", equipment: ["stationary bike"], description: "Cycling on stationary bike", muscleGroups: ["legs"] },
  { name: "Spin Bike", category: "cardio", type: "cardio", difficulty: "intermediate", equipment: ["spin bike"], description: "High intensity spin cycling", muscleGroups: ["legs","core"] },
  { name: "Rowing Machine", category: "cardio", type: "cardio", difficulty: "beginner", equipment: ["rowing machine"], description: "Full body rowing", muscleGroups: ["back","legs","arms"] },
  { name: "Elliptical Trainer", category: "cardio", type: "cardio", difficulty: "beginner", equipment: ["elliptical"], description: "Low impact elliptical training", muscleGroups: ["legs","arms"] },
  { name: "Stair Climber", category: "cardio", type: "cardio", difficulty: "intermediate", equipment: ["stair climber"], description: "Stair climbing machine", muscleGroups: ["legs","glutes"] },
  { name: "Jump Rope", category: "cardio", type: "cardio", difficulty: "beginner", equipment: ["jump rope"], description: "Skipping rope for cardio", muscleGroups: ["calves","shoulders","core"] },
  { name: "Double Unders", category: "cardio", type: "cardio", difficulty: "advanced", equipment: ["jump rope"], description: "Double rotation jump rope", muscleGroups: ["calves","shoulders","core"] },
  { name: "Sprints", category: "cardio", type: "cardio", difficulty: "intermediate", equipment: ["bodyweight"], description: "Short distance sprints", muscleGroups: ["legs","glutes","core"] },
  { name: "Hill Sprints", category: "cardio", type: "cardio", difficulty: "advanced", equipment: ["bodyweight"], description: "Sprinting uphill", muscleGroups: ["legs","glutes","core"] },
  { name: "Battle Ropes", category: "cardio", type: "cardio", difficulty: "intermediate", equipment: ["battle ropes"], description: "Rope waves for conditioning", muscleGroups: ["shoulders","arms","core"] },
  { name: "Battle Rope Slams", category: "cardio", type: "cardio", difficulty: "intermediate", equipment: ["battle ropes"], description: "Overhead rope slams", muscleGroups: ["shoulders","core","back"] },
  { name: "Box Jumps", category: "cardio", type: "cardio", difficulty: "intermediate", equipment: ["plyo box"], description: "Jumping onto a box", muscleGroups: ["legs","glutes"] },
  { name: "Burpees", category: "cardio", type: "cardio", difficulty: "intermediate", equipment: ["bodyweight"], description: "Full body conditioning exercise", muscleGroups: ["chest","legs","core"] },
  { name: "Jumping Jacks", category: "cardio", type: "cardio", difficulty: "beginner", equipment: ["bodyweight"], description: "Classic jumping jacks", muscleGroups: ["legs","shoulders"] },
  { name: "High Knees", category: "cardio", type: "cardio", difficulty: "beginner", equipment: ["bodyweight"], description: "Running in place with high knees", muscleGroups: ["legs","core"] },
  { name: "Butt Kicks", category: "cardio", type: "cardio", difficulty: "beginner", equipment: ["bodyweight"], description: "Running in place kicking heels", muscleGroups: ["hamstrings","legs"] },
  { name: "Assault Bike", category: "cardio", type: "cardio", difficulty: "intermediate", equipment: ["assault bike"], description: "Air resistance bike", muscleGroups: ["legs","arms","core"] },
  { name: "Ski Erg", category: "cardio", type: "cardio", difficulty: "intermediate", equipment: ["ski erg"], description: "Skiing machine for conditioning", muscleGroups: ["back","arms","core"] },
  { name: "Sled Push", category: "cardio", type: "cardio", difficulty: "intermediate", equipment: ["sled"], description: "Pushing a weighted sled", muscleGroups: ["legs","glutes","core"] },
  { name: "Sled Pull", category: "cardio", type: "cardio", difficulty: "intermediate", equipment: ["sled"], description: "Pulling a weighted sled", muscleGroups: ["back","legs","core"] },
  { name: "Cycling (Outdoor)", category: "cardio", type: "cardio", difficulty: "beginner", equipment: ["bicycle"], description: "Outdoor cycling", muscleGroups: ["legs"] },
  { name: "Running (Outdoor)", category: "cardio", type: "cardio", difficulty: "beginner", equipment: ["bodyweight"], description: "Outdoor running", muscleGroups: ["legs","core"] },
  { name: "Swimming", category: "cardio", type: "cardio", difficulty: "beginner", equipment: ["pool"], description: "Swimming for cardio", muscleGroups: ["back","shoulders","legs"] },

  // ===== FUNCTIONAL (28) =====
  { name: "Kettlebell Clean", category: "functional", type: "functional", difficulty: "intermediate", equipment: ["kettlebell"], description: "Kettlebell clean to rack position", muscleGroups: ["shoulders","back","legs"] },
  { name: "Kettlebell Snatch", category: "functional", type: "functional", difficulty: "advanced", equipment: ["kettlebell"], description: "Kettlebell snatch overhead", muscleGroups: ["shoulders","back","legs","core"] },
  { name: "Kettlebell Turkish Get-Up", category: "functional", type: "functional", difficulty: "advanced", equipment: ["kettlebell"], description: "Floor to standing with kettlebell", muscleGroups: ["shoulders","core","legs"] },
  { name: "Kettlebell Goblet Squat", category: "functional", type: "compound", difficulty: "beginner", equipment: ["kettlebell"], description: "Goblet squat with kettlebell", muscleGroups: ["quads","glutes"] },
  { name: "Kettlebell Windmill", category: "functional", type: "functional", difficulty: "intermediate", equipment: ["kettlebell"], description: "Kettlebell windmill for mobility", muscleGroups: ["core","shoulders","hamstrings"] },
  { name: "Medicine Ball Slam", category: "functional", type: "functional", difficulty: "beginner", equipment: ["medicine ball"], description: "Overhead ball slam", muscleGroups: ["core","shoulders","back"] },
  { name: "Medicine Ball Wall Ball", category: "functional", type: "functional", difficulty: "intermediate", equipment: ["medicine ball"], description: "Squat and throw to wall", muscleGroups: ["legs","shoulders","core"] },
  { name: "Medicine Ball Rotational Throw", category: "functional", type: "functional", difficulty: "intermediate", equipment: ["medicine ball"], description: "Rotational throw against wall", muscleGroups: ["core","obliques"] },
  { name: "Barbell Clean", category: "functional", type: "compound", difficulty: "advanced", equipment: ["barbell"], description: "Olympic clean from floor to shoulders", muscleGroups: ["legs","back","shoulders"] },
  { name: "Barbell Clean and Jerk", category: "functional", type: "compound", difficulty: "advanced", equipment: ["barbell"], description: "Olympic clean and jerk", muscleGroups: ["legs","back","shoulders","triceps"] },
  { name: "Barbell Snatch", category: "functional", type: "compound", difficulty: "advanced", equipment: ["barbell"], description: "Olympic snatch", muscleGroups: ["legs","back","shoulders"] },
  { name: "Power Clean", category: "functional", type: "compound", difficulty: "advanced", equipment: ["barbell"], description: "Power clean from floor", muscleGroups: ["legs","back","shoulders"] },
  { name: "Hang Clean", category: "functional", type: "compound", difficulty: "intermediate", equipment: ["barbell"], description: "Clean from hang position", muscleGroups: ["legs","back","shoulders"] },
  { name: "Thruster", category: "functional", type: "compound", difficulty: "intermediate", equipment: ["barbell"], description: "Front squat to overhead press", muscleGroups: ["legs","shoulders","core"] },
  { name: "Dumbbell Thruster", category: "functional", type: "compound", difficulty: "intermediate", equipment: ["dumbbells"], description: "Dumbbell squat to press", muscleGroups: ["legs","shoulders","core"] },
  { name: "Man Maker", category: "functional", type: "functional", difficulty: "advanced", equipment: ["dumbbells"], description: "Push-up, row, squat, press combo", muscleGroups: ["chest","back","legs","shoulders"] },
  { name: "Tire Flip", category: "functional", type: "functional", difficulty: "advanced", equipment: ["tire"], description: "Flipping a heavy tire", muscleGroups: ["legs","back","core"] },
  { name: "Rope Climb", category: "functional", type: "functional", difficulty: "advanced", equipment: ["climbing rope"], description: "Climbing a rope", muscleGroups: ["back","biceps","forearms"] },
  { name: "Bear Crawl", category: "functional", type: "functional", difficulty: "beginner", equipment: ["bodyweight"], description: "Crawling on hands and feet", muscleGroups: ["core","shoulders","legs"] },
  { name: "Sandbag Clean", category: "functional", type: "functional", difficulty: "intermediate", equipment: ["sandbag"], description: "Sandbag clean to shoulders", muscleGroups: ["legs","back","core"] },
  { name: "Sandbag Carry", category: "functional", type: "functional", difficulty: "intermediate", equipment: ["sandbag"], description: "Carrying a sandbag", muscleGroups: ["core","legs","back"] },
  { name: "Turkish Get-Up (Dumbbell)", category: "functional", type: "functional", difficulty: "advanced", equipment: ["dumbbell"], description: "Turkish get-up with dumbbell", muscleGroups: ["shoulders","core","legs"] },
  { name: "Farmer's Carry", category: "functional", type: "functional", difficulty: "beginner", equipment: ["dumbbells"], description: "Walking with heavy weights", muscleGroups: ["forearms","traps","core"] },
  { name: "Overhead Carry", category: "functional", type: "functional", difficulty: "intermediate", equipment: ["dumbbell"], description: "Walking with weight overhead", muscleGroups: ["shoulders","core"] },
  { name: "Prowler Push", category: "functional", type: "functional", difficulty: "intermediate", equipment: ["prowler"], description: "Pushing a prowler sled", muscleGroups: ["legs","glutes","core"] },
  { name: "Atlas Stone Lift", category: "functional", type: "functional", difficulty: "advanced", equipment: ["atlas stone"], description: "Lifting atlas stones", muscleGroups: ["back","legs","core"] },
  { name: "Yoke Walk", category: "functional", type: "functional", difficulty: "advanced", equipment: ["yoke"], description: "Walking with yoke on back", muscleGroups: ["legs","core","back"] },
  { name: "Sled Drag", category: "functional", type: "functional", difficulty: "intermediate", equipment: ["sled"], description: "Dragging a weighted sled", muscleGroups: ["legs","back","core"] },
];

async function main() {
  const connOpts = parseUrl(DATABASE_URL);
  const conn = await createConnection(connOpts);
  console.log('Connected to database');

  const [rows] = await conn.execute('SELECT COUNT(*) as count FROM exercises');
  console.log(`Current exercises in DB: ${rows[0].count}`);

  if (parseInt(rows[0].count) > 0) {
    console.log('Clearing existing exercises...');
    await conn.execute('DELETE FROM exercises');
  }

  console.log(`Seeding ${EXERCISES.length} exercises...`);

  const batchSize = 50;
  let inserted = 0;

  for (let i = 0; i < EXERCISES.length; i += batchSize) {
    const batch = EXERCISES.slice(i, i + batchSize);
    const values = batch.map(ex =>
      `(${conn.escape(ex.name)}, ${conn.escape(ex.category)}, ${conn.escape(ex.type)}, ${conn.escape(ex.difficulty)}, ${conn.escape(JSON.stringify(ex.equipment))}, ${conn.escape(ex.description)}, ${conn.escape(JSON.stringify(ex.muscleGroups))})`
    ).join(',\n');

    const sql = `INSERT IGNORE INTO exercises (name, category, \`type\`, difficulty, equipment, description, muscleGroups) VALUES ${values}`;
    const [result] = await conn.execute(sql);
    inserted += result.affectedRows;
    console.log(`  Batch ${Math.floor(i / batchSize) + 1}: inserted ${result.affectedRows} exercises`);
  }

  const [countRows] = await conn.execute('SELECT COUNT(*) as count FROM exercises');
  console.log(`\nTotal exercises in database: ${countRows[0].count}`);

  const [categories] = await conn.execute('SELECT category, COUNT(*) as count FROM exercises GROUP BY category ORDER BY count DESC');
  console.log('\nCategory breakdown:');
  for (const row of categories) {
    console.log(`  ${row.category}: ${row.count}`);
  }

  await conn.end();
  console.log('\nDone!');
}

main().catch(console.error);
