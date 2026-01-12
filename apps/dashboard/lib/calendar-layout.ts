/**
 * Calendar layout algorithm for positioning overlapping events side-by-side.
 * Uses a collision group approach to arrange events without overlap.
 */

interface EventForLayout {
  id: string;
  startTime: Date | string;
  endTime: Date | string;
}

export interface LayoutPosition {
  top: number;
  height: number;
  left: string;    // e.g., "2%", "34%"
  width: string;   // e.g., "96%", "31%"
  column: number;
  totalColumns: number;
}

interface LayoutConfig {
  hourHeight: number;
  startHour: number;
  endHour: number;
  padding: number; // padding percentage from edges
}

/**
 * Check if two events overlap in time.
 */
function eventsOverlap(
  a: { start: Date; end: Date },
  b: { start: Date; end: Date }
): boolean {
  // Events overlap if one starts before the other ends
  return a.start < b.end && b.start < a.end;
}

/**
 * Group overlapping events into collision groups.
 * Events in the same group all overlap with at least one other event in the group.
 */
function findCollisionGroups(
  events: Array<{ id: string; start: Date; end: Date }>
): Array<Array<{ id: string; start: Date; end: Date }>> {
  if (events.length === 0) return [];

  // Sort events by start time, then by end time
  const sorted = [...events].sort((a, b) => {
    const startDiff = a.start.getTime() - b.start.getTime();
    if (startDiff !== 0) return startDiff;
    return a.end.getTime() - b.end.getTime();
  });

  const groups: Array<Array<typeof sorted[0]>> = [];
  let currentGroup: typeof sorted = [];
  let groupEnd: Date | null = null;

  for (const event of sorted) {
    // If this event doesn't overlap with the current group, start a new group
    if (groupEnd === null || event.start >= groupEnd) {
      if (currentGroup.length > 0) {
        groups.push(currentGroup);
      }
      currentGroup = [event];
      groupEnd = event.end;
    } else {
      // Event overlaps with the current group
      currentGroup.push(event);
      // Extend the group end if this event ends later
      if (event.end > groupEnd) {
        groupEnd = event.end;
      }
    }
  }

  // Don't forget the last group
  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  return groups;
}

/**
 * Assign columns to events within a collision group.
 * Uses a greedy algorithm to pack events into as few columns as possible.
 */
function assignColumns(
  group: Array<{ id: string; start: Date; end: Date }>
): Map<string, number> {
  const columns: Map<string, number> = new Map();

  // Track when each column becomes free
  const columnEnds: Date[] = [];

  // Sort by start time
  const sorted = [...group].sort((a, b) => a.start.getTime() - b.start.getTime());

  for (const event of sorted) {
    // Find the first column where this event can fit
    let assignedColumn = -1;

    for (let col = 0; col < columnEnds.length; col++) {
      if (columnEnds[col] <= event.start) {
        assignedColumn = col;
        columnEnds[col] = event.end;
        break;
      }
    }

    // If no existing column works, create a new one
    if (assignedColumn === -1) {
      assignedColumn = columnEnds.length;
      columnEnds.push(event.end);
    }

    columns.set(event.id, assignedColumn);
  }

  return columns;
}

/**
 * Calculate the layout positions for all events on a given day.
 * Returns a Map from event ID to LayoutPosition.
 */
export function calculateEventLayout(
  events: EventForLayout[],
  day: Date,
  config: LayoutConfig
): Map<string, LayoutPosition> {
  const { hourHeight, startHour, endHour, padding } = config;
  const positions: Map<string, LayoutPosition> = new Map();

  if (events.length === 0) return positions;

  // Get the start of the day for calculations
  const dayStart = new Date(day);
  dayStart.setHours(0, 0, 0, 0);

  // Convert events to normalized format with Date objects
  const normalizedEvents = events.map((event) => {
    const start = new Date(event.startTime);
    const end = new Date(event.endTime);
    return { id: event.id, start, end };
  });

  // Find collision groups
  const groups = findCollisionGroups(normalizedEvents);

  // Process each group
  for (const group of groups) {
    const columnAssignments = assignColumns(group);
    const totalColumns = Math.max(...Array.from(columnAssignments.values())) + 1;

    // Calculate width and left position for each event in the group
    const availableWidth = 100 - (padding * 2); // Account for left/right padding
    const columnWidth = availableWidth / totalColumns;

    for (const event of group) {
      const column = columnAssignments.get(event.id) ?? 0;

      // Calculate vertical position
      const eventStart = event.start;
      const eventEnd = event.end;

      // Calculate minutes from start of visible day
      let startMinutes =
        (eventStart.getTime() - dayStart.getTime()) / (1000 * 60);
      if (startMinutes < startHour * 60) startMinutes = startHour * 60;

      let endMinutes =
        (eventEnd.getTime() - dayStart.getTime()) / (1000 * 60);
      if (endMinutes > endHour * 60) endMinutes = endHour * 60;

      const top = ((startMinutes - startHour * 60) / 60) * hourHeight;
      const height = Math.max(((endMinutes - startMinutes) / 60) * hourHeight, 20);

      // Calculate horizontal position
      const left = padding + (column * columnWidth);
      const width = columnWidth - (padding / totalColumns); // Small gap between columns

      positions.set(event.id, {
        top,
        height,
        left: `${left}%`,
        width: `${width}%`,
        column,
        totalColumns,
      });
    }
  }

  return positions;
}
