/**
 * Returns a resized Supabase storage URL for images, or the original URL for
 * anything not hosted in Supabase storage.
 *
 * NOTE: Supabase's image transformation endpoint (`/storage/v1/render/image/`)
 * requires the paid Image Transformations add-on and returns 403 on the Free
 * plan, so this currently passes URLs through unchanged. When transformations
 * are enabled (or a resizing proxy is added), uncomment the transform logic
 * below.
 */
export function optimizedImage(url?: string | null, width?: number): string | undefined {
  if (!url) return undefined;
  // if (width && url.includes('/storage/v1/object/public/')) {
  //   const parsed = new URL(url);
  //   parsed.pathname = parsed.pathname.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/');
  //   parsed.searchParams.set('resize', 'contain');
  //   parsed.searchParams.set('width', String(width));
  //   return parsed.toString();
  // }
  return url;
}
