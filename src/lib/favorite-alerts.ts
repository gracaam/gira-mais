export type Counts = { bikes: number; freeDocks: number };

/** A favourite earns an alert when it goes from empty to having something to offer:
 * bikes to take while walking, free docks to return to while on a trip. The first
 * sighting (no previous counts) only sets the baseline. */
export function alertKind(prev: Counts | undefined, now: Counts, onTrip: boolean): 'bikes' | 'docks' | null {
	if (!prev) return null;
	if (onTrip) return prev.freeDocks === 0 && now.freeDocks > 0 ? 'docks' : null;
	return prev.bikes === 0 && now.bikes > 0 ? 'bikes' : null;
}
