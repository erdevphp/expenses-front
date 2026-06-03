import axiosApi from "./axiosApi";

export const getExpenses = () =>
  axiosApi.get("/expenses/");

export const createExpense = (payload) =>
  axiosApi.post("/expenses/", payload);

export const deleteExpense = (id) =>
  axiosApi.delete(`/expenses/${id}/`);

export const updateExpense = (id, payload) =>
  axiosApi.put(`/expenses/${id}/`, payload);