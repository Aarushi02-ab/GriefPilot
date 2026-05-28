import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase";

const accountStatuses = new Set([
  "not_started",
  "letter_drafted",
  "sent",
  "resolved"
]);

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json(
      { error: "Request body must be a JSON object." },
      { status: 400 }
    );
  }

  const fields = body as Record<string, unknown>;
  const accountId =
    typeof fields.account_id === "string" ? fields.account_id.trim() : "";
  const status = typeof fields.status === "string" ? fields.status.trim() : "";

  if (!accountId || !accountStatuses.has(status)) {
    return NextResponse.json(
      { error: "A valid account_id and status are required." },
      { status: 400 }
    );
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("digital_accounts")
    .update({ status })
    .eq("id", accountId)
    .select("id, status")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ account: data });
}
