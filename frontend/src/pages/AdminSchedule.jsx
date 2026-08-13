import { useState, useEffect } from "react";
import "./styles/adminSchedule.css";

const API_BASE = "http://localhost:5000";
const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const weekdayLabels = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function AdminSchedule() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1); // 1-indexed
  const [year, setYear] = useState(today.getFullYear());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("adminToken");
        const res = await fetch(`${API_BASE}/api/admin/schedule?month=${month}&year=${year}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        setData(json);
        setSelectedDay(null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [month, year]);

  const goPrevMonth = () => {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };

  const goNextMonth = () => {
    if (month === 12) { setMonth(1); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  };

  if (loading || !data) return <p>Loading...</p>;

  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const leadingBlanks = Array.from({ length: firstWeekday });
  const selected = selectedDay ? data.days.find((d) => d.day === selectedDay) : null;

 const todayDate = new Date();
todayDate.setHours(0, 0, 0, 0);
const isCurrentMonth = todayDate.getFullYear() === year && todayDate.getMonth() + 1 === month;
const todayDayNum = todayDate.getDate();

const upcomingEvents = data.days
  .filter((d) => {
    if (d.events.length === 0) return false;
    if (!isCurrentMonth) return true; // viewing a future month entirely — all days qualify
    return d.day >= todayDayNum; // viewing current month — only today or later
  })
  .slice(0, 6);

  return (
    <div className="admin-schedule-page">
      <h1>Schedule Calendar</h1>
      <p className="admin-schedule-subtitle">Hotel availability, check-ins, and check-outs</p>

      <div className="admin-schedule-layout">
        <div className="admin-calendar-card">
          <div className="admin-calendar-header">
            <button onClick={goPrevMonth}>‹</button>
            <h2>{monthNames[month - 1]} {year}</h2>
            <button onClick={goNextMonth}>›</button>
          </div>

          <div className="admin-calendar-grid admin-calendar-weekdays">
            {weekdayLabels.map((w) => <span key={w}>{w}</span>)}
          </div>

          <div className="admin-calendar-grid">
            {leadingBlanks.map((_, i) => <div key={`blank-${i}`} className="admin-calendar-cell admin-calendar-cell--blank" />)}
            {data.days.map((d) => (
              <div
                key={d.day}
                className={`admin-calendar-cell admin-calendar-cell--${d.intensity}${selectedDay === d.day ? " admin-calendar-cell--selected" : ""}`}
                onClick={() => setSelectedDay(d.day)}
              >
                <span>{d.day}</span>
                {d.intensity !== "none" && <span className="admin-calendar-dot" />}
              </div>
            ))}
          </div>

          <div className="admin-calendar-legend">
            <span><i className="admin-legend-dot admin-legend-dot--peak" /> Peak</span>
            <span><i className="admin-legend-dot admin-legend-dot--busy" /> Busy</span>
            <span><i className="admin-legend-dot admin-legend-dot--light" /> Light</span>
          </div>
        </div>

        <div className="admin-schedule-side">
          {selected ? (
            <>
              <div className="admin-day-summary-card">
                <p className="admin-day-summary-date">
                  {year}-{String(month).padStart(2, "0")}-{String(selected.day).padStart(2, "0")}
                </p>
                {selected.intensity !== "none" && (
                  <span className={`admin-day-badge admin-day-badge--${selected.intensity}`}>
                    {selected.intensity === "peak" ? "Peak day" : selected.intensity === "busy" ? "Busy day" : "Light day"}
                  </span>
                )}

                <div className="admin-day-stat admin-day-stat--in">
                  <span>Check-ins</span>
                  <strong>{selected.checkIns}</strong>
                </div>
                <div className="admin-day-stat admin-day-stat--out">
                  <span>Check-outs</span>
                  <strong>{selected.checkOuts}</strong>
                </div>
              </div>
            </>
          ) : (
            <div className="admin-day-summary-card admin-day-summary-card--empty">
              <p>Select a day to see details</p>
            </div>
          )}

          <div className="admin-upcoming-card">
            <h3>Upcoming Events</h3>
            {upcomingEvents.length === 0 ? (
              <p className="admin-upcoming-empty">No events this month.</p>
            ) : (
              <ul className="admin-upcoming-list">
                {upcomingEvents.map((d) => (
                  <li key={d.day}>
                    <span className={`admin-legend-dot admin-legend-dot--${d.intensity}`} />
                    <div>
                      <p className="admin-upcoming-date">
                        {year}-{String(month).padStart(2, "0")}-{String(d.day).padStart(2, "0")}
                      </p>
                      <p className="admin-upcoming-detail">{d.checkIns} in / {d.checkOuts} out</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminSchedule;