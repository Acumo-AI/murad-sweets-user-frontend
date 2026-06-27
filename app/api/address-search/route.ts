import { NextRequest, NextResponse } from 'next/server';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q || q.trim().length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  if (!MAPBOX_TOKEN) {
    return NextResponse.json({ error: 'Mapbox token not configured' }, { status: 500 });
  }

  try {
    const url = new URL('https://api.mapbox.com/geocoding/v5/mapbox.places/' + encodeURIComponent(q) + '.json');
    url.searchParams.set('access_token', MAPBOX_TOKEN);
    url.searchParams.set('country', 'US');
    url.searchParams.set('types', 'address,place,postcode');
    url.searchParams.set('limit', '6');
    url.searchParams.set('proximity', '-95.644367,29.672712'); // Bias toward Sugar Land TX area

    const res = await fetch(url.toString(), { next: { revalidate: 0 } });
    if (!res.ok) {
      throw new Error(`Mapbox API error: ${res.status}`);
    }

    const data = await res.json();

    const suggestions = (data.features || []).map((f: any) => ({
      place_name: f.place_name,
      center: f.center, // [lng, lat]
    }));

    return NextResponse.json({ suggestions });
  } catch (err) {
    console.error('[address-search] Error:', err);
    return NextResponse.json({ error: 'Unable to validate address. Please try again.' }, { status: 500 });
  }
}
