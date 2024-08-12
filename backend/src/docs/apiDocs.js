/**
 * @swagger
 * /ping:
 *   get:
 *     summary: Ping the server to check if it is up
 *     description: Returns a simple JSON object indicating that the server is responsive.
 *     tags:
 *       - Ping/Pong
 *     responses:
 *       200:
 *         description: Server is up and running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pong:
 *                   type: boolean
 *                   example: true
 */

/**
 * @swagger
 * /login:
 *   post:
 *     summary: User login
 *     description: Authenticates a user and returns a JWT token if the credentials are valid.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       description: User credentials for login
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: 'henry_cavill'
 *               password:
 *                 type: string
 *                 example: 'password123'
 *     responses:
 *       200:
 *         description: Successfully authenticated and token returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
 *       401:
 *         description: Incorrect username or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'Incorrect e-mail or password!'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'Server error message'
 */

/**
 * @swagger
 * /register:
 *   post:
 *     summary: User registration
 *     description: Registers a new user with a username, password, and face data. The face data is processed and stored in the database. A minimum of 10 image files is required.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       description: User data and face images for registration
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The username for the new user
 *                 example: 'henry_cavill'
 *               password:
 *                 type: string
 *                 description: The password for the new user
 *                 example: 'password123'
 *               data:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Array of image files for face recognition (minimum 10 files required)
 *     responses:
 *       200:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *                   example: 'User created successfully!'
 *       400:
 *         description: Validation error, such as missing required files or invalid file type
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'At least 10 files are required.'
 *       401:
 *         description: Registration failed due to issues like duplicate username or face detection failure
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'Username already registered'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'Server error message'
 */

/**
 * @swagger
 * /face_login:
 *   post:
 *     summary: User login with face recognition
 *     description: Authenticates a user by comparing face embeddings from uploaded images with those stored in the database. The API allows up to 5 image files for comparison. A valid username is required for the login attempt.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       description: Username and face images for login
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The username of the user attempting to log in
 *                 example: 'henry_cavill'
 *               data:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Array of image files for face recognition (minimum 5 files)
 *     responses:
 *       200:
 *         description: Login successful, returns a JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c' 
 *       401:
 *         description: Authentication failed due to incorrect email or face mismatch
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Incorrect e-mail or face didn't match!"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'Server error message'
 */

/**
 * @swagger
 * /face_recognition:
 *   post:
 *     summary: Identify a user through face recognition
 *     description: This endpoint allows the identification of a user by comparing face embeddings from uploaded images against those stored in the database. It returns the username of the closest match if a match is found.
 *     tags:
 *       - Recognition
 *     requestBody:
 *       description: Image data for face recognition
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Array of image files for face recognition (maximum 5 files)
 *     responses:
 *       200:
 *         description: User identified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *                   example: 'henry_cavill'
 *       401:
 *         description: Identification failed due to empty database or face not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   examples:
 *                     emptyDatabase: "Empty Database!"
 *                     faceNotFound: "Face not found in database!"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'Server error message'
 */