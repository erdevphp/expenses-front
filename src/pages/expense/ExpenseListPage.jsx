import {useEffect, useMemo, useState} from "react";
import {
  createExpense,
  deleteExpense,
  getExpenses,
} from "../../api/expenseApi";

import {Search, Plus, X} from "lucide-react";

const CATEGORIES = [
  "Alimentation",
  "Transport",
  "Logement",
  "Sante",
  "Education",
  "Loisirs",
  "Abonnements",
  "Shopping",
  "Epargne",
  "Business",
  "Autre",
];

export default function ExpenseListPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Toutes");
  const [sort, setSort] = useState("recent");

  const [selectedDate, setSelectedDate] = useState(null);

  const [openModal, setOpenModal] = useState(false);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Alimentation");

  const [submitting, setSubmitting] = useState(false);

  /* =========================
     LOAD
  ========================== */
  const loadExpenses = async () => {
    setLoading(true);
    try {
      const res = await getExpenses();
      setExpenses(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  /* =========================
     FORMATTING NUMBER INPUT
  ========================== */
  const formatNumber = (value) => {
    if (!value) return "";
    return value
      .replace(/\D/g, "")
      .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  const parseNumber = (value) => {
    return Number(value.replace(/\s/g, ""));
  };

  /* =========================
     FILTER + SEARCH + SORT
  ========================== */
  const filtered = useMemo(() => {
    let data = [...expenses];

    // search
    if (search) {
      data = data.filter(
        (e) =>
          e.title.toLowerCase().includes(search.toLowerCase()) ||
          e.category.toLowerCase().includes(search.toLowerCase())
      );
    }

    // category filter
    if (filter !== "Toutes") {
      data = data.filter((e) => e.category === filter);
    }

    // calendar filter
    if (selectedDate) {
      data = data.filter((e) => e.expense_date === selectedDate);
    }

    // sort
    switch (sort) {
      case "amount_asc":
        data.sort((a, b) => a.amount - b.amount);
        break;
      case "amount_desc":
        data.sort((a, b) => b.amount - a.amount);
        break;
      case "oldest":
        data.sort(
          (a, b) => new Date(a.expense_date) - new Date(b.expense_date)
        );
        break;
      default:
        data.sort(
          (a, b) => new Date(b.expense_date) - new Date(a.expense_date)
        );
    }

    return data;
  }, [expenses, search, filter, sort, selectedDate]);

  /* =========================
     GROUP BY DATE (TIMELINE)
  ========================== */
  const groupedExpenses = useMemo(() => {
    const groups = {};

    filtered.forEach((expense) => {
      const date = expense.expense_date;

      if (!groups[date]) {
        groups[date] = [];
      }

      groups[date].push(expense);
    });

    return groups;
  }, [filtered]);

  /* =========================
     TOTAL
  ========================== */
  const total = useMemo(
    () => filtered.reduce((sum, e) => sum + Number(e.amount), 0),
    [filtered]
  );

  const format = (n) => Number(n).toLocaleString();

  /* =========================
     CREATE
  ========================== */
  const isFormValid =
    title.trim().length > 0 &&
    parseNumber(amount) > 0 &&
    category;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid || submitting) return;

    try {
      setSubmitting(true);

      await createExpense({
        title,
        amount: parseNumber(amount),
        category,
        expense_date: new Date().toISOString().split("T")[0],
      });

      setTitle("");
      setAmount("");
      setOpenModal(false);

      await loadExpenses();
    } catch (error) {
      console.log("STATUS:", error.response?.status);
      console.log("DATA:", error.response?.data);
    } finally {
      setSubmitting(false);
    }
  };

  /* =========================
     DELETE
  ========================== */
  const handleDelete = async (id) => {
    if (!confirm("Supprimer cette dépense ?")) return;

    await deleteExpense(id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-4xl font-bold">
          Expense Dashboard
        </h1>

        <button
          onClick={() => setOpenModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-xl hover:bg-blue-700"
        >
          <Plus size={18}/>
          <span className="hidden sm:block">Ajouter</span>
        </button>
      </div>

      {/* MINI CALENDAR */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
        <h2 className="font-bold mb-3">Calendrier</h2>

        <div className="grid grid-cols-7 gap-2">
          {[...new Set(expenses.map((e) => e.expense_date))].map((date) => (
            <button
              key={date}
              onClick={() =>
                setSelectedDate(
                  selectedDate === date ? null : date
                )
              }
              className={`p-2 rounded-lg text-sm ${
                selectedDate === date
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100"
              }`}
            >
              {new Date(date).getDate()}
            </button>
          ))}
        </div>
      </div>

      {/* SEARCH */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex items-center flex-1 px-3 py-2 bg-slate-100 rounded-xl">
          <Search size={16}/>
          <input
            className="ml-2 w-full bg-transparent outline-none"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-100"
        >
          <option value="Toutes">Toutes</option>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-100"
        >
          <option value="recent">Récent</option>
          <option value="oldest">Ancien</option>
          <option value="amount_desc">Montant ↓</option>
          <option value="amount_asc">Montant ↑</option>
        </select>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-600 text-white p-4 rounded-2xl">
          <p>Total</p>
          <h2 className="text-2xl font-bold">
            {format(total)} Ar
          </h2>
        </div>

        <div className="bg-green-600 text-white p-4 rounded-2xl">
          <p>Dépenses</p>
          <h2 className="text-2xl font-bold">{filtered.length}</h2>
        </div>

        <div className="bg-orange-600 text-white p-4 rounded-2xl">
          <p>Catégories</p>
          <h2 className="text-2xl font-bold">
            {new Set(expenses.map((e) => e.category)).size}
          </h2>
        </div>
      </div>

      {/* TIMELINE */}
      {Object.entries(groupedExpenses).map(([date, items]) => (
        <div key={date} className="mb-8">

          <div className="mb-3 bg-slate-100 p-3 rounded-xl">
            <h3 className="font-bold">
              {new Date(date).toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </h3>

            <p className="text-sm text-slate-500">
              Total :
              {" "}
              {items.reduce((s, e) => s + Number(e.amount), 0).toLocaleString()} Ar
            </p>
          </div>

          <div className="space-y-3">
            {items.map((expense) => (
              <div
                key={expense.id}
                className="bg-white p-4 rounded-2xl shadow-sm flex justify-between"
              >
                <div>
                  <h3 className="font-semibold">
                    {expense.title}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {expense.category}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-bold">
                    {format(expense.amount)} Ar
                  </p>

                  <button
                    onClick={() => handleDelete(expense.id)}
                    className="text-red-500 text-sm"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      ))}

      {/* MODAL */}
      {openModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-5 relative">

            <button
              onClick={() => setOpenModal(false)}
              className="absolute top-3 right-3"
            >
              <X size={18}/>
            </button>

            <h2 className="text-xl font-bold mb-4">
              Ajouter une dépense
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3">

              <input
                className="w-full px-4 py-3 rounded-xl bg-slate-100"
                placeholder="Titre"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <input
                className="w-full px-4 py-3 rounded-xl bg-slate-100"
                placeholder="Montant"
                value={amount}
                onChange={(e) =>
                  setAmount(
                    (v) => formatNumber(e.target.value)
                  )
                }
              />

              <select
                className="w-full px-4 py-3 rounded-xl bg-slate-100"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>

              <button
                disabled={!isFormValid || submitting}
                className={`w-full py-3 rounded-xl ${
                  isFormValid
                    ? "bg-blue-600 text-white"
                    : "bg-slate-300 text-slate-500"
                }`}
              >
                {submitting ? "Ajout..." : "Ajouter"}
              </button>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}