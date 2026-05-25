import { NextRequest } from 'next/server';

// Proxy auth requests to backend
export async function POST(request: NextRequest) {
  const { pathname } = new URL(request.url);
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
  
  try {
    const body = await request.text();
    const backendPath = pathname.replace('/api/auth', '/api/v1/auth');
    // Special case for login: ensure we're hitting the correct endpoint
    if (backendPath === '/api/v1/auth/login') {
      // This is already correct, no change needed
    }
    
    const response = await fetch(`${backendUrl}${backendPath}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    });

    const data = await response.json();
    
    // Set cookies if present (for refresh token)
    const headers = new Headers(response.headers);
    const setCookie = headers.get('set-cookie');
    
    const nextResponse = new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (setCookie) {
      nextResponse.headers.set('set-cookie', setCookie);
    }
    
    return nextResponse;
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Authentication service unavailable' 
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}