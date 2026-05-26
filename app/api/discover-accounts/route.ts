import OpenAI from "openai";
import { NextResponse } from "next/server";

import {
  getMaxOutputTokens,
  getOpenAIModel,
  shouldUseMockOpenAI
} from "@/lib/openai-config";

type DiscoveryAccount = {
  platform_name: string;
  category: "streaming" | "social" | "finance" | "shopping" | "work";
  suggested_action: "cancel" | "memorialize" | "transfer";
  priority: number;
};

type DiscoveryResponse = {
  accounts: DiscoveryAccount[];
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function inferNameFromEmail(email: string) {
  const localPart = email.split("@")[0] ?? "";
  const cleaned = localPart
    .replace(/[._+-]+/g, " ")
    .replace(/\d+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) {
    return "Unknown person";
  }

  return cleaned
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function getEmailDomain(email: string) {
  return email.split("@")[1]?.toLowerCase() ?? "";
}

function parseJsonResponse(outputText: string): DiscoveryResponse {
  const parsed = JSON.parse(outputText) as DiscoveryResponse;

  return {
    accounts: parsed.accounts
      .filter((account) => account.platform_name.trim().length > 0)
      .slice(0, 30)
  };
}

function getMockAccounts(domain: string): DiscoveryResponse {
  const emailProvider =
    domain === "gmail.com"
      ? "Google"
      : ["icloud.com", "me.com", "mac.com"].includes(domain)
        ? "Apple iCloud"
        : ["outlook.com", "hotmail.com", "live.com"].includes(domain)
          ? "Microsoft"
          : "Primary email provider";

  return {
    accounts: [
      {
        platform_name: emailProvider,
        category: "work",
        suggested_action: "transfer",
        priority: 10
      },
      {
        platform_name: "Amazon",
        category: "shopping",
        suggested_action: "cancel",
        priority: 9
      },
      {
        platform_name: "LinkedIn",
        category: "social",
        suggested_action: "memorialize",
        priority: 8
      },
      {
        platform_name: "Netflix",
        category: "streaming",
        suggested_action: "cancel",
        priority: 6
      },
      {
        platform_name: "Spotify",
        category: "streaming",
        suggested_action: "cancel",
        priority: 5
      }
    ]
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

  const email =
    typeof body === "object" &&
    body !== null &&
    "email" in body &&
    typeof body.email === "string"
      ? body.email.trim().toLowerCase()
      : "";

  if (!emailPattern.test(email)) {
    return NextResponse.json(
      { error: "A valid email address is required." },
      { status: 400 }
    );
  }

  const name = inferNameFromEmail(email);
  const domain = getEmailDomain(email);

  if (shouldUseMockOpenAI()) {
    return NextResponse.json(getMockAccounts(domain));
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
      instructions:
        "You are an expert digital estate researcher. Generate likely digital services for after-loss account review. These are recommendations based on demographics, email provider/domain clues, and common consumer patterns, not verified account ownership.",
      input: [
        `Person name inferred from email: ${name}`,
        `Email domain: ${domain}`,
        "Return 20 to 30 realistic services this person may have used.",
        "Prefer common services for the domain when relevant, such as Gmail/Google services for gmail.com, iCloud/Apple services for icloud.com or me.com, and Microsoft services for outlook.com, hotmail.com, or live.com.",
        "Include a balanced mix across streaming, social, finance, shopping, and work.",
        "Use priority 10 for the most urgent or high-risk services to check first."
      ].join("\n"),
      text: {
        format: {
          type: "json_schema",
          name: "digital_account_discovery",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            required: ["accounts"],
            properties: {
              accounts: {
                type: "array",
                minItems: 20,
                maxItems: 30,
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: [
                    "platform_name",
                    "category",
                    "suggested_action",
                    "priority"
                  ],
                  properties: {
                    platform_name: {
                      type: "string",
                      description: "Name of the digital service or platform."
                    },
                    category: {
                      type: "string",
                      enum: [
                        "streaming",
                        "social",
                        "finance",
                        "shopping",
                        "work"
                      ]
                    },
                    suggested_action: {
                      type: "string",
                      enum: ["cancel", "memorialize", "transfer"]
                    },
                    priority: {
                      type: "integer",
                      minimum: 1,
                      maximum: 10
                    }
                  }
                }
              }
            }
          }
        }
      },
      temperature: 0.4,
      max_output_tokens: getMaxOutputTokens(1400)
    });

    const accounts = parseJsonResponse(response.output_text).accounts;

    return NextResponse.json({ accounts });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to discover accounts.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
