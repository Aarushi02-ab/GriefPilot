import { NextResponse } from "next/server";
import { Resend } from "resend";

import { findSupportContact } from "@/lib/platform-support";

function getStringField(body: Record<string, unknown>, field: string) {
  const value = body[field];

  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: "RESEND_API_KEY is not configured." },
      { status: 500 }
    );
  }

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
  const platformName = getStringField(fields, "platform_name");
  const subject = getStringField(fields, "subject");
  const letter = getStringField(fields, "letter");
  const replyTo = getStringField(fields, "reply_to");
  const contact = findSupportContact(platformName);

  if (!platformName || !subject || !letter) {
    return NextResponse.json(
      { error: "platform_name, subject, and letter are required." },
      { status: 400 }
    );
  }

  if (!contact) {
    return NextResponse.json(
      { error: `No support email is configured for ${platformName}.` },
      { status: 404 }
    );
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const from =
    process.env.RESEND_FROM_EMAIL ?? "GriefPilot <onboarding@resend.dev>";

  const { data, error } = await resend.emails.send({
    from,
    to: contact.supportEmail,
    replyTo: replyTo || undefined,
    subject,
    text: letter
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    id: data?.id,
    to: contact.supportEmail
  });
}
