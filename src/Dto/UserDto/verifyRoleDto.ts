export default class VerifyRoleDto {
    token: string;
    role: string;

    constructor(token: string, role: string) {
        this.token = token;
        this.role = role.toUpperCase();
    }
} 