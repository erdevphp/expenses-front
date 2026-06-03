import axiosApi from "./axiosApi.js";

const BASE_MESSAGE_URL = "/message"

export const listMessage = () => axiosApi.get(`${BASE_MESSAGE_URL}/list/`)

export const postMessage = (body) => axiosApi.post(`${BASE_MESSAGE_URL}/list/`, body)

export const showMessage = (id) => axiosApi.get(`${BASE_MESSAGE_URL}/${id}/`)

export const updateMessage = (id, body) => axiosApi.patch(`${BASE_MESSAGE_URL}/${id}/`, body)

export const deleteMessage = (id) => axiosApi.delete(`${BASE_MESSAGE_URL}/${id}/`)