import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const isAuthRoute =
    request.nextUrl.pathname === "/login" ||
    request.nextUrl.pathname === "/sign-up";

  if (isAuthRoute) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (user) {
      return NextResponse.redirect(
        new URL("/", process.env.NEXT_PUBLIC_BASE_URL),
      );
    }
  }

  const { searchParams, pathname } = new URL(request.url);
  
  if (!searchParams.get("noteId") && pathname === "/") {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (user) {
      try {
        // Query database directly instead of making fetch calls
        const { data: notes, error } = await supabase
          .from('Note')
          .select('id')
          .eq('authorId', user.id)
          .order('createdAt', { ascending: false })
          .limit(1);

        if (error) {
          console.error('Database error:', error);
          return supabaseResponse;
        }

        let noteId;
        
        if (notes && notes.length > 0) {
          // Use existing note
          noteId = notes[0].id;
        } else {
          // Create new note directly in database
          const { data: newNote, error: createError } = await supabase
            .from('Note')
            .insert([
              {
                title: 'New Note',
                content: '',
                authorId: user.id,
              }
            ])
            .select('id')
            .single();

          if (createError) {
            console.error('Create note error:', createError);
            return supabaseResponse;
          }

          noteId = newNote.id;
        }

        if (noteId) {
          const url = request.nextUrl.clone();
          url.searchParams.set("noteId", noteId);
          return NextResponse.redirect(url);
        }
      } catch (error) {
        console.error('Middleware error:', error);
        return supabaseResponse;
      }
    }
  }

  return supabaseResponse;
}