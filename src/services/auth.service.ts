import { IAuthConfig } from '../common/models/config.model';

class AuthService {
    public baseUrl: string;
    public loginEndpoint: string = '';
    public logoutEndpoint: string = '';
    public userEndpoint: string = '';
    public changePasswordEndpoint: string = '';

    constructor(baseUrl: string = '', auth?: IAuthConfig) {
        this.baseUrl = baseUrl || '';
        if (auth) {
            if (auth.type !== 'sessioncookie') {
                throw new Error(`Authentication type '${auth.type}' is not implemented. Currently only 'sessioncookie' type is supported.`);
            }
            this.loginEndpoint = auth.loginEndpoint || '';
            this.logoutEndpoint = auth.logoutEndpoint || '';
            this.userEndpoint = auth.userEndpoint || '';
            this.changePasswordEndpoint = auth.changePasswordEndpoint || '';
        }
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
            const responseText = await response.text();
            throw new Error(responseText);
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
            const responseText = await response.text();
            throw new Error(responseText);
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
            const responseText = await response.text();
            throw new Error(responseText);
        }
    }
}

export default AuthService;
