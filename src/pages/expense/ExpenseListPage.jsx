import { useEffect, useMemo, useState } from "react";
import {
  createExpense,
  deleteExpense,
  getExpenses,
} from "../../api/expenseApi";

import { Search, Plus, X } from "lucide-react";

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

  const [openModal, setOpenModal] = useState(false);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState(""); // formatted string
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
     FORMAT NUMBER INPUT
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
     VALIDATION
  ========================== */
  const isFormValid =
    title.trim().length > 0 &&
    parseNumber(amount) > 0 &&
    category;

  /* =========================
     CREATE
  ========================== */
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
    } finally {
      setSubmitting(false);
    }
  };

  /* =========================
     DELETE
  ========================== */
  const handleDelete = async (id) => {
    if(!confirm('Voulez vous vraiment supprimer?')) return
    await deleteExpense(id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  /* =========================
     FILTER + SORT
  ========================== */
  const filtered = useMemo(() => {
    let data = [...expenses];

    if (search) {
      data = data.filter(
        (e) =>
          e.title.toLowerCase().includes(search.toLowerCase()) ||
          e.category.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (filter !== "Toutes") {
      data = data.filter((e) => e.category === filter);
    }

    switch (sort) {
      case "amount_asc":
        data.sort((a, b) => a.amount - b.amount);
        break;
      case "amount_desc":
        data.sort((a, b) => b.amount - a.amount);
        break;
      case "oldest":
        data.sort((a, b) => new Date(a.expense_date) - new Date(b.expense_date));
        break;
      default:
        data.sort((a, b) => new Date(b.expense_date) - new Date(a.expense_date));
    }

    return data;
  }, [expenses, search, filter, sort]);

  const total = useMemo(
    () => filtered.reduce((sum, e) => sum + Number(e.amount), 0),
    [filtered]
  );

  const format = (n) => Number(n).toLocaleString();

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
          <Plus size={18} />
          <span className="hidden sm:block">Ajouter</span>
        </button>
      </div>

      {/* SEARCH */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">

        <div className="flex items-center flex-1 px-3 py-2 bg-slate-100 rounded-xl">
          <Search size={16} />
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

      {/* LIST */}
      <div className="space-y-3">

        {filtered.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            Aucune dépense trouvée
          </div>
        ) : (
          filtered.map((expense) => (
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
          ))
        )}

      </div>

      {/* MODAL */}
      {openModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-md rounded-2xl p-5 relative">

            <button
              onClick={() => setOpenModal(false)}
              className="absolute top-3 right-3"
            >
              <X size={18} />
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

              {/* AMOUNT INPUT FORMATTED */}
              <input
                className="w-full px-4 py-3 rounded-xl bg-slate-100"
                placeholder="Montant"
                value={amount}
                onChange={(e) =>
                  setAmount(formatNumber(e.target.value))
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
                className={`
                  w-full py-3 rounded-xl font-semibold
                  ${
                    isFormValid
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-slate-300 text-slate-500 cursor-not-allowed"
                  }
                `}
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