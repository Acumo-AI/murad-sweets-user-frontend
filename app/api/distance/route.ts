import { NextRequest, NextResponse } from 'next/server';

// Store coordinates — hardcoded, never geocoded at runtime
// 11920 S Texas 6, Unit 1280, Sugar Land, TX 77498
const STORE_LNG = -95.644367;
const STORE_LAT = 29.672712;

const METERS_PER_MILE = 1609.344;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lng = parseFloat(searchParams.get('lng') || '');
  const lat = parseFloat(searchParams.get('lat') || '');

  if (isNaN(lng) || isNaN(lat)) {
    return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
  }

  try {
    // OSRM public routing API — free, no API key required
    const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${STORE_LNG},${STORE_LAT};${lng},${lat}?overview=false`;

    const res = await fetch(osrmUrl, {
      headers: { 'User-Agent': 'MuradSweets/1.0' },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      throw new Error(`OSRM API error: ${res.status}`);
    }

    const data = await res.json();

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      return NextResponse.json(
        { error: 'Unable to calculate delivery distance. Please try again.' },
        { status: 422 }
      );
    }

    const distanceMeters: number = data.routes[0].distance;
    const distanceMiles = distanceMeters / METERS_PER_MILE;

    return NextResponse.json({ distanceMiles });
  } catch (err) {
    console.error('[distance] Error:', err);
    return NextResponse.json(
      { error: 'Unable to calculate delivery distance. Please try again.' },
      { status: 500 }
    );
  }
}
