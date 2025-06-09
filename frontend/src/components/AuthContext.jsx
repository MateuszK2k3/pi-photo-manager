import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

// Prosta funkcja do dekodowania tokenu JWT bez zewnętrznych zależności
const decodeToken = (token) => {
    try {
        const payload = token.split('.')[1];
        const decodedJson = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
        return JSON.parse(decodeURIComponent(
            decodedJson
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        ));
    } catch (err) {
        console.error('Błąd dekodowania tokenu:', err);
        return null;
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);

    useEffect(() => {
        const t = localStorage.getItem('token');
        if (t) {
            const decoded = decodeToken(t);
            if (decoded && Date.now() < decoded.exp * 1000) {
                setToken(t);
                setUser({ login: decoded.login });
            } else {
                localStorage.removeItem('token');
            }
        }
    }, []);

    const login = (newToken, login) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser({ login });
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// hook
export const useAuth = () => useContext(AuthContext);