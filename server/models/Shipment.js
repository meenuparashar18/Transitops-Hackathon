export const ShipmentSchema = {
    id: { type: String, required: true },
    source: { type: String, required: true },
    destination: { type: String, required: true },
    vehicleId: { type: String, required: true },
    driverId: { type: String, required: true },
    cargoWeight: { type: Number, required: true },
    plannedDistance: { type: Number, required: true },
    status: { type: String, required: true, enum: ['Draft', 'Dispatched', 'Completed', 'Cancelled'] },
    revenue: { type: Number, required: true },
    finalOdometer: { type: Number, required: false },
    fuelConsumed: { type: Number, required: false },
    date: { type: String, required: true }
};

export class Shipment {
    constructor({ id, source, destination, vehicleId, driverId, cargoWeight, plannedDistance, status, revenue, finalOdometer, fuelConsumed, date }) {
        this.id = id;
        this.source = source;
        this.destination = destination;
        this.vehicleId = vehicleId;
        this.driverId = driverId;
        this.cargoWeight = Number(cargoWeight);
        this.plannedDistance = Number(plannedDistance);
        this.status = status || 'Draft';
        this.revenue = Number(revenue) || 0;
        this.finalOdometer = finalOdometer !== undefined ? Number(finalOdometer) : null;
        this.fuelConsumed = fuelConsumed !== undefined ? Number(fuelConsumed) : null;
        this.date = date || new Date().toISOString().split('T')[0];
    }

    static validate(data) {
        if (!data.source) return 'Source origin is required';
        if (!data.destination) return 'Destination is required';
        if (!data.vehicleId) return 'Vehicle assignment is required';
        if (!data.driverId) return 'Driver assignment is required';
        if (data.cargoWeight === undefined || Number(data.cargoWeight) <= 0) {
            return 'Cargo weight is required and must be greater than 0';
        }
        if (data.plannedDistance === undefined || Number(data.plannedDistance) <= 0) {
            return 'Planned distance is required and must be greater than 0';
        }

        const allowedStatuses = ['Draft', 'Dispatched', 'Completed', 'Cancelled'];
        if (data.status && !allowedStatuses.includes(data.status)) {
            return `Status must be one of: ${allowedStatuses.join(', ')}`;
        }
        return null;
    }
}