import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  const client = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            
          }
        },
      },
    },
  );

  return client;
}

export async function getUser() {
  try {
    const client = await createClient();
    
    
    const { data: session, error: sessionError } = await client.auth.getSession();
    
    if (sessionError || !session.session) {
      
      return null;
    }
    
    
    const { data, error } = await client.auth.getUser();

    if (error) {
      
      if (error.message !== "Auth session missing!") {
        console.error("Auth error:", error);
      }
      return null;
    }

    return data.user;
  } catch (error) {
    
    console.error("Failed to get user:", error);
    return null;
  }
}