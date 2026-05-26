"use server";

import { redirect } from "next/navigation";

import { createSupabaseClient } from "@/lib/supabase";

export async function createEstate(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const dateOfDeath = String(formData.get("date_of_death") ?? "").trim();

  if (!name || !email || !dateOfDeath) {
    throw new Error("Name, email, and date of death are required.");
  }

  const supabase = createSupabaseClient();
  const { error } = await supabase.from("estates").insert({
    name,
    email,
    date_of_death: dateOfDeath
  });

  if (error) {
    throw new Error(`Unable to create estate: ${error.message}`);
  }

  redirect("/dashboard");
}
