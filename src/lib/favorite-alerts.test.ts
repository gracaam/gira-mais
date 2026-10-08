import { describe, expect, it } from 'vitest';
import { alertKind } from '$lib/favorite-alerts';

describe('alertKind', () => {
	it('sets a baseline on the first sighting', () => {
		expect(alertKind(undefined, { bikes: 3, freeDocks: 3 }, false)).toBeNull();
	});
	it('alerts for bikes when a station goes from 0 to some, off a trip', () => {
		expect(alertKind({ bikes: 0, freeDocks: 5 }, { bikes: 2, freeDocks: 3 }, false)).toBe('bikes');
	});
	it('does not alert while bikes were already available', () => {
		expect(alertKind({ bikes: 1, freeDocks: 5 }, { bikes: 2, freeDocks: 4 }, false)).toBeNull();
	});
	it('alerts for free docks, not bikes, during a trip', () => {
		expect(alertKind({ bikes: 0, freeDocks: 0 }, { bikes: 1, freeDocks: 0 }, true)).toBeNull();
		expect(alertKind({ bikes: 4, freeDocks: 0 }, { bikes: 3, freeDocks: 1 }, true)).toBe('docks');
	});
});
