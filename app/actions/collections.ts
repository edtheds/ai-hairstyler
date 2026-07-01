"use server";

import { createClient } from "@/lib/supabase/server";
import { AppError } from "@/lib/utils/errors";

async function getAuthenticatedClient() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new AppError("Unauthorized", "UNAUTHORIZED", 401);
  return { supabase, userId: user.id };
}

export async function saveToFavorites(generationId: string) {
  const { supabase, userId } = await getAuthenticatedClient();

  const { data: favorites } = await supabase
    .from("collections")
    .select("id")
    .eq("user_id", userId)
    .eq("is_default", true)
    .single();

  if (!favorites) throw new AppError("Favorites collection not found", "NOT_FOUND");

  const { error } = await supabase.from("saved_items").insert({
    collection_id: favorites.id,
    generation_id: generationId,
    user_id: userId,
  });

  // Ignore unique constraint violations (already saved)
  if (error && !error.message.includes("unique")) {
    throw new AppError("Failed to save", "DB_ERROR");
  }
}

export async function saveToCollection(generationId: string, collectionId: string) {
  const { supabase, userId } = await getAuthenticatedClient();

  const { error } = await supabase.from("saved_items").insert({
    collection_id: collectionId,
    generation_id: generationId,
    user_id: userId,
  });

  if (error && !error.message.includes("unique")) {
    throw new AppError("Failed to save to collection", "DB_ERROR");
  }
}

export async function createCollection(name: string) {
  if (name.toLowerCase() === "favorites") {
    throw new AppError("Cannot create a collection named Favorites", "INVALID_INPUT", 400);
  }

  const { supabase, userId } = await getAuthenticatedClient();

  const { data, error } = await supabase
    .from("collections")
    .insert({ user_id: userId, name })
    .select("id")
    .single();

  if (error || !data) throw new AppError("Failed to create collection", "DB_ERROR");
  return data.id;
}

export async function deleteCollection(collectionId: string) {
  const { supabase, userId } = await getAuthenticatedClient();

  // Guard: never delete the default Favorites collection
  const { data } = await supabase
    .from("collections")
    .select("is_default")
    .eq("id", collectionId)
    .eq("user_id", userId)
    .single();

  if (!data) throw new AppError("Collection not found", "NOT_FOUND", 404);
  if (data.is_default) throw new AppError("Cannot delete Favorites", "FORBIDDEN", 403);

  const { error } = await supabase
    .from("collections")
    .delete()
    .eq("id", collectionId)
    .eq("user_id", userId);

  if (error) throw new AppError("Failed to delete collection", "DB_ERROR");
}

export async function removeFromCollection(savedItemId: string) {
  const { supabase, userId } = await getAuthenticatedClient();

  const { error } = await supabase
    .from("saved_items")
    .delete()
    .eq("id", savedItemId)
    .eq("user_id", userId);

  if (error) throw new AppError("Failed to remove item", "DB_ERROR");
}

export async function pinForComparison(generationId: string) {
  const { supabase, userId } = await getAuthenticatedClient();

  // Upsert session and append (max 4)
  const { data: session } = await supabase
    .from("comparison_sessions")
    .select("id, pinned_image_ids")
    .eq("user_id", userId)
    .single();

  const current = session?.pinned_image_ids ?? [];

  if (current.includes(generationId)) return; // Already pinned

  if (current.length >= 4) {
    throw new AppError("Maximum 4 images can be pinned for comparison", "LIMIT_EXCEEDED", 400);
  }

  const updated = [...current, generationId];

  if (session) {
    await supabase
      .from("comparison_sessions")
      .update({ pinned_image_ids: updated, updated_at: new Date().toISOString() })
      .eq("id", session.id);
  } else {
    await supabase.from("comparison_sessions").insert({
      user_id: userId,
      pinned_image_ids: updated,
    });
  }
}

export async function unpinFromComparison(generationId: string) {
  const { supabase, userId } = await getAuthenticatedClient();

  const { data: session } = await supabase
    .from("comparison_sessions")
    .select("id, pinned_image_ids")
    .eq("user_id", userId)
    .single();

  if (!session) return;

  const updated = session.pinned_image_ids.filter((id) => id !== generationId);

  await supabase
    .from("comparison_sessions")
    .update({ pinned_image_ids: updated, updated_at: new Date().toISOString() })
    .eq("id", session.id);
}
