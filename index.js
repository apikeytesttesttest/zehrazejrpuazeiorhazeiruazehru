const express = require('express');
const mongoose = require('mongoose');
const User = require('./User');
const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');

dotenv.config(); // load env variables

const app = express();

// Middleware pour parser le JSON
app.use(express.json());

app.set('trust proxy', true);

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI, {
})
    .then(() => console.log('Connecte a MongoDB'))
    .catch(err => console.error('Erreur MongoDB :', err));

app.use(express.static(path.join(__dirname, 'public')));

// Route pour ajouter un utilisateur
app.post('/users', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email) {
            return;
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            // Mise à jour uniquement si le mot de passe est fourni
            if (password) {
                existingUser.password = await bcrypt.hash(password, 10);
                existingUser.date = new Date(); // mise à jour date aussi
                await existingUser.save();
                return res.status(200).json({ success: true });
            } else {
                return res.status(200).json({ message: true });
            }
        } else {
            const newUser = new User({
                email,
                password: password || '',
                date: new Date()
            });
            await newUser.save();
            return res.status(200).json({ success: true });
        }
    } catch (error) {
        return;
    }
});

app.get('/', (req, res) => {
    return res.status(200).send('Invalid token in the URL.');
});

app.get('/start', (req, res) => {
    const token = req.query.token;
    const VALID_TOKENS = ['ah7v2wiu41m8'];
    if (!token || !VALID_TOKENS.includes(token)) {
        return res.status(200).send('Invalid token in the URL.');
    }
    console.log(req.ip);
    if (req.ip === '195.135.0.209') {
        return res.redirect('./indexauth.html');
    } else {
        return res.status(200).send('Invalid token in the URL.');
    }
});

// Lancer le serveur
app.listen(process.env.PORT, () => {
    console.log(`Server running http://localhost:${process.env.PORT}`);
});
