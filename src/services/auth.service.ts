
class AuthService {
    public baseUrl: string;
    public loginEndpoint: string;
    public logoutEndpoint: string;
    public userEndpoint: string;
    public changePasswordEndpoint: string

    constructor(baseUrl: string = '', loginEndpoint: string = '', logoutEndpoint: string = '', userEndpoint: string = '', changePasswordEndpoint: string = '') {
        this.baseUrl = baseUrl || '';
        this.loginEndpoint = loginEndpoint || '';
        this.logoutEndpoint = logoutEndpoint || '';
        this.userEndpoint = userEndpoint || '';
        this.changePasswordEndpoint = changePasswordEndpoint || '';
    }

    public async login(username: string, password: string) {
        const response = await fetch(this.baseUrl + this.loginEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
            credentials: 'include',
        });

        const passwordChangeRequired = response.headers.get('x-password-change') === 'true';

        if (response.ok) {
            return { success: true, passwordChangeRequired };
        } else {
            throw new Error("Login failed");
        }
    }

    public async logout() {
        const response = await fetch(this.baseUrl + this.logoutEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
        });

        if (response.ok) {
            return true;
        } else {
            throw new Error("Logout failed");
        }
    }

    public async getLoggedInUser() {
        const response = await fetch(this.baseUrl + this.userEndpoint, {
            method: 'GET',
            credentials: 'include',
        });

        if (response.ok) {
            const userData = await response.json();
            return userData.username;
        } else {
            throw new Error("User not found");
        }
    }

    public async changePassword(oldPassword: string, newPassword: string) {
        const response = await fetch(this.baseUrl + this.changePasswordEndpoint, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ oldPassword, newPassword }),
            credentials: 'include',
        });

        if (response.ok) {
            return true;
        } else {
            throw new Error("Password change failed");
        }
    }
}

export default AuthService;