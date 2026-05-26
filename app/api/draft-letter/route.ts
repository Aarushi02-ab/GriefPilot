import OpenAI from "openai";
import { NextResponse } from "next/server";

import {
  getMaxOutputTokens,
  getOpenAIModel,
  shouldUseMockOpenAI
} from "@/lib/openai-config";

type ActionType = "cancel" | "memorialize" | "transfer";

type DraftLetterResponse = {
  subject: string;
  letter: string;
};

const actionTypes = new Set<ActionType>(["cancel", "memorialize", "transfer"]);

function getStringField(body: Record<string, unknown>, field: string) {
  const value = body[field];

  return typeof value === "string" ? value.trim() : "";
}

function parseJsonResponse(outputText: string): DraftLetterResponse {
  return JSON.parse(outputText) as DraftLetterResponse;
}

function getMockLetter({
  actionType,
  dateOfDeath,
  deceasedName,
  familyMemberName,
  platformName
}: {
  actionType: ActionType;
  dateOfDeath: string;
  deceasedName: string;
  familyMemberName: string;
  platformName: string;
}): DraftLetterResponse {
  return {
    subject: `Request to ${actionType} account for ${deceasedName}`,
    letter: [
      "[Date]",
      "",
      `${platformName} Support Team`,
      "",
      "To Whom It May Concern,",
      "",
      `I am writing to respectfully request that ${platformName} ${actionType} the account associated with ${deceasedName}, who passed away on ${dateOfDeath}. My name is ${familyMemberName}, and I am assisting with the administration of their personal and digital affairs.`,
      "",
      "Please let me know the documentation required to process this request. I understand that you may require a certified copy of the death certificate, proof of my identity, and documentation showing my relationship to the deceased or authority to act on behalf of the estate.",
      "",
      "If there are any account-specific forms, secure upload links, or additional steps required, please send those instructions to me so I can complete the process promptly.",
      "",
      "Thank you for your assistance and consideration during this difficult time.",
      "",
      "Sincerely,",
      familyMemberName,
      "[Phone number]",
      "[Email address]",
      "[Mailing address]"
    ].join("\n")
  };
}

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
  const platformName = getStringField(fields, "platform_name");
  const actionType = getStringField(fields, "action_type") as ActionType;
  const deceasedName = getStringField(fields, "deceased_name");
  const dateOfDeath = getStringField(fields, "date_of_death");
  const familyMemberName = getStringField(fields, "family_member_name");

  if (
    !platformName ||
    !actionTypes.has(actionType) ||
    !deceasedName ||
    !dateOfDeath ||
    !familyMemberName
  ) {
    return NextResponse.json(
      {
        error:
          "platform_name, action_type, deceased_name, date_of_death, and family_member_name are required. action_type must be cancel, memorialize, or transfer."
      },
      { status: 400 }
    );
  }

  if (shouldUseMockOpenAI()) {
    return NextResponse.json(
      getMockLetter({
        actionType,
        dateOfDeath,
        deceasedName,
        familyMemberName,
        platformName
      })
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured." },
      { status: 500 }
    );
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const response = await openai.responses.create({
      model: getOpenAIModel(),
      instructions: [
        "You draft formal, compassionate digital estate correspondence.",
        "Use standard estate-administration conventions: clear subject line, date placeholder, recipient salutation, identification of the deceased, date of death, requester identity, requested action, documentation list, and respectful close.",
        "Mention that the platform may require a certified death certificate and proof of the family member's authority or relationship.",
        "Do not invent statutes, court orders, account numbers, addresses, or platform-specific policies.",
        "Write a letter that can be pasted into an email or printed."
      ].join(" "),
      input: [
        `Platform name: ${platformName}`,
        `Requested action: ${actionType}`,
        `Deceased person's name: ${deceasedName}`,
        `Date of death: ${dateOfDeath}`,
        `Family member name: ${familyMemberName}`,
        "Draft the letter in a formal but compassionate tone.",
        "Include sensible placeholders only where the caller did not provide required mailing or account details."
      ].join("\n"),
      text: {
        format: {
          type: "json_schema",
          name: "digital_estate_letter",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            required: ["subject", "letter"],
            properties: {
              subject: {
                type: "string",
                description: "Email-ready subject line for the request."
              },
              letter: {
                type: "string",
                description:
                  "Formal letter body ready for email or print, including placeholders for missing sender/account details."
              }
            }
          }
        }
      },
      temperature: 0.3,
      max_output_tokens: getMaxOutputTokens(900)
    });

    const letter = parseJsonResponse(response.output_text);

    return NextResponse.json(letter);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to draft letter.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
