
import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { USERS } from '@/lib/data';

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

export async function GET(req: NextRequest) {
  try {
    const auth = getAuth();
    const password = 'uxua123'; // Hardcoded password for all users

    for (const email in USERS) {
      const user = USERS[email];
      try {
        await auth.createUser({
          email,
          password,
          displayName: user.name,
        });
        console.log(`Successfully created user: ${user.name}`);
      } catch (error: any) {
        if (error.code === 'auth/email-already-exists') {
          console.log(`User already exists: ${user.name}`);
        } else {
          throw error;
        }
      }
    }

    return NextResponse.json({ message: 'Users created successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error creating users:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
