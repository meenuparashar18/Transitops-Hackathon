import API from "./api";

export const getShipments = async () => {
  const response = await API.get("/shipments");
  return response.data;
};

export const addShipment = async (shipment) => {
  const response = await API.post("/shipments", shipment);
  return response.data;
};

export const updateShipment = async (id, shipment) => {
  const response = await API.put(`/shipments/${id}`, shipment);
  return response.data;
};

export const deleteShipment = async (id) => {
  const response = await API.delete(`/shipments/${id}`);
  return response.data;
};