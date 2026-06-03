import {useEffect, useMemo, useState} from "react";
import TimeAgo from "react-timeago";
import frenchStrings from "react-timeago/lib/language-strings/fr";
import buildFormatter from "react-timeago/lib/formatters/buildFormatter";

import {getExpenses} from "../../api/expenseApi";
import {User, Mail, Shield} from "lucide-react";

const formatter = buildFormatter(frenchStrings);

export default function ProfilePage({user}) {
  const [expenses, setExpenses] = useState([]);
  const [loadingExpenses, setLoadingExpenses] = useState(true);

  /* =========================
     LOAD EXPENSES
  ========================== */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await getExpenses();
        setExpenses(res.data);
      } finally {
        setLoadingExpenses(false);
      }
    };

    load();
  }, []);

  /* =========================
     STATS
  ========================== */
  const total = useMemo(() => {
    return expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  }, [expenses]);

  const categoriesCount = useMemo(() => {
    return new Set(expenses.map((e) => e.category)).size;
  }, [expenses]);

  const transactions = expenses.length;

  /* =========================
     USER SAFETY
  ========================== */
  if (!user) {
    return (
      <div className="p-6 text-slate-500">
        Chargement du profil...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">

      {/* HEADER */}
      <h1 className="text-3xl font-bold mb-6">
        Profil
      </h1>

      {/* USER CARD */}
      <div className="bg-white p-6 rounded-2xl shadow-sm mb-6">

        <div className="flex gap-4 items-center">

          <div
            className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold">
            {user.username?.charAt(0)?.toUpperCase()}
          </div>

          <div className="flex-1">

            <h2 className="font-bold flex items-center gap-2">
              <User size={16}/>
              {user.username}
            </h2>

            {user.email && (
              <p className="text-slate-500 flex items-center gap-2">
                <Mail size={14}/>
                {user.email}
              </p>
            )}

            <p className="text-slate-500 flex items-center gap-2">
              <Shield size={14}/>
              {user.role || "Utilisateur"}
            </p>

          </div>

          {/* DATE FIX IMPORTANT */}
          <div className="text-right text-sm text-slate-500">

            <p>Membre depuis</p>

            <p className="font-semibold text-slate-700">
              <TimeAgo
                date={user.date_joined || user.createdAt || Date.now()}
                formatter={formatter}
              />
            </p>

          </div>

        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

        <div className="bg-blue-600 text-white p-4 rounded-2xl">
          <p>Total dépenses</p>
          <h2 className="text-2xl font-bold">
            {total.toLocaleString()} Ar
          </h2>
        </div>

        <div className="bg-green-600 text-white p-4 rounded-2xl">
          <p>Transactions</p>
          <h2 className="text-2xl font-bold">
            {transactions}
          </h2>
        </div>

        <div className="bg-orange-600 text-white p-4 rounded-2xl">
          <p>Catégories</p>
          <h2 className="text-2xl font-bold">
            {categoriesCount}
          </h2>
        </div>

      </div>

      {/* EXPENSE PREVIEW */}
      <div className="bg-white p-5 rounded-2xl shadow-sm">

        <h3 className="font-bold mb-4">
          Dernières dépenses
        </h3>

        {loadingExpenses ? (
          <p className="text-slate-500">Chargement...</p>
        ) : expenses.length === 0 ? (
          <p className="text-slate-500">Aucune dépense</p>
        ) : (
          <div className="space-y-3">

            {expenses.slice(0, 5).map((e) => (
              <div
                key={e.id}
                className="flex justify-between text-sm"
              >

                <div>
                  <p className="font-medium">{e.title}</p>
                  <p className="text-slate-500">
                    {e.category}
                  </p>
                </div>

                <div className="text-right">

                  <p className="font-bold">
                    {Number(e.amount).toLocaleString()} Ar
                  </p>

                  {/* DATE FIX ICI */}
                  <p className="text-slate-400 text-xs">
                    {e.expense_date
                      ? new Date(e.expense_date).toLocaleDateString()
                      : "—"}
                  </p>

                </div>

              </div>
            ))}

          </div>
        )}

      </div>

    </div>
  );
}