"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { createSupabaseServerClient } from "@/lib/supabase";

type DiscoveredAccount = {
  platform_name: string;
  category: string;
  suggested_action: string;
  priority: number;
};

export async function createEstate(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const dateOfDeath = String(formData.get("date_of_death") ?? "").trim();
  const familyMemberName = String(
    formData.get("family_member_name") ?? ""
  ).trim();

  if (!name || !email || !dateOfDeath || !familyMemberName) {
    throw new Error(
      "Name, email, date of death, and family member name are required."
    );
  }

  const estateId = crypto.randomUUID();
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("estates").insert({
    id: estateId,
    name,
    email,
    date_of_death: dateOfDeath
  });

  if (error) {
    throw new Error(`Unable to create estate: ${error.message}`);
  }

  const requestHeaders = headers();
  const origin =
    requestHeaders.get("origin") ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000";

  const discoveryResponse = await fetch(`${origin}/api/discover-accounts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email }),
    cache: "no-store"
  });
  const discoveryData = (await discoveryResponse.json()) as {
    accounts?: DiscoveredAccount[];
    error?: string;
  };

  if (!discoveryResponse.ok) {
    throw new Error(
      discoveryData.error ?? "Unable to discover digital accounts."
    );
  }

  const accounts = discoveryData.accounts ?? [];

  if (accounts.length > 0) {
    const { error: accountsError } = await supabase
      .from("digital_accounts")
      .insert(
        accounts.map((account) => ({
          estate_id: estateId,
          platform_name: account.platform_name,
          account_type: account.category,
          status: "not_started",
          action_taken: account.suggested_action
        }))
      );

    if (accountsError) {
      throw new Error(
        `Unable to save discovered accounts: ${accountsError.message}`
      );
    }
  }

  redirect(
    `/dashboard?estateId=${estateId}&familyMemberName=${encodeURIComponent(
      familyMemberName
    )}`
  );
}
