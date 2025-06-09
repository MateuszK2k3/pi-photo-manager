import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

const generateToken = (user) => {
    return jwt.sign(
        { userId: user._id, login: user.login },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
};

export const registerUser = async(req, res) => {
    try {
        const { login, password } = req.body;

        // prosta walidacja
        if (!login || !password)
            return res.status(400).json({ message: 'Wszystkie pola są wymagane.' });

        // sprawdź, czy już istnieje
        const existing = await User.findOne({ login });
        if (existing)
            return res.status(409).json({ message: 'Użytkownik o takim loginie już istnieje.' });

        // utwórz i zapisz
        const user = new User({ login, password });
        await user.save();

        res.status(201).json({ message: 'Konto utworzone pomyślnie.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Błąd serwera.' });
    }
}

export const loginUser = async (req, res) => {
    try {
        const { login, password } = req.body;
        if (!login || !password)
            return res.status(400).json({ message: 'Login i hasło są wymagane.' });

        const user = await User.findOne({ login });
        if (!user) return res.status(401).json({ message: 'Nieprawidłowe dane.' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(401).json({ message: 'Nieprawidłowe dane.' });

        const token = generateToken(user);
        res.json({ token, login: user.login });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Błąd serwera.' });
    }
};