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

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = async () => {
            if (token) {
                try {
                    // Dekoduj token JWT aby uzyskać dane użytkownika
                    const decoded = JSON.parse(atob(token.split('.')[1]));
                    setUser({
                        _id: decoded.userId, // Używamy userId z tokena
                        login: decoded.login
                    });
                } catch (error) {
                    console.error('Błąd dekodowania tokena:', error);
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };

        initializeAuth();
    }, [token]);

    const login = (newToken, userData) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser({
            _id: userData._id || userData.userId,
            login: userData.login
        });
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ token, user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}



// hook
export const useAuth = () => useContext(AuthContext);