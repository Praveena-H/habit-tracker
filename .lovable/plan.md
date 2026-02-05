

# Three-Column Dashboard Layout

Transform the current single-column layout into a Duolingo-inspired three-column dashboard with habits list, selected habit details, and achievements/progress panel.

---

## Layout Overview

```text
+------------------+------------------------+------------------+
|   LEFT SIDEBAR   |      MAIN CONTENT      |   RIGHT PANEL    |
|   (Habits List)  |   (Selected Habit)     |  (Progress/Goals)|
+------------------+------------------------+------------------+
|                  |                        |                  |
| 📚 Reading       |   📚 Reading           | Overall Progress |
|                  |                        |  ━━━━━━━━ 65%    |
| 🏃 Exercise  ←   |   Current Streak: 7    |                  |
|   (selected)     |   Best Streak: 14      | ────────────────  |
|                  |   Completion: 85%      |                  |
| 💤 Sleep         |                        | 🏆 Achievements  |
|                  |   [Weekly Progress]    |  🔥 Week Warrior |
| 🧘 Meditate      |   Mon Tue Wed...       |  💪 Getting Serious|
|                  |                        |                  |
|                  |   [Calendar View]      | ────────────────  |
|                  |   January 2026         |                  |
|                  |                        | [+ Add Habit]    |
+------------------+------------------------+------------------+
```

---

## New Components to Create

### 1. HabitsSidebar Component
A left sidebar displaying all habits as selectable items:
- Habit emoji + name
- Current streak indicator
- Visual highlight for selected habit
- "Completed today" checkmark indicator

### 2. HabitDetailView Component
The main content area showing the selected habit:
- Large emoji and habit name header
- Statistics cards (current streak, best streak, completion rate, total)
- Weekly progress with day toggles
- Full calendar view for historical data
- Goal progress bar (if set)
- Notes section (if any)

### 3. ProgressPanel Component
Right sidebar with overall progress and gamification:
- Overall daily progress bar (X of Y habits done)
- Best streak across all habits
- Trophy showcase (unlocked achievements grid)
- Next achievements to unlock with progress bars
- "Add New Habit" button prominently placed

### 4. DashboardLayout Component
A wrapper component that manages the three-column grid and state:
- Responsive: 3 columns on desktop, stacked on mobile/tablet
- Manages selected habit state
- Coordinates data between panels

---

## Files to Modify

### `src/pages/Index.tsx`
- Replace current layout with new DashboardLayout
- Move state management logic to coordinate selection

### `src/components/HabitCard.tsx`
- Refactor into HabitDetailView for the center panel
- Create a simplified HabitListItem for the sidebar

---

## Technical Details

### State Management
```typescript
// In Index.tsx or DashboardLayout
const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
const selectedHabit = habits.find(h => h.id === selectedHabitId);
```

### Responsive Grid
```css
/* Desktop: 3 columns */
grid-template-columns: 260px 1fr 300px;

/* Tablet: 2 columns (hide right panel or make collapsible) */
grid-template-columns: 220px 1fr;

/* Mobile: Single column with tabs/navigation */
```

### Component Structure
```text
src/components/
├── dashboard/
│   ├── HabitsSidebar.tsx      (left - habits list)
│   ├── HabitDetailView.tsx    (center - selected habit)
│   ├── ProgressPanel.tsx      (right - achievements)
│   └── DashboardLayout.tsx    (wrapper)
├── HabitListItem.tsx          (sidebar item)
└── ... (existing components)
```

---

## Implementation Steps

1. **Create DashboardLayout** - Set up the 3-column responsive grid structure

2. **Build HabitsSidebar** - Extract habit list into a selectable sidebar with:
   - Habit items showing emoji, name, streak
   - Selection state management
   - Today's completion status indicator

3. **Create HabitDetailView** - Refactor HabitCard into a detailed center panel:
   - Larger display with full statistics
   - Integrated calendar view
   - Weekly progress toggles

4. **Build ProgressPanel** - Aggregate achievements and progress:
   - Calculate overall stats across all habits
   - Display achievement badges
   - Show next goals with progress
   - Add New Habit button

5. **Update Index.tsx** - Integrate all components:
   - Wire up selection state
   - Handle empty states (no habits, no selection)
   - Ensure mobile responsiveness

6. **Mobile Responsiveness** - Add responsive behavior:
   - Desktop: Full 3-column layout
   - Tablet: Collapsible sidebar or 2-column
   - Mobile: Tab-based navigation between sections

