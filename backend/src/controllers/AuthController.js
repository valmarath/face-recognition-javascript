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
const REFERENCE_IMAGE = fs.readFileSync('./src/images/pyBR.jpeg')
const REFERENCE_IMAGE2 = fs.readFileSync('./src/images/IMG_5665.JPG')

const readImage = (buffer) => {     
  const tfimage = tf.node.decodeImage(buffer);
  return tfimage;
}

const login = async (req, res) => {

    try {
        const user = await pool.query('SELECT * FROM "USERS" WHERE username = $1', [req.body.username]);

        if(!user) {
            res.status(401);
            res.json({ error: 'Incorrect e-mail or password!' });
            return;
        }
    
        const passwordMatch = await bcrypt.compare(req.body.password, user.rows[0].password);
    
        console.log(passwordMatch)
    
        if(!passwordMatch) {
            res.status(401);
            res.json({ error: 'Incorrect e-mail or password!' });
            return;
        }
    
        const token = generateToken({id: user.rows[0].id});
    
        return res.status(200).json({ token: token});
    } catch (err) {
        return res.status(500).json({ Error: err });
    }

    
}

const faceLogin = async (req, res) => {
    const user = await pool.query('SELECT * FROM "USERS" WHERE username = $1', [req.body.username]);

    if(!user) {
        res.status(401).json({ error: 'Incorrect e-mail or password!' });
        return;
    }

    if(!passwordMatch) {
        res.status(401).json({ error: 'Incorrect e-mail or password!' });
        return;
    }
        
    try {
        const detectQuery1 = human.detect(readImage(QUERY_IMAGE));
        const detectQuery2 = human.detect(readImage(QUERY_IMAGE2));
    
        const detectRef1 = human.detect(readImage(REFERENCE_IMAGE));
        const detectRef2 = human.detect(readImage(REFERENCE_IMAGE2));
    
        const [query1, query2, ref1, ref2] = await Promise.all([detectQuery1, detectQuery2, detectRef1, detectRef2]);
    
        //const reqImage = await human.detect(readImage(req.file.buffer))
    
        const find1Promise = new Promise((resolve, reject) => {
            const find1 = human.match.find(query1.face[0] ? query1.face[0].embedding : [], [ref1.face[0].embedding, ref2.face[0].embedding]);
            resolve(find1);
        });
        
        const find2Promise = new Promise((resolve, reject) => {
            const find2 = human.match.find(query2.face[0] ? query2.face[0].embedding : [], [ref1.face[0].embedding, ref2.face[0].embedding]);
            resolve(find2);
        });
    
        Promise.all([find1Promise, find2Promise])
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

                    const token = generateToken({id: user.rows[0].id});

                    return res.status(200).json({ token: token });

                } else {
                    res.status(401).json({ error: 'Incorrect face authentication!' });
                }
            })
            .catch(err => {
                // Handle errors
            return res.status(500).json({ Error: err });
        });
    
    } catch (err) {
        return res.status(500).json({ Error: err });
    }
}

module.exports = { 
    login,
    faceLogin
};
