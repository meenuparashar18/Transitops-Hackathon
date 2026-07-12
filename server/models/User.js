export const UserSchema = {
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ['Fleet Manager', 'Driver', 'Safety Officer', 'Financial Analyst'] }
};

export class User {
    constructor({ email, password, role }) {
        this.email = email;
        this.password = password;
        this.role = role;
    }

    static validate(data) {
        if (!data.email || typeof data.email !== 'string') return 'Email is required and must be a string';
        if (!data.password || typeof data.password !== 'string') return 'Password is required and must be a string';

        const allowedRoles = ['Fleet Manager', 'Driver', 'Safety Officer', 'Financial Analyst'];
        if (!data.role || !allowedRoles.includes(data.role)) {
            return `Role is required and must be one of: ${allowedRoles.join(', ')}`;
        }
        return null;
    }
}