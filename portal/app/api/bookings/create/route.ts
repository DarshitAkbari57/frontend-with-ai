import { NextRequest, NextResponse } from 'next/server';
import { fetchBackendRaw } from '@/lib/backend';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // We expect: ticketId, experienceId, username, phone, quantity, totalPrice, paymentToken
    const { ticketId, experienceId, username, phone, quantity, paymentToken } = body;
    
    // Convert this to the backend expected format.
    // If backend doesn't expect `paymentToken`, you might need to adjust this.
    const backendPayload = {
      ticketId,
      experienceId,
      username,
      phone,
      quantity,
      paymentToken,
      paymentMethod: 'stripe'
    };

    console.log('Sending data to backend (/booking/create):', JSON.stringify(backendPayload, null, 2));

    // const response = await fetchBackendRaw<any>('/booking/create', {
    //   method: 'POST',
    //   body: JSON.stringify(backendPayload),
    // });

    return NextResponse.json({message: "success"});
  } catch (error: any) {
    const status = error.status || 500;
    return NextResponse.json(
      { error: error.message || 'Failed to create booking' },
      { status }
    );
  }
}
