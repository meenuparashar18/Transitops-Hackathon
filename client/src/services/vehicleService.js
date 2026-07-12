import API from "./api";

export const getVehicles = async () => {
  const response = await API.get("/vehicles");
  return response.data;
};

export const addVehicle = async (vehicle) => {
  const response = await API.post("/vehicles", vehicle);
  return response.data;
};

export const updateVehicle = async (id, vehicle) => {
  const response = await API.put(`/vehicles/${id}`, vehicle);
  return response.data;
};

export const deleteVehicle = async (id) => {
  const response = await API.delete(`/vehicles/${id}`);
  return response.data;
};