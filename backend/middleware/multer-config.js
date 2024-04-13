const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const MIME_TYPES = {
    'image/jpg' : 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
};
const storage = multer.memoryStorage(); // Utilisation de la mémoire pour stocker temporairement les fichiers
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const isValid = MIME_TYPES[file.mimetype];
        let error = isValid ? null : new Error('Type de fichier non valide');
        cb(error, isValid);
    }
}).single('image');

const multer_builder = (image_optionelle) => {
    if (image_optionelle) {
        return (req, res, next) => {
            upload(req, res, async (err) => {
                if (err) {
                    return res.status(400).json({ error: err.message }); // résolution requise sur le frontend
                }

                if (req.file) {
                    // Utiliser Sharp pour redimensionner et optimiser l'image
                    try {
                        const resizedImageBuffer = await sharp(req.file.buffer)
                            .resize({ width: 400 }) // Redimensionner l'image en largeur 800px
                            .webp({ quality: 50 }) // Définir la qualité de l'image webp
                            .toBuffer();

                        // Enregistrer l'image redimensionnée sur le disque avec un nom unique
                        let name = req.file.originalname
                        .split(' ').join('_').split('.');
                        name.pop();
                        name = name.join('.');

                        // Enregistrer l'image redimensionnée sur le disque avec un nom unique
                        //  const extension = MIME_TYPES[file.mimetype];
                        const filename = name + '_' + Date.now() + '.webp';
                        fs.writeFileSync(`${process.env.IMAGES_FOLDER}/${filename}`, resizedImageBuffer);

                        // Mettre à jour la requête avec le nom de l'image redimensionnée
                        req.file.filename = filename;

                    } catch (error) {
                        return res.status(500).json({ error: 'Erreur de traitement de l\'image' });
                    }
                }
                next();
            });
        }
    } else {
        return (req, res, next) => {
            upload(req, res, async (err) => {
                if (err) {
                    return res.status(400).json({ error: err.message });
                }

                if (!req.file) {
                    return res.status(400).json({ error: 'Aucun fichier selectionné' });
                }

                // Utiliser Sharp pour redimensionner et optimiser l'image
                try {
                    const resizedImageBuffer = await sharp(req.file.buffer)
                        .resize({ width: 400 }) // Redimensionner l'image en largeur 800px
                        .webp({ quality: 50 }) // Définir la qualité de l'image webp
                        .toBuffer();

                    // Enregistrer l'image redimensionnée sur le disque avec un nom unique
                    let name = req.file.originalname
                    .split(' ').join('_').split('.');
                    name.pop();
                    name = name.join('.');

                     // Enregistrer l'image redimensionnée sur le disque avec un nom unique
                    //  const extension = MIME_TYPES[file.mimetype];
                     const filename = name + '_' + Date.now() + '.webp';
                     fs.writeFileSync(`${process.env.IMAGES_FOLDER}/${filename}`, resizedImageBuffer);

                     // Mettre à jour la requête avec le nom de l'image redimensionnée
                     req.file.filename = filename;

                } catch (error) {
                    return res.status(500).json({ error: 'Erreur de traitement de l\'image' });
                }

                next();
            });
        };
    }

}

module.exports = multer_builder;