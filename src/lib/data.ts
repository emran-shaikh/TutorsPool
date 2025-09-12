import { supabase } from '@/lib/supabase';
import { fetchTutors as apiFetchTutors, submitTutorRegistration as apiSubmitTutor, submitBooking as apiSubmitBooking, fetchBookings as apiFetchBookings } from '@/lib/api';

export async function createTutor(payload: { fullName: string; email: string; subjects?: string[]; bio?: string; userId?: string }) {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('tutors')
        .insert([{ full_name: payload.fullName, email: payload.email, subjects: payload.subjects ?? [], bio: payload.bio, user_id: payload.userId ?? null }])
        .select('*')
        .single();
      if (error) throw new Error(error.message);
      return { tutor: { id: data.id, fullName: data.full_name, email: data.email, subjects: data.subjects, bio: data.bio } };
    } catch (err: any) {
      const msg = String(err?.message || err || '');
      if (msg.toLowerCase().includes('could not find the table') || msg.toLowerCase().includes('relation')) {
        // Fallback to local API if tables aren't set up yet
        return apiSubmitTutor(payload);
      }
      throw err;
    }
  }
  return apiSubmitTutor(payload);
}

export async function listTutors(params?: { q?: string; subject?: string }) {
  if (supabase) {
    try {
      let query = supabase.from('tutors').select('*');
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      let items = (data || []).map((t: any) => ({ id: t.id, fullName: t.full_name, email: t.email, subjects: t.subjects || [], bio: t.bio }));
      if (params?.q) {
        const q = params.q.toLowerCase();
        items = items.filter((t: any) => t.fullName.toLowerCase().includes(q) || (t.email || '').toLowerCase().includes(q) || (t.bio || '').toLowerCase().includes(q));
      }
      if (params?.subject) {
        const s = params.subject.toLowerCase();
        items = items.filter((t: any) => (t.subjects || []).some((x: string) => x.toLowerCase().includes(s)));
      }
      return { items, total: items.length };
    } catch (err: any) {
      const msg = String(err?.message || err || '');
      if (msg.toLowerCase().includes('could not find the table') || msg.toLowerCase().includes('relation')) {
        return apiFetchTutors(params);
      }
      throw err;
    }
  }
  return apiFetchTutors(params);
}

export async function createBooking(payload: { tutorName: string; date: string; time: string; studentId?: string; tutorId?: string }) {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert([{ tutor_name: payload.tutorName, date: payload.date, time: payload.time, student_id: payload.studentId ?? null, tutor_id: payload.tutorId ?? null }])
        .select('*')
        .single();
      if (error) throw new Error(error.message);
      return { booking: { id: data.id, tutorName: data.tutor_name, date: data.date, time: data.time, createdAt: data.created_at } };
    } catch (err: any) {
      const msg = String(err?.message || err || '');
      if (msg.toLowerCase().includes('could not find the table') || msg.toLowerCase().includes('relation')) {
        return apiSubmitBooking({ tutorName: payload.tutorName, date: payload.date, time: payload.time });
      }
      throw err;
    }
  }
  return apiSubmitBooking({ tutorName: payload.tutorName, date: payload.date, time: payload.time });
}

export async function listBookings() {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      const items = (data || []).map((b: any) => ({ id: b.id, tutorName: b.tutor_name, date: b.date, time: b.time, createdAt: b.created_at }));
      return { items, total: items.length };
    } catch (err: any) {
      const msg = String(err?.message || err || '');
      if (msg.toLowerCase().includes('could not find the table') || msg.toLowerCase().includes('relation')) {
        return apiFetchBookings();
      }
      throw err;
    }
  }
  return apiFetchBookings();
}


