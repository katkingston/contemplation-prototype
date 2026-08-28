/**
 * Shared ambient-music controller — ONE looping player for the whole
 * countdown → contemplation arc (Kat, Aug 17: music starts at the countdown,
 * stops when the contemplation is over).
 *
 * A single module-level player, for two reasons:
 * - The track runs unbroken across the Get Ready → player route change
 *   instead of restarting at the seam.
 * - On web the router keeps "closed" screens mounted, so a per-screen
 *   player's unmount cleanup never runs and the music leaks past the end of
 *   the practice. Every exit path (finish, End, Crisis, screen blur) calls
 *   pauseAmbient() on this one player instead.
 *
 * Created lazily on first play so the web build only touches audio after a
 * user gesture (autoplay policy).
 */
import { AudioPlayer, createAudioPlayer } from 'expo-audio';

const AMBIENT_MUSIC = require('../../assets/media/ambient-music.mp3');

let player: AudioPlayer | null = null;

export function playAmbient() {
  try {
    if (!player) {
      player = createAudioPlayer(AMBIENT_MUSIC);
      player.loop = true;
    }
    player.play();
  } catch {
    // Audio is ambience, never load-bearing — a failed start stays silent.
  }
}

export function pauseAmbient() {
  try {
    player?.pause();
  } catch {
    // Player may already be released — there is nothing left to silence.
  }
}
