import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const PLAN_LIMITS: Record<string, number> = {
  free: 1,
  pro: 3,
  enterprise: 999,
};

function getAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {}
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { email, role } = body;

  if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

  const admin = getAdminClient();

  // Get inviter's profile and company
  const { data: profile } = await admin.from("profiles").select("company_id").eq("id", user.id).single();
  if (!profile?.company_id) return NextResponse.json({ error: "No company found" }, { status: 400 });

  // Get company info and plan
  const { data: company } = await admin.from("companies").select("name, message").eq("id", profile.company_id).single();
  let msg: Record<string, string> = {};
  try { msg = company?.message ? JSON.parse(company.message) : {}; } catch {}
  const plan = msg.plan || "free";

  // Check team member limit
  const { count } = await admin.from("profiles").select("id", { count: "exact" }).eq("company_id", profile.company_id);
  const limit = PLAN_LIMITS[plan] || 1;

  if ((count || 0) >= limit) {
    return NextResponse.json({
      error: `Your ${plan} plan allows ${limit} team member${limit > 1 ? "s" : ""}. Upgrade to add more.`,
    }, { status: 403 });
  }

  // Check if email already exists in this company
  const { data: existing } = await admin.from("profiles").select("id").eq("email", email).eq("company_id", profile.company_id).single();
  if (existing) {
    return NextResponse.json({ error: "This person is already on your team" }, { status: 400 });
  }

  // Check if there's already an auth user with this email
  const { data: existingUsers } = await admin.auth.admin.listUsers();
  const existingUser = existingUsers?.users?.find(u => u.email === email);

  if (existingUser) {
    // User already has an account — check if they're in another company
    const { data: existingProfile } = await admin.from("profiles").select("company_id").eq("id", existingUser.id).single();

    if (existingProfile?.company_id && existingProfile.company_id !== profile.company_id) {
      // Move them to this company (or create a new profile entry)
      await admin.from("profiles").update({
        company_id: profile.company_id,
        role: role || "member",
      }).eq("id", existingUser.id);
    } else if (!existingProfile) {
      // Create profile for existing auth user
      await admin.from("profiles").insert({
        id: existingUser.id,
        email,
        full_name: existingUser.user_metadata?.full_name || email.split("@")[0],
        company_id: profile.company_id,
        role: role || "member",
      });
    }

    return NextResponse.json({
      success: true,
      message: `${email} has been added to your team.`,
      status: "added",
    });
  }

  // New user — invite via Supabase (sends magic link email)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ticketmatch.ai";

  const { data: invitedUser, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
    data: {
      full_name: email.split("@")[0],
      company_name: company?.name,
      invited_by: user.email,
    },
    redirectTo: `${siteUrl}/auth/callback`,
  });

  if (inviteError) {
    console.error("Invite error:", inviteError);
    return NextResponse.json({ error: inviteError.message || "Failed to send invite" }, { status: 500 });
  }

  // Create profile for invited user
  if (invitedUser?.user) {
    await admin.from("profiles").insert({
      id: invitedUser.user.id,
      email,
      full_name: email.split("@")[0],
      company_id: profile.company_id,
      role: role || "member",
    });
  }

  return NextResponse.json({
    success: true,
    message: `Invitation sent to ${email}`,
    status: "invited",
  });
}

// DELETE — remove team member
export async function DELETE(request: Request) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {}
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { memberId } = body;

  if (!memberId) return NextResponse.json({ error: "Member ID required" }, { status: 400 });
  if (memberId === user.id) return NextResponse.json({ error: "You cannot remove yourself" }, { status: 400 });

  const admin = getAdminClient();

  // Verify they're in the same company
  const { data: myProfile } = await admin.from("profiles").select("company_id").eq("id", user.id).single();
  const { data: memberProfile } = await admin.from("profiles").select("company_id").eq("id", memberId).single();

  if (!myProfile?.company_id || myProfile.company_id !== memberProfile?.company_id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Remove from company (set company_id to null)
  await admin.from("profiles").update({ company_id: null }).eq("id", memberId);

  return NextResponse.json({ success: true });
}
