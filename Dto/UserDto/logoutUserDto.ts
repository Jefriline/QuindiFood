export default class LogoutUser {
    private token: string;

    constructor(token: string) {
        this.token = token;
    }

    get getToken(): string {
        return this.token;
    }
} 