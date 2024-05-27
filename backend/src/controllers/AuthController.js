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

        //const detectRef1 = await human.detect(readImage(REFERENCE_IMAGE));
        //const detectRef2 = await human.detect(readImage(REFERENCE_IMAGE2));

        let detectReqFaces = [];

        const files = req.files.data;
        
        for(let i = 0; i < files.length; i++) {
            let image = await human.detect(readImage(fs.readFileSync(files[i].path)));
            console.log(image)
            if(image.face.length > 0) {
                detectReqFaces.push(image.face[0].embedding);
            } 
        };

        console.log(detectReqFaces[0][0])
        console.log(detectReqFaces[1][0])
        console.log(detectReqFaces[2][0])
        console.log(detectReqFaces[3][0])
        //const detectReqImage = await human.detect(readImage(fs.readFileSync(req.file.path)));
        
        if(detectReqFaces.length <= 0) {
            cleanTmp(req.files.data);
            return res.status(401).json({ error: "Incorrect e-mail or face didn't match!" }); 
        }

        cleanTmp(req.files.data);

        const find1 = await human.match.find(detectReqFaces[0], user_refs);
    
        //Promise.all([find1Promise, find2Promise])
        await Promise.all([find1])
            .then(results => {
                // Handle results
                if(results.length > 0) {
                    
                    let biggestMatch = results[0];

                    for (let i = 0; i < results.length; i++) {
                        if (results[i].similarity > biggestMatch.similarity) {
                            biggestMatch = results[i]; 
                        }
                    }

                    console.log('result', biggestMatch.similarity*100)

                    if(biggestMatch.similarity > 0.5) {
                        const token = generateToken({ id: userView.rows[0].user_username});
                        return res.status(200).json({ token: token });
                    } else {
                        return res.status(401).json({ error: "Incorrect e-mail or face didn't match!" });
                    }

                } else {
                    res.status(401).json({ error: 'Incorrect face authentication!' });
                }
            })
            .catch(err => {
                return res.status(500).json({ Error: err });
        });
    } catch (err) {
        cleanTmp(req.files.data);
        return res.status(500).json({ error: err });
    }

}


module.exports = { 
    login,
    faceLogin
};
