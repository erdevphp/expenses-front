import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

import { getExpenseCalendar } from "../../api/expenseApi";

export default function ExpenseCalendar() {
  const [data, setData] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await getExpenseCalendar();
    setData(res.data);
  };

  // transformation FullCalendar
  const events = data.map((d) => ({
    id: d.date,
    title: `${d.total.toLocaleString()} Ar`,
    date: d.date,
    backgroundColor: d.total > 50000 ? "#ef4444" : "#3b82f6",
    borderColor: "transparent",
    extendedProps: {
      expenses: d.expenses,
      total: d.total,
    },
  }));

  const handleDateClick = (info) => {
    const found = data.find((d) => d.date === info.dateStr);
    setSelectedDay(found || null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

      {/* CALENDAR */}
      <div className="lg:col-span-2 bg-white rounded-2xl p-4 shadow-sm">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          dateClick={handleDateClick}
          height="auto"
        />
      </div>

      {/* SIDE PANEL */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h2 className="font-bold text-lg mb-3">
          Détails du jour
        </h2>

        {!selectedDay ? (
          <p className="text-slate-400">
            Clique sur une date
          </p>
        ) : (
          <>
            <p className="font-semibold mb-2">
              {selectedDay.date}
            </p>

            <p className="text-blue-600 font-bold mb-3">
              Total : {selectedDay.total.toLocaleString()} Ar
            </p>

            <div className="space-y-2">
              {selectedDay.expenses.map((e) => (
                <div
                  key={e.id}
                  className="p-2 rounded-lg bg-slate-100"
                >
                  <p className="font-medium">{e.title}</p>
                  <p className="text-sm text-slate-500">
                    {e.category} — {e.amount.toLocaleString()} Ar
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

    </div>
  );
}