import { NextRequest, NextResponse } from 'next/server';
import { fetchBackendRaw } from '@/lib/backend';
import { SignJWT } from 'jose';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // We expect: ticketId, ticketTitle, ticketPrice, experienceId, firstName, lastName, email, countryCode, contactNumber, quantity, totalPrice, paymentToken
    const { ticketId, ticketTitle, ticketPrice, experienceId, firstName, lastName, email, countryCode, contactNumber, quantity, totalPrice, paymentToken } = body;
    
    const backendPayload = {
      firstName,
      lastName,
      email,
      contactNumber: Number(contactNumber) || 0,
      countryCode,
      orderFor: "SEATING_PAYMENT",
      amount: totalPrice,
      paymentMethodId: paymentToken,
      items: [
        {
          itemId: ticketId || 1,
          itemName: ticketTitle || "Ticket",
          itemQuantity: quantity,
          itemPrice: ticketPrice || 0,
          subTotal: totalPrice,
          orderFor: "TICKET_FOR_EXPERIENCE"
        }
      ]
    };

    console.log('Sending data to backend (/ticket-payment/pay):', JSON.stringify(backendPayload, null, 2));

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const secretKey = new TextEncoder().encode('XZddoAPB3q5tdZguL+UnENyNN9B9r0+F6C32tcsYxko=');
    const token = await new SignJWT({ timestamp })
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .sign(secretKey);
    
    console.log('--- Guest JWT Generation ---');
    console.log('Timestamp (String):', timestamp);
    console.log('Generated JWT:', token);
    console.log('----------------------------');
    
    // Always use the Guest JWT for this endpoint
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const response = await fetchBackendRaw<any>('/ticket-payment/pay', {
      method: 'POST',
      headers,
      body: JSON.stringify(backendPayload),
    });

    console.log('Response from backend:', JSON.stringify(response, null, 2));

    return NextResponse.json(response);
  } catch (error: any) {
    const status = error.status || 500;
    return NextResponse.json(
      { error: error.message || 'Failed to create booking' },
      { status }
    );
  }
}
