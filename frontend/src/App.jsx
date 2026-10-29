import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API = "http://127.0.0.1:8000";

function App() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Suggested-reply state
  const [replyTicketId, setReplyTicketId] = useState(null);
  const [suggestedReply, setSuggestedReply] = useState("");
  const [replyLoadingId, setReplyLoadingId] = useState(null);
  const [replyError, setReplyError] = useState("");
  const [copyMessage, setCopyMessage] = useState("");

  const [form, setForm] = useState({
    customer_name: "",
    email: "",
    subject: "",
    description: "",
  });

  async function loadTickets() {
    try {
      setError("");
      const response = await fetch(`${API}/api/tickets/`);
      if (!response.ok) throw new Error("Could not load tickets");
      setTickets(await response.json());
    } catch (err) {
      setError(`${err.message}. Is your backend running?`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTickets();
  }, []);

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesFilter =
        filter === "All" || ticket.status === filter;
      const term = search.toLowerCase();
      const matchesSearch = [
        ticket.customer_name,
        ticket.email,
        ticket.subject,
        ticket.category,
      ].some((value) => (value || "").toLowerCase().includes(term));

      return matchesFilter && matchesSearch;
    });
  }, [tickets, filter, search]);

  async function createTicket(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const response = await fetch(`${API}/api/tickets/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          data.detail?.[0]?.msg || data.detail || "Could not create ticket"
        );
      }

      setForm({
        customer_name: "",
        email: "",
        subject: "",
        description: "",
      });
      setShowForm(false);
      await loadTickets();
    } catch (err) {
      setError(typeof err.message === "string" ? err.message : "Could not create ticket");
    } finally {
      setSaving(false);
    }
  }

  async function updateTicket(id, changes) {
    try {
      const response = await fetch(`${API}/api/tickets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changes),
      });
      if (!response.ok) throw new Error("Update failed");
      await loadTickets();
    } catch (err) {
      setError(err.message);
    }
  }

  async function generateReply(ticket) {
    setReplyTicketId(ticket.id);
    setSuggestedReply("");
    setReplyError("");
    setCopyMessage("");
    setReplyLoadingId(ticket.id);

    try {
      const response = await fetch(
        `${API}/api/tickets/${ticket.id}/suggest-reply`,
        { method: "POST" }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const detail =
          typeof data.detail === "string"
            ? data.detail
            : "Could not generate a suggested reply.";
        throw new Error(detail);
      }

      if (!data.suggested_reply) {
        throw new Error("The API response did not contain a suggested reply.");
      }

      setSuggestedReply(data.suggested_reply);
    } catch (err) {
      setReplyError(
        `${err.message} Check that the backend is running and the suggest-reply endpoint is available.`
      );
    } finally {
      setReplyLoadingId(null);
    }
  }

  async function copyReply() {
    if (!suggestedReply.trim()) return;

    try {
      await navigator.clipboard.writeText(suggestedReply);
      setCopyMessage("Reply copied to clipboard.");
    } catch {
      setCopyMessage(
        "Clipboard access was blocked. Select the reply text and copy it manually."
      );
    }
  }

  const openCount = tickets.filter((t) => t.status === "Open").length;
  const progressCount = tickets.filter(
    (t) => t.status === "In Progress"
  ).length;
  const resolvedCount = tickets.filter(
    (t) => t.status === "Resolved" || t.status === "Closed"
  ).length;
  const urgentCount = tickets.filter(
    (t) => t.priority === "Critical" || t.priority === "High"
  ).length;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">S</div>
          <div>
            <h2>SupportIQ</h2>
            <span>SMARTER SUPPORT</span>
          </div>
        </div>

        <p className="nav-label">WORKSPACE</p>
        <button className="nav-item active" onClick={() => setFilter("All")}>
          ▦ &nbsp; Overview
        </button>
        <button className="nav-item" onClick={() => setFilter("All")}>
          ▤ &nbsp; All tickets
        </button>
        <button className="nav-item" onClick={() => setFilter("Open")}>
          ◷ &nbsp; Open tickets
        </button>
        <button className="nav-item" onClick={() => setFilter("Resolved")}>
          ✓ &nbsp; Resolved
        </button>

        <div className="sidebar-bottom">
          <div className="avatar">B</div>
          <div>
            <strong>Support Admin</strong>
            <span>Workspace owner</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">CUSTOMER EXPERIENCE</p>
            <h1>Support overview</h1>
            <p className="subtitle">
              Here's what's happening with your support team.
            </p>
          </div>
          <button
            className="primary-button"
            onClick={() => setShowForm(!showForm)}
          >
            + &nbsp; Create ticket
          </button>
        </header>

        {error && <div className="error-banner">{error}</div>}

        {showForm && (
          <form className="ticket-form" onSubmit={createTicket}>
            <h2>Create a support ticket</h2>
            <div className="form-grid">
              <label>
                Customer name
                <input
                  required
                  value={form.customer_name}
                  onChange={(e) =>
                    setForm({ ...form, customer_name: e.target.value })
                  }
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                />
              </label>
              <label className="full-width">
                Subject
                <input
                  required
                  minLength={3}
                  value={form.subject}
                  onChange={(e) =>
                    setForm({ ...form, subject: e.target.value })
                  }
                />
              </label>
              <label className="full-width">
                Description
                <textarea
                  required
                  minLength={10}
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </label>
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
              <button className="primary-button" disabled={saving}>
                {saving ? "Creating..." : "Submit ticket"}
              </button>
            </div>
          </form>
        )}

        <section className="stats-grid">
          <Stat label="Total tickets" value={tickets.length} icon="▤" />
          <Stat label="Open tickets" value={openCount} icon="◷" />
          <Stat label="In progress" value={progressCount} icon="↗" />
          <Stat label="Resolved" value={resolvedCount} icon="✓" />
        </section>

        <section className="ticket-section">
          <div className="section-heading">
            <div>
              <h2>Support tickets</h2>
              <p>Manage and track customer requests.</p>
            </div>
            <span className="ticket-count">
              {filteredTickets.length} tickets
            </span>
          </div>

          <div className="toolbar">
            <input
              className="search-input"
              placeholder="⌕  Search tickets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option>All</option>
              <option>Open</option>
              <option>In Progress</option>
              <option>Resolved</option>
              <option>Closed</option>
            </select>
            <button
              type="button"
              className="secondary-button"
              onClick={loadTickets}
            >
              ↻ Refresh
            </button>
          </div>

          {loading ? (
            <div className="empty-state">Loading tickets...</div>
          ) : filteredTickets.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">▤</div>
              <h3>No tickets found</h3>
              <p>Create a ticket or adjust your search.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Customer / Subject</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>AI reply</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td>
                        <strong>{ticket.subject}</strong>
                        <span className="cell-subtitle">
                          {ticket.customer_name} · {ticket.email}
                        </span>
                      </td>
                      <td>{ticket.category || "Unclassified"}</td>
                      <td>
                        <span
                          className={`badge priority-${(
                            ticket.priority || "Medium"
                          ).toLowerCase()}`}
                        >
                          {ticket.priority || "Medium"}
                        </span>
                      </td>
                      <td>
                        <select
                          className="status-select"
                          value={ticket.status}
                          onChange={(e) =>
                            updateTicket(ticket.id, {
                              status: e.target.value,
                            })
                          }
                        >
                          <option>Open</option>
                          <option>In Progress</option>
                          <option>Resolved</option>
                          <option>Closed</option>
                        </select>
                      </td>
                      <td>
                        {ticket.created_at
                          ? new Date(ticket.created_at).toLocaleDateString()
                          : "—"}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="secondary-button"
                          disabled={replyLoadingId === ticket.id}
                          onClick={() => generateReply(ticket)}
                        >
                          {replyLoadingId === ticket.id
                            ? "Generating..."
                            : replyTicketId === ticket.id && suggestedReply
                              ? "Regenerate"
                              : "Generate reply"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {replyTicketId && (
            <section
              className="ticket-form"
              aria-live="polite"
              style={{ marginTop: "24px" }}
            >
              <div className="section-heading">
                <div>
                  <h2>AI-suggested reply</h2>
                  <p>
                    Review and edit this draft before sending it to the customer.
                  </p>
                </div>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    setReplyTicketId(null);
                    setSuggestedReply("");
                    setReplyError("");
                    setCopyMessage("");
                  }}
                >
                  Close
                </button>
              </div>

              {replyLoadingId === replyTicketId && (
                <p role="status">Generating a suggested reply...</p>
              )}

              {replyError && (
                <div className="error-banner" role="alert">
                  {replyError}
                </div>
              )}

              {suggestedReply && (
                <>
                  <label className="full-width">
                    Suggested response
                    <textarea
                      rows={10}
                      value={suggestedReply}
                      onChange={(e) => {
                        setSuggestedReply(e.target.value);
                        setCopyMessage("");
                      }}
                      style={{
                        width: "100%",
                        marginTop: "8px",
                        resize: "vertical",
                        boxSizing: "border-box",
                      }}
                    />
                  </label>
                  <div className="form-actions">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={copyReply}
                    >
                      Copy reply
                    </button>
                    {copyMessage && (
                      <span role="status" aria-live="polite">
                        {copyMessage}
                      </span>
                    )}
                  </div>
                </>
              )}
            </section>
          )}
        </section>

        <footer>SupportIQ · Customer support, made smarter.</footer>
      </main>
    </div>
  );
}

function Stat({ label, value, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{label}</span>
        <span className="stat-icon">{icon}</span>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-caption">Live from your ticket database</div>
    </div>
  );
}

export default App;
