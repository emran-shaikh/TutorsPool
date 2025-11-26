import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button"; // optional, adjust or replace with your button
import { useAuth } from "@/contexts/AuthContext"; // optional: to logout on 401 if you want

type Booking = {
  id: string;
  tutorName?: string;
  userName?: string;
  slot?: string;
  date?: string;
  status?: string;
  [key: string]: any;
};

const TRUNCATE_LENGTH = 1000;

function truncate(s: string, n = TRUNCATE_LENGTH) {
  if (!s) return "";
  return s.length > n ? s.slice(0, n) + "… (truncated)" : s;
}

/**
 * Safely parse a Response as JSON. If the response is HTML (starts with "<!DOCTYPE" or "<html"),
 * return a thrown error containing the raw text so callers can detect it.
 */
async function parseJsonSafe(res: Response) {
  // Prefer content-type header if present
  const contentType = res.headers.get("content-type") || "";

  // Always read as text first to be defensive
  const text = await res.text();

  // Quick check for HTML pages — common cause of "Unexpected token '<'"
  const startsWithHtml = /^\s*<(!doctype|html|!)?/i.test(text);

  // If status indicates an error and server returned HTML, throw informative error
  if (startsWithHtml && !contentType.includes("application/json")) {
    const err: any = new Error("Server returned HTML instead of JSON");
    err.type = "html-response";
    err.status = res.status;
    err.raw = text;
    throw err;
  }

  // Try to parse JSON; if it fails, throw with raw text to help debugging
  try {
    const parsed = text ? JSON.parse(text) : {};
    return parsed;
  } catch (e) {
    const err: any = new Error("Invalid JSON from server");
    err.type = "invalid-json";
    err.status = res.status;
    err.raw = text;
    throw err;
  }
}

const AdminDashboard: React.FC = () => {
  const [bookings, setBookings] = React.useState<Booking[] | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [serverPreview, setServerPreview] = React.useState<string | null>(null);
  const [attempts, setAttempts] = React.useState(0);
  const abortRef = React.useRef<AbortController | null>(null);

  const navigate = useNavigate();
  const auth = useAuth?.(); // optional, depends on your project. Use safely.

  // Adjust this URL if your API route is different.
  const BOOKINGS_API = "/api/bookings";

  const fetchBookings = React.useCallback(
    async (opts?: { force?: boolean }) => {
      setLoading(true);
      setError(null);
      setServerPreview(null);

      // Abort previous request if any
      if (abortRef.current) {
        abortRef.current.abort();
      }
      const ac = new AbortController();
      abortRef.current = ac;

      try {
        const token = localStorage.getItem('token');
        const res = await fetch(BOOKINGS_API, {
          method: "GET",
          signal: ac.signal,
          headers: {
            Accept: "application/json, text/*;q=0.8",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });

        // Handle common status codes early
        if (res.status === 401) {
          // unauthorized — optionally logout or redirect to login
          setError("Unauthorized. Please login again.");
          setServerPreview(`HTTP 401 returned from ${BOOKINGS_API}`);
          if (auth?.logout) {
            try {
              auth.logout();
            } catch (e) {
              // ignore
            }
          }
          navigate("/login");
          return;
        }

        if (res.status >= 500) {
          // server error — read text for debugging
          const text = await res.text().catch(() => "");
          setError(`Server error (${res.status}).`);
          setServerPreview(truncate(text));
          return;
        }

        // Parse safely
        const data = await parseJsonSafe(res);

        // Optional: normalize data shape
        if (!data) {
          setBookings([]);
        } else if (Array.isArray(data)) {
          setBookings(data);
        } else if (data.items && Array.isArray(data.items)) {
          setBookings(data.items);
        } else if (data.bookings && Array.isArray(data.bookings)) {
          setBookings(data.bookings);
        } else if (data.data && Array.isArray(data.data)) {
          setBookings(data.data);
        } else {
          // If shape unknown, set as empty and show preview
          setBookings([]);
          setServerPreview(truncate(JSON.stringify(data, null, 2)));
          setError("Unexpected response shape from server.");
        }
      } catch (err: any) {
        if (err?.name === "AbortError") {
          // request was aborted — don't treat as error
          return;
        }

        // If we detected HTML returned, err.raw will have the content
        if (err?.type === "html-response" || err?.type === "invalid-json") {
          setError(
            `Backend returned non-JSON (${err?.status ?? "unknown status"}) — see preview for details.`
          );
          setServerPreview(truncate(err.raw ?? String(err)));
        } else {
          // Generic network / CORS / other error
          setError(String(err?.message ?? "Network error"));
          // if raw content is available attach it
          if (err?.raw) setServerPreview(truncate(err.raw));
        }

        // allow retry attempts counter
        setAttempts((a) => a + 1);
      } finally {
        setLoading(false);
      }
    },
    [BOOKINGS_API, auth, navigate]
  );

  React.useEffect(() => {
    fetchBookings();

    // cleanup on unmount
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run only once

  const handleRetry = () => {
    setAttempts(0);
    fetchBookings({ force: true });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Dashboard</h2>
        <div className="flex items-center gap-2">
          <Button onClick={() => fetchBookings({ force: true })} disabled={loading}>
            Refresh
          </Button>
          <Button variant="ghost" onClick={handleRetry} disabled={loading}>
            Retry
          </Button>
        </div>
      </div>

      {loading && (
        <div className="rounded-md border border-dashed border-gray-200 p-6">
          <p className="text-sm text-gray-600">Loading bookings…</p>
        </div>
      )}

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4">
          <div className="flex items-start justify-between">
            <div>
              <strong className="text-sm text-red-800">Error: </strong>
              <span className="text-sm text-red-700">{error}</span>
              {attempts > 0 && (
                <span className="ml-2 text-xs text-gray-500">Attempts: {attempts}</span>
              )}
              {serverPreview && (
                <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap rounded bg-white p-2 text-xs text-gray-700">
                  {serverPreview}
                </pre>
              )}
            </div>
            <div className="ml-4 flex-shrink-0">
              <Button onClick={() => fetchBookings({ force: true })}>Try again</Button>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && bookings && bookings.length === 0 && (
        <div className="rounded-md border border-dashed border-gray-200 p-6 text-center">
          <p className="text-sm text-gray-600">No bookings found.</p>
        </div>
      )}

      {!loading && !error && bookings && bookings.length > 0 && (
        <div className="overflow-x-auto rounded-md border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tutor</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">User</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Slot</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td className="px-4 py-3 text-sm text-gray-700">{b.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{b.tutorName ?? "-"}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{b.userName ?? "-"}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{b.date ?? "-"}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{b.slot ?? "-"}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{b.status ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
