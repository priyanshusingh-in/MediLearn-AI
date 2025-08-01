import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      firebase: {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Set' : 'Not Set',
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'Not Set',
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'Not Set',
      }
    });
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 