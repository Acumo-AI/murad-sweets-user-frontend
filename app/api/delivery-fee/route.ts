import { NextRequest, NextResponse } from 'next/server';

// ─── Delivery Pricing Engine ──────────────────────────────────────────────────
//
// Rule 1: Distance ≤ 5 miles         → $0 (free delivery)
// Rule 2: Distance > 5 and ≤ 30 mi  → $10 base + $1/mile  (e.g. 10mi = $20)
// Rule 3: Distance > 30 and ≤ 50 mi → $1/mile             (e.g. 35mi = $35)
// Rule 4: Distance > 50 miles        → Delivery unavailable
//
// Uses EXACT mileage (not rounded), per spec.

function calculateDeliveryFee(miles: number): { feeCents: number; eligible: boolean; message?: string } {
  if (miles <= 5) {
    return { feeCents: 0, eligible: true };
  }

  if (miles <= 30) {
    // $10 base + $1 per mile — on the full distance
    const fee = 10 + miles;
    return { feeCents: Math.round(fee * 100), eligible: true };
  }

  if (miles <= 50) {
    // $1 per mile — no base fee
    const fee = miles;
    return { feeCents: Math.round(fee * 100), eligible: true };
  }

  // > 50 miles — ineligible
  return {
    feeCents: 0,
    eligible: false,
    message: "Sorry, delivery is only available within 50 miles.",
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const milesStr = searchParams.get('miles');

  if (!milesStr) {
    return NextResponse.json({ error: 'miles parameter is required' }, { status: 400 });
  }

  const miles = parseFloat(milesStr);
  if (isNaN(miles) || miles < 0) {
    return NextResponse.json({ error: 'Invalid miles value' }, { status: 400 });
  }

  const result = calculateDeliveryFee(miles);
  return NextResponse.json({ ...result, distanceMiles: miles });
}
