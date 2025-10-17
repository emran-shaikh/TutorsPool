// Supabase has been removed from the project.
// Provide safe no-op exports to avoid crashes if any stale imports remain.

export const supabase: any = null;

export const getCurrentUser = async () => {
  return null;
};

export const signOut = async () => {
  return;
};