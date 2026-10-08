import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Preferences } from '@capacitor/preferences';
import { get, writable } from 'svelte/store';
import { alertKind, type Counts } from '$lib/favorite-alerts';
import { stations } from '$lib/map.svelte';
import { t } from '$lib/translations';
import { currentTrip } from '$lib/trip';

const KEY = 'favorites';

/** Serial numbers of the starred stations. */
export const favorites = writable<string[]>([]);

export async function loadFavorites() {
	const { value } = await Preferences.get({ key: KEY });
	try {
		favorites.set(value ? JSON.parse(value) : []);
	} catch {
		favorites.set([]);
	}
}

export function toggleFavorite(serial: string) {
	const current = get(favorites);
	const adding = !current.includes(serial);
	const next = adding ? [...current, serial] : current.filter(s => s !== serial);
	favorites.set(next);
	Preferences.set({ key: KEY, value: JSON.stringify(next) });
	// Asked when the first star is added, so the prompt comes with a reason
	if (adding && Capacitor.isNativePlatform()) LocalNotifications.requestPermissions().catch(error => console.error('Notification permission failed', error));
}

async function notify(stationName: string, kind: 'bikes' | 'docks') {
	if (!Capacitor.isNativePlatform()) return;
	try {
		await LocalNotifications.schedule({
			notifications: [{
				id: Date.now() % 2_147_483_647,
				title: stationName,
				body: get(t)(kind === 'bikes' ? 'favorite_alert_bikes' : 'favorite_alert_docks'),
			}],
		});
	} catch (error) {
		console.error('Favourite alert failed', error);
	}
}

/** Watches the live station counts and alerts when a favourite gets bikes or docks again.
 * shortcut: only works while the app is running; alerts with the app closed need a push server. */
export function startFavoriteAlerts() {
	const last = new Map<string, Counts>();
	return $effect.root(() => {
		$effect(() => {
			const favs = get(favorites);
			const onTrip = get(currentTrip) !== null;
			for (const station of stations.value) {
				if (!favs.includes(station.serialNumber)) continue;
				const now = { bikes: station.bikes, freeDocks: station.freeDocks };
				const kind = alertKind(last.get(station.serialNumber), now, onTrip);
				last.set(station.serialNumber, now);
				if (kind) void notify(station.name, kind);
			}
			// Forget unstarred stations so starring one again starts from a fresh baseline
			for (const serial of last.keys()) if (!favs.includes(serial)) last.delete(serial);
		});
	});
}
