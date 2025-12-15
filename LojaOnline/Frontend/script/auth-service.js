class AuthService {
    static async login(email, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/Auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                return false;
            }

            const data = await response.json();
            if (data.token) {
                localStorage.setItem('token', data.token);
                // Decodificar o token para obter o role e username (opcional, para UI)
                const user = this.parseJwt(data.token);
                localStorage.setItem('user', JSON.stringify(user));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    static async register(username, email, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/Auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });

            if (response.ok) {
                return true;
            }
            return false;
        } catch (error) {
            console.error('Register error:', error);
            throw error;
        }
    }

    static logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    }

    static isAuthenticated() {
        const token = localStorage.getItem('token');
        if (!token) return false;

        // Verificar expiração (opcional mas recomendado)
        const payload = this.parseJwt(token);
        if (payload.exp * 1000 < Date.now()) {
            this.logout();
            return false;
        }
        return true;
    }

    static getToken() {
        return localStorage.getItem('token');
    }

    static getUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }

    static isAdmin() {
        const user = this.getUser();
        // O claim de role muitas vezes vem como "role" ou "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        return user && (user.role === 'Admin' || user['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] === 'Admin');
    }

    static parseJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            return JSON.parse(jsonPayload);
        } catch (e) {
            return null;
        }
    }
}
