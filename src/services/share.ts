/**
 * shareMessage — native share sheet where available, clipboard fallbacks on
 * web (async API → legacy execCommand). Reports via the Notice pill.
 */
import { Share } from 'react-native';
import { notify } from '@/components/Notice';

export async function shareMessage(message: string): Promise<void> {
  try {
    await Share.share({ message });
    return;
  } catch {
    // fall through to clipboard
  }
  try {
    await navigator.clipboard.writeText(message);
    notify('Link copied', 'success');
    return;
  } catch {
    // fall through to legacy copy
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = message;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    if (!ok) throw new Error('copy rejected');
    notify('Link copied', 'success');
  } catch {
    notify('Could not share on this device', 'error');
  }
}
