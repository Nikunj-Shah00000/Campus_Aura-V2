export function getIdentity(): string {
  if (typeof window === 'undefined') return 'Star #0000';
  let id = localStorage.getItem('red_stars_id');
  if (!id) {
    id = `Star #${Math.floor(Math.random() * 9000) + 1000}`;
    localStorage.setItem('red_stars_id', id);
  }
  return id;
}
