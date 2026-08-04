import React, { useState, useEffect } from "react";
import { Calendar, Clock, Building2, Instagram, CheckCircle, Clock3, Archive, Search, Mail, Phone } from "lucide-react";
import { API_BASE } from "../../utils/api";
import PaperHoofSelect from "../../components/ui/PaperHoofSelect";

export default function AdminBookings({ showToast }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);

  const token = localStorage.getItem("paperhoof_admin_token");

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setBookings(data);
    } catch (err) {
      console.error("Failed to load bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId, newStatus, clientName) => {
    setUpdatingId(bookingId);
    try {
      const res = await fetch(`${API_BASE}/bookings/${bookingId}/status?status=${newStatus}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to update status");
      }

      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
      );
      if (showToast) showToast("success", `Booking ${newStatus}`, `${clientName}'s session marked as ${newStatus}.`);
    } catch (err) {
      if (showToast) showToast("error", "Update failed", err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      `${b.firstName} ${b.lastName} ${b.email} ${b.company} ${b.service}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#123524]">Client Session Bookings</h1>
          <p className="text-sm text-gray-600">
            Review detailed consultation appointments, client budget estimates, and contact requests submitted through the website.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search clients..."
              className="custom-input pl-9 text-xs w-48 sm:w-64"
            />
          </div>

          <div className="w-44">
            <PaperHoofSelect
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: "all", label: "All Statuses" },
                { value: "pending", label: "Pending" },
                { value: "confirmed", label: "Confirmed" },
                { value: "archived", label: "Archived" },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Bookings Stats Single Row (3 Columns Side by Side) */}
      <div className="bookings-stats-grid">
        <div className="stat-card p-4 h-full flex flex-col justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Bookings</span>
          <div className="text-3xl font-extrabold text-[#123524]">{bookings.length}</div>
        </div>
        <div className="stat-card p-4 h-full flex flex-col justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">Pending Review</span>
          <div className="text-3xl font-extrabold text-amber-600">
            {bookings.filter((b) => b.status === "pending").length}
          </div>
        </div>
        <div className="stat-card p-4 h-full flex flex-col justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#166534]">Confirmed Sessions</span>
          <div className="text-3xl font-extrabold text-[#166534]">
            {bookings.filter((b) => b.status === "confirmed").length}
          </div>
        </div>
      </div>

      {/* Bookings List Table */}
      <div className="editor-card p-0 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 font-medium">Loading booking records...</div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-12 text-center text-gray-500 font-medium">
            No bookings found matching your filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-700">
              <thead className="bg-[#f9fafb] text-xs uppercase tracking-wider text-[#374151] border-b border-gray-200">
                <tr>
                  <th className="p-4 font-bold">Client</th>
                  <th className="p-4 font-bold">Date & Time Slot</th>
                  <th className="p-4 font-bold">Service & Budget</th>
                  <th className="p-4 font-bold">Contact & Socials</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredBookings.map((item) => (
                  <tr key={item.id} className="hover:bg-[#f0fdf4]/50 transition-colors">
                    {/* Client Info */}
                    <td className="p-4">
                      <div className="font-bold text-[#123524]">
                        {item.firstName} {item.lastName}
                      </div>
                      {item.company && (
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3 text-[#166534]" />
                          <span>{item.company}</span>
                        </div>
                      )}
                    </td>

                    {/* Date & Time */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-[#166534] font-semibold">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{item.dateStr}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{item.timeSlot}</span>
                      </div>
                    </td>

                    {/* Service & Budget */}
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-md bg-[#f0fdf4] border border-[#bbf7d0] text-[#166534] text-xs font-semibold">
                        {item.service || "Brand Consultation"}
                      </span>
                      {item.budget && (
                        <div className="text-xs text-gray-500 mt-1 font-mono">
                          Budget: {item.budget}
                        </div>
                      )}
                    </td>

                    {/* Contact & Socials */}
                    <td className="p-4 space-y-1 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        <a href={`mailto:${item.email}`} className="text-[#123524] hover:underline font-medium">
                          {item.email}
                        </a>
                      </div>
                      {item.phone && (
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          <span>{item.phone}</span>
                        </div>
                      )}
                      {item.instagram && (
                        <div className="flex items-center gap-1.5 text-[#be185d]">
                          <Instagram className="w-3.5 h-3.5" />
                          <span>@{item.instagram.replace("@", "")}</span>
                        </div>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          item.status === "confirmed"
                            ? "bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0]"
                            : item.status === "archived"
                            ? "bg-gray-100 text-gray-600 border border-gray-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {item.status || "pending"}
                      </span>
                    </td>

                    {/* Action Controls */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleStatusChange(item.id, "confirmed", `${item.firstName} ${item.lastName}`)}
                          disabled={updatingId === item.id}
                          className="p-1.5 rounded-lg hover:bg-emerald-100 text-[#166534] transition-colors"
                          title="Mark Confirmed"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleStatusChange(item.id, "pending", `${item.firstName} ${item.lastName}`)}
                          disabled={updatingId === item.id}
                          className="p-1.5 rounded-lg hover:bg-amber-100 text-amber-600 transition-colors"
                          title="Mark Pending"
                        >
                          <Clock3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleStatusChange(item.id, "archived", `${item.firstName} ${item.lastName}`)}
                          disabled={updatingId === item.id}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                          title="Archive Booking"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
