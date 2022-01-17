const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');


// ------------- CREATION UTILISATEUR -----------
exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10) // on met en premier le mdp recupérer dans le frontend, 10= Le nombre de tours de hash du mdp
    .then(hash => { // quand mon mdp est crypté je créer un new user en prenant le mail renseigné et le mdp hashé
        const user = new User({
            email: req.body.email,
            password: hash,
        });
        user.save() // j'enregistre le user dans la base de données
            .then(() => res.status(201).json({message: 'Votre compte à bien été créé !'}))
            .catch(error => res.status(400).json ({error}));
    })
    .catch(error => res.status(500).json({error}));
};
// ------------------------------------------------

//----------------------- LOGIN D UTILISATEUR ---------
exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email }) // je recherche dans ma base de données
    .then(user => {
        if (!user){ // si pas de d'email concordant
            return res.status(401).json ({error: 'Utilisateur introuvable'});
        }
        bcrypt.compare(req.body.password, user.password) //verification du mdp  entre celui renseigné dans le cadre et celui dans la base de données
        .then(valid => {
            if (!valid) { // si mdp invalide
                return res.status(401).json({error: 'Mot de passe invalide'})
            }
            res.status(200).json({ // sinon retourne un id + un TOKEN
                userId: user._id,
                token: jwt.sign(
                    {userId: user._id},
                    'RANDOM_TOKEN_SECRET',
                    { expiresIn: '24h'}
                )
            });
        })
        .catch(error => res.status(500).json({error}));
    })
    .catch(error => res.status(500).json({error}));
};
