import Group from '../models/group.model.js';
import User from '../models/user.model.js';

export const listUserGroups = async (req, res) => {
    const userId = req.user.id;
    const groups = await Group.find({ members: userId });
    res.json({ success: true, data: groups });
};

export const createGroup = async (req, res) => {
    const { name, description } = req.body;
    const owner = req.user.id;
    const newGroup = new Group({ name, description, owner, members: [owner] });
    await newGroup.save();
    res.status(201).json({ success: true, data: newGroup });
};

export const getGroupDetails = async (req, res) => {
    const { groupId } = req.params;
    const group = await Group.findById(groupId)
        .populate('owner', 'login')
        .populate('members', 'login');
    if (!group) return res.status(404).json({ success: false });
    res.json({ success: true, data: group });
};

export const inviteMember = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId } = req.body;

        // Sprawdź czy grupa istnieje
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ success: false, message: 'Grupa nie istnieje' });
        }

        // Sprawdź czy użytkownik jest właścicielem grupy
        if (String(group.owner) !== String(req.user.id)) {
            return res.status(403).json({
                success: false,
                message: 'Tylko właściciel grupy może zapraszać'
            });
        }

        // Sprawdź czy użytkownik już jest członkiem
        if (group.members.includes(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Użytkownik już jest w grupie'
            });
        }

        // Dodaj do zaproszeń
        if (!group.pendingInvites.includes(userId)) {
            group.pendingInvites.push(userId);
            await group.save();
        }

        res.json({
            success: true,
            message: 'Zaproszenie wysłane'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Błąd serwera',
            error: error.message
        });
    }
};

export const leaveGroup = async (req, res) => {
    const userId = req.user.id;
    const { groupId } = req.params;
    const group = await Group.findById(groupId);
    group.members = group.members.filter(m => m.toString() !== userId);
    await group.save();
    res.json({ success: true });
};

export const removeMember = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId } = req.body;
        const requesterId = req.user.id; // ID użytkownika wykonującego żądanie

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ success: false, message: 'Grupa nie istnieje' });
        }

        // Sprawdź czy użytkownik jest właścicielem LUB czy usuwa siebie
        const isOwner = String(group.owner) === String(requesterId);
        const isSelfRemoval = String(userId) === String(requesterId);

        if (!isOwner && !isSelfRemoval) {
            return res.status(403).json({
                success: false,
                message: 'Tylko właściciel może usuwać innych członków'
            });
        }

        // Nie pozwól właścicielowi usunąć samego siebie
        if (String(group.owner) === String(userId)) {
            return res.status(403).json({
                success: false,
                message: 'Właściciel nie może opuścić grupy. Najpierw przekaż własność.'
            });
        }

        // Aktualizuj grupę
        group.members = group.members.filter(m => String(m) !== userId);
        await group.save();

        res.json({
            success: true,
            message: isSelfRemoval ? 'Opuściłeś grupę' : 'Usunięto członka'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Błąd serwera',
            error: error.message
        });
    }
};

export const searchUsers = async (req, res) => {
    try {
        const { query } = req.query;

        // Minimalna długość zapytania to 2 znaki
        if (!query || query.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Query must be at least 2 characters long'
            });
        }

        // Wyszukaj użytkowników (case-insensitive)
        const users = await User.find({
            login: { $regex: query, $options: 'i' }
        }).select('_id login'); // Zwracamy tylko ID i login

        res.json({
            success: true,
            data: users
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

export const acceptInvite = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user.id;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ success: false, message: 'Grupa nie istnieje' });
        }

        // Sprawdź czy użytkownik ma zaproszenie
        if (!group.pendingInvites.includes(userId)) {
            return res.status(403).json({
                success: false,
                message: 'Brak zaproszenia do tej grupy'
            });
        }

        // Dodaj do członków i usuń z zaproszeń
        group.members.push(userId);
        group.pendingInvites = group.pendingInvites.filter(id => id.toString() !== userId);

        await group.save();

        res.json({
            success: true,
            message: 'Dołączono do grupy'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Błąd serwera',
            error: error.message
        });
    }
};

export const rejectInvite = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user.id;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ success: false, message: 'Grupa nie istnieje' });
        }

        // Usuń z zaproszeń
        group.pendingInvites = group.pendingInvites.filter(id => id.toString() !== userId);

        await group.save();

        res.json({
            success: true,
            message: 'Odrzucono zaproszenie'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Błąd serwera',
            error: error.message
        });
    }
};