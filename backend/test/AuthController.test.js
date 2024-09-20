const { describe, it, expect, jest, beforeAll, afterAll } = require('@jest/globals')
const { server } = require('../app') 
const Pool = require("pg").Pool;
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

describe('Auth Controller Test Suite', () => {

    let _testServer
    let _testServerAddress

    function waitForServerStatus(server) {
        return new Promise((resolve, reject) => {
            server.once('error', (err) => reject(err))
            server.once('listening', ()=> resolve(1))
        })  
    }

    async function makeLoginRequest(requestBody) {
        return await fetch(`${_testServerAddress}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(requestBody)
        })
    }

    async function makeRequest(url, formData, headers) {
        return await fetch(`${_testServerAddress}/${url}`, {
            method: 'POST',
            headers: headers,
            body: formData
        })
    }

    function addFilesToForm(formData, folder) {
        const imagesFolderPath = path.join(__dirname, folder);
        const files = fs.readdirSync(imagesFolderPath);
        
        files.forEach((file) => {
            const filePath = path.join(imagesFolderPath, file);
            const fileStream = fs.createReadStream(filePath);
            formData.append("data", fileStream, file);
        });
    }

    function addLimitedFilesToForm(formData, folder, limit) {
        const imagesFolderPath = path.join(__dirname, folder);
        const files = fs.readdirSync(imagesFolderPath);
        let count = 0
        files.forEach((file) => {
            if(count < limit) {
                const filePath = path.join(imagesFolderPath, file);
                const fileStream = fs.createReadStream(filePath);
                formData.append("data", fileStream, file);
                count += 1
            }
        });
    }

    beforeAll(async () => {

        _testServer = server
        
        await waitForServerStatus(_testServer)

        const serverInfo = _testServer.address()

        _testServerAddress = `http://localhost:${serverInfo.port}`
    })

    afterAll((done) => {
        const directory = "./test/tmp";

        fs.readdir(directory, (err, files) => {
            if (err) throw err;
          
            for (const file of files) {
              fs.unlink(path.join(directory, file), (err) => {
                if (err) throw err;
              });
            }
          });
          
        jest.clearAllMocks();
        _testServer.close(done);
    })

    describe('Login API Test Suite', () => {
        it('should return status 200 when trying to login', async () => {
            const requestBody = {
                username: 'henry_cavill',
                password: 'teste123'
            }
    
            const resolvedValue = {
                rowCount: 1,
                rows: [
                    {id: 1,
                    password: '$2b$10$kuLkommM7.T83jpQC26tDu7Xb0MMsyth6RL2QuYjVihSIjihLr0KG'}
                ]
            }
    
            jest.spyOn(Pool.prototype, 'query').mockResolvedValue(resolvedValue);
    
            const response = await makeLoginRequest(requestBody)
    
            expect(response.status).toStrictEqual(200)
        })
    
        it('should return status 401 when trying to login with the wrong password', async () => {
            const requestBody = {
                username: 'henry_cavill',
                password: 'teste1234'
            }
    
            const resolvedValue = {
                rowCount: 1,
                rows: [
                    {id: 1,
                    password: '$2b$10$kuLkommM7.T83jpQC26tDu7Xb0MMsyth6RL2QuYjVihSIjihLr0KG'}
                ]
            }
    
            jest.spyOn(Pool.prototype, 'query').mockResolvedValue(resolvedValue);
    
            const response = await makeLoginRequest(requestBody)
    
            expect(response.status).toStrictEqual(401)
        })
    
        it('should return status 500 when database query throws error', async () => {
            const requestBody = {
                username: 'henry_cavill',
                password: 'teste1234'
            }
    
            const spy = jest.spyOn(Pool.prototype, 'query').mockRejectedValue(new Error('Database error'));
    
            const response = await makeLoginRequest(requestBody)
    
            const errorMessage = await response.json();
    
            expect(response.status).toStrictEqual(500)
            expect(errorMessage.error).toStrictEqual('Server error, please try again later!')
            spy.mockRestore();
        })
    
        it('should return status 422 when there is a missing request parameter', async () => {
            const requestBody = {
                username: 'henry_cavill',
            }
    
            const response = await makeLoginRequest(requestBody)
    
            expect(response.status).toStrictEqual(422)
        })
    })

    describe('Face Login API Test Suite', () => {
        it('should return status 200 when trying to face login', async () => {
            const username = 'henry_cavill';
            const formData = new FormData();
            formData.append("username", username);
            
            addFilesToForm(formData, 'mock_images_cavill')

            const headers = formData.getHeaders();

            const resolvedValueFindUser = {
                rowCount: 1,
                rows: [{
                    id: 1,
                    username: 'henry_cavill',
                    password: '$2b$10$kuLkommM7.T83jpQC26tDu7Xb0MMsyth6RL2QuYjVihSIjihLr0KG'
                }]
            }

            const resolvedValueFaceEmbedding = {
                rowCount: 1,
                rows: [ { distance: 0 } ]
            }
    
            const spy = jest.spyOn(Pool.prototype, 'query')
                .mockResolvedValueOnce(resolvedValueFindUser)
                .mockResolvedValue(resolvedValueFaceEmbedding);
    
            const response = await makeRequest('face_login', formData, headers)
    
            expect(response.status).toStrictEqual(200)

            spy.mockRestore();
        })
    
        it('should return status 401 when trying to face login with wrong person', async () => {
            const username = 'henry_cavill';
            const formData = new FormData();
            formData.append("username", username);
            
            addFilesToForm(formData, 'mock_images_affleck')

            const headers = formData.getHeaders();

            const resolvedValueFindUser = {
                rowCount: 1,
                rows: [{
                    id: 1,
                    username: 'henry_cavill',
                    password: '$2b$10$kuLkommM7.T83jpQC26tDu7Xb0MMsyth6RL2QuYjVihSIjihLr0KG'
                }]
            }

            const resolvedValueFaceEmbedding = {
                rowCount: 1,
                rows: [ { distance: 12.499186985279033 } ]
            }
    
            const spy = jest.spyOn(Pool.prototype, 'query')
                .mockResolvedValueOnce(resolvedValueFindUser)
                .mockResolvedValue(resolvedValueFaceEmbedding);
    
            const response = await makeRequest('face_login', formData, headers)
    
            expect(response.status).toStrictEqual(401);

            spy.mockRestore();
        })

        it('should return status 500 when database query throws error', async () => {
            const username = 'henry_cavill';
            const formData = new FormData();
            formData.append("username", username);
            
            addFilesToForm(formData, 'mock_images_cavill')

            const headers = formData.getHeaders();
    
            const spy = jest.spyOn(Pool.prototype, 'query').mockRejectedValue(new Error('Database error'));
    
            const response = await makeRequest('face_login', formData, headers)
    
            expect(response.status).toStrictEqual(500)

            spy.mockRestore();
        })

        it('should return status 422 when there is a missing request parameter', async () => {
            const username = 'henry_cavill';
            const formData = new FormData();
            formData.append("username", username);
            
            const headers = formData.getHeaders();
    
            const response = await makeRequest('face_login', formData, headers)

            let jsonResponse = await response.json()

            expect(jsonResponse.error).toStrictEqual('At least 5 files are required.')
            expect(response.status).toStrictEqual(422)
        })
    })

    describe('Face Recognition API Test Suite', () => {
        it('should return status 200 when trying to recognize a give face', async () => {
            const formData = new FormData();
            
            addFilesToForm(formData, 'mock_images_cavill')

            const headers = formData.getHeaders();

            const resolvedValueFindUser = {
                rowCount: 1,
                rows: [{
                    id: 1,
                    username: 'henry_cavill',
                    password: '$2b$10$kuLkommM7.T83jpQC26tDu7Xb0MMsyth6RL2QuYjVihSIjihLr0KG'
                }]
            }

            const resolvedValueFaceEmbedding = {
                rowCount: 1,
                rows: [ { distance: 0 } ]
            }
    
            const spy = jest.spyOn(Pool.prototype, 'query')
                .mockResolvedValueOnce(resolvedValueFindUser)
                .mockResolvedValue(resolvedValueFaceEmbedding);
    
            const response = await makeRequest('face_recognition', formData, headers)
    
            expect(response.status).toStrictEqual(200)

            spy.mockRestore();
        })
    
        it('should return status 401 when trying to face login with wrong person', async () => {
            const formData = new FormData();
            
            addFilesToForm(formData, 'mock_images_affleck')

            const headers = formData.getHeaders();

            const resolvedValueFindUser = {
                rowCount: 1,
                rows: [{
                    id: 1,
                    username: 'henry_cavill',
                    password: '$2b$10$kuLkommM7.T83jpQC26tDu7Xb0MMsyth6RL2QuYjVihSIjihLr0KG'
                }]
            }

            const resolvedValueFaceEmbedding = {
                rowCount: 1,
                rows: [ { distance: 12.499186985279033 } ]
            }
    
            const spy = jest.spyOn(Pool.prototype, 'query')
                .mockResolvedValueOnce(resolvedValueFindUser)
                .mockResolvedValue(resolvedValueFaceEmbedding);
    
            const response = await makeRequest('face_recognition', formData, headers)
    
            expect(response.status).toStrictEqual(401);

            spy.mockRestore();
        })

        it('should return status 500 when database query throws error', async () => {
            const formData = new FormData();
            
            addFilesToForm(formData, 'mock_images_cavill')

            const headers = formData.getHeaders();

            const spy = jest.spyOn(Pool.prototype, 'query').mockRejectedValue(new Error('Database error'));
    
            const response = await makeRequest('face_recognition', formData, headers)
    
            expect(response.status).toStrictEqual(500)

            spy.mockRestore();
        })

        it('should return status 422 when there is a missing request parameter', async () => {
            const formData = new FormData();
            addLimitedFilesToForm(formData, 'mock_images_cavill', 3)
            const headers = formData.getHeaders();
    
            const response = await makeRequest('face_recognition', formData, headers)

            let jsonResponse = await response.json()

            expect(jsonResponse.error).toStrictEqual('At least 5 files are required.')
            expect(response.status).toStrictEqual(422)

        })
    })

    describe('Register API Test Suite', () => {

        it('should return status 201 when a new user is created successfully', async () => {
            const username = 'henry_cavill';
            const password = 'test123'
            const formData = new FormData();
            formData.append("username", username);
            formData.append("password", password);
            
            addFilesToForm(formData, 'mock_images_cavill')

            const headers = formData.getHeaders();

            const resolvedValueFindUser = {
                rowCount: 0
            }
    
            const resolvedValueInsertedUser = {
                rowCount: 1,
                rows: [
                    {id: 1}
                ]
            }

            const resolvedValueInsertedImages = {
                rowCount: 5,
            }

            const spy = jest.spyOn(Pool.prototype, 'query')
                .mockResolvedValueOnce(resolvedValueFindUser)
                .mockResolvedValueOnce(resolvedValueInsertedUser)
                .mockResolvedValue(resolvedValueInsertedImages)
    
            const response = await makeRequest('register', formData, headers)
    
            expect(response.status).toStrictEqual(201)

            spy.mockRestore();
        })

        it('should return status 409 when trying to register a user that already exists', async () => {
            const username = 'henry_cavill';
            const password = 'teste123';
            const formData = new FormData();
            formData.append("username", username);
            formData.append("password", password);

            addFilesToForm(formData, 'mock_images_cavill')

            const headers = formData.getHeaders();
            
            const resolvedValue = {
                rowCount: 1,
                rows: [{
                    id: 1,
                    username: 'henry_cavill',
                    password: '$2b$10$kuLkommM7.T83jpQC26tDu7Xb0MMsyth6RL2QuYjVihSIjihLr0KG'
                }]
            }
    
            const spy = jest.spyOn(Pool.prototype, 'query').mockResolvedValue(resolvedValue);
    
            const response = await makeRequest('register', formData, headers)
    
            expect(response.status).toStrictEqual(409)

            spy.mockRestore();
        })

        it('should return status 500 when database query throws error', async () => {
            const username = 'henry_cavill';
            const password = 'teste123';
            const formData = new FormData();
            formData.append("username", username);
            formData.append("password", password);

            addFilesToForm(formData, 'mock_images_cavill')

            const headers = formData.getHeaders();
    
            const spy = jest.spyOn(Pool.prototype, 'query').mockRejectedValue(new Error('Database error'));
    
            const response = await makeRequest('register', formData, headers)
    
            expect(response.status).toStrictEqual(500)

            spy.mockRestore();
        })

        it('should return status 422 when there is a missing request parameter', async () => {
            const username = 'henry_cavill';

            const formData = new FormData();

            formData.append("username", username);

            addLimitedFilesToForm(formData, 'mock_images_cavill', 3)
            const headers = formData.getHeaders();
    
            const response = await makeRequest('register', formData, headers)

            let jsonResponse = await response.json()
            expect(jsonResponse.error).toStrictEqual('At least 5 files are required.')
            expect(response.status).toStrictEqual(422)
        })
    })

})