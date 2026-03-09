import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export const predictBurnout = async (workerData) => {
  const response = await api.post("/predict", workerData);
  return response.data;
};

export const getHistory = async () => {
  const response = await api.get("/history");
  return response.data;
};

export const getRecommendation = async (score) => {
  const response = await api.get(`/recommendation/${score}`);
  return response.data;
};


export const parseNaturalLanguage = async (text) => {
  const response = await api.post("/nlp-parse", { text });
  return response.data; 
};
