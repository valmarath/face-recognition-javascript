const tf = require('@tensorflow/tfjs-node'); // can also use '@tensorflow/tfjs-node-gpu' if you have environment with CUDA extensions
const Human = require('@vladmandic/human').default; // points to @vladmandic/human/dist/human.node.js
const fs = require('fs')
const { pool } = require("../instances/pg");
const { generateToken } = require('../config/passport');
const { hashPassword } = require('../utils');
const bcrypt = require('bcrypt');

const myConfig = {
    face: {
    enabled: true,
    detector: { rotation: true, return: true },
    mesh: { enabled: true },
    description: { enabled: true },
    },
};

const human = new Human(myConfig);

const QUERY_IMAGE = fs.readFileSync('./src/images/perfil.jpg')
const QUERY_IMAGE2 = fs.readFileSync('./src/images/profile.jpg')
const REFERENCE_IMAGE = fs.readFileSync('./src/images/vic1.JPG')
const REFERENCE_IMAGE2 = fs.readFileSync('./src/images/vic2.JPG')

const readImage = (buffer) => {     
  const tfimage = tf.node.decodeImage(buffer);
  return tfimage;
}

const cleanTmp = (reqFiles) => {
    reqFiles.forEach((elem) => {
        fs.unlink(elem.path, (err) => {
            if (err) {
              console.error('Error deleting file:', err);
            }
        });
    })
}

const login = async (req, res) => {

    try {
        const user = await pool.query('SELECT user_username, user_password FROM "USERS_VIEW" WHERE user_username = $1', [req.body.username]);

        if(user.rowCount == 0) {
            res.status(401);
            res.json({ error: 'Incorrect e-mail or password!' });
            return;
        }
    
        const passwordMatch = await bcrypt.compare(req.body.password, user.rows[0].user_password);
        
        if(!passwordMatch) {
            res.status(401);
            res.json({ error: 'Incorrect e-mail or password!' });
            return;
        }
    
        const token = generateToken({id: user.rows[0].id});
    
        return res.status(200).json({ token: token});
    } catch (err) {
        return res.status(500).json({ error: err });
    }

    
}

const faceLogin = async (req, res) => {

    try {
        const userView = await pool.query('SELECT * FROM "USERS_VIEW" WHERE user_username = $1', [req.body.username]);

        if(userView.rowCount == 0) {
            return res.status(401).json({ error: "Incorrect e-mail or face didn't match!" });
        }
    
        let user_refs;

        if (userView.rows[0].images_embedding.length > 0) {
            user_refs = userView.rows[0].images_embedding;
        }

        let detectReqFaces = [];

        const files = req.files.data;
        
        for(let i = 0; i < files.length; i++) {
            let image = await human.detect(readImage(fs.readFileSync(files[i].path)));
            if(image.face.length > 0) {
                detectReqFaces.push(image.face[0].embedding);
            } 
        };

        cleanTmp(req.files.data);

        if(detectReqFaces.length <= 0) {
            return res.status(401).json({ error: "Incorrect e-mail or face didn't match!" }); 
        }

        matchArray = detectReqFaces.map((elem) => {
            return human.match.find(elem, user_refs);
        })

        let matchResultArray = await Promise.all(matchArray)

        for(let i = 0; i < matchResultArray.length; i++) {

            let currentItem = matchResultArray[i];
            console.log(currentItem. similarity)

            if(currentItem. similarity >= .5) {
                const token = generateToken({ id: userView.rows[0].user_username});
                return res.status(200).json({ token: token });
            }

            if(i == (matchResultArray.length - 1)) {
                return res.status(401).json({ error: "Incorrect e-mail or face didn't match!" });
            }
        }

    } catch (err) {
        cleanTmp(req.files.data);
        return res.status(500).json({ error: err });
    }

}


module.exports = { 
    login,
    faceLogin
};
