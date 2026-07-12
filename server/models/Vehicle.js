export const VehicleSchema = {
    registrationNumber: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: { type: String, required: true, enum: ['Van', 'Truck', 'Semi'] },
    maxLoadCapacity: { type: Number, required: true },
    odometer: { type: Number, required: true },
    acquisitionCost: { type: Number, required: true },
    status: { type: String, required: true, enum: ['Available', 'On Trip', 'In Shop', 'Retired'] },
    region: { type: String, required: false }
};

export class Vehicle {
    constructor({ registrationNumber, name, type, maxLoadCapacity, odometer, acquisitionCost, status, region }) {
        this.registrationNumber = registrationNumber.toUpperCase();
        this.name = name;
        this.type = type;
        this.maxLoadCapacity = Number(maxLoadCapacity);
        this.odometer = Number(odometer);
        this.acquisitionCost = Number(acquisitionCost);
        this.status = status || 'Available';
        this.region = region || 'North';
    }

    static validate(data) {
        if (!data.registrationNumber) return 'Registration Number is required';
        if (!data.name) return 'Vehicle name/model is required';

        const allowedTypes = ['Van', 'Truck', 'Semi'];
        if (!data.type || !allowedTypes.includes(data.type)) {
            return `Vehicle type must be one of: ${allowedTypes.join(', ')}`;
        }
        if (data.maxLoadCapacity === undefined || Number(data.maxLoadCapacity) <= 0) {
            return 'Max Load Capacity is required and must be greater than 0';
        }
        if (data.odometer === undefined || Number(data.odometer) < 0) {
            return 'Odometer reading is required';
        }
        if (data.acquisitionCost === undefined || Number(data.acquisitionCost) < 0) {
            return 'Acquisition cost is required';
        }

        const allowedStatuses = ['Available', 'On Trip', 'In Shop', 'Retired'];
        if (data.status && !allowedStatuses.includes(data.status)) {
            return `Status must be one of: ${allowedStatuses.join(', ')}`;
        }
        return null;
    }
}