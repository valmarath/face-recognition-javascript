const { describe, it, expect, jest, beforeAll, afterAll } = require('@jest/globals')
const { server } = require('../app') 
const Pool = require("pg").Pool;
const fs = require('node:fs/promises')

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

/*     jest.mock('pg', () => {
        const mPool = {
            query: jest.fn(),  // This is the method we need to mock correctly
            connect: jest.fn(),
            end: jest.fn(),
            on: jest.fn(),
        };
        return { Pool: jest.fn(() => mPool) };
    }); */

    beforeAll(async () => {

        _testServer = server
        
        await waitForServerStatus(_testServer)

        const serverInfo = _testServer.address()

        _testServerAddress = `http://localhost:${serverInfo.port}`
    })

    afterAll((done) => {
        jest.clearAllMocks();
        _testServer.close(done)
    })

    it('should return status 200 when trying to login', async () => {
        const requestBody = {
            username: 'henry_cavill',
            password: 'teste123'
        }

        const resolvedValue = {
            rowCount: 1,
            rows: [
                {id: 1,
                password: '$2b$10$qhvny7KZFM7DazNx6bsYw.SCnIOg27KlAFTxZdZi5qQnNqqxdZ/Ny'}
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
                password: '$2b$10$qhvny7KZFM7DazNx6bsYw.SCnIOg27KlAFTxZdZi5qQnNqqxdZ/Ny'}
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

        const resolvedValue = {
            rowCount: 1,
            rows: [
                {id: 1,
                password: '$2b$10$qhvny7KZFM7DazNx6bsYw.SCnIOg27KlAFTxZdZi5qQnNqqxdZ/Ny'}
            ]
        }

        jest.spyOn(Pool.prototype, 'query').mockResolvedValue(new Error('Database error!'));

        const response = await makeLoginRequest(requestBody)

        const errorMessage = await response.json();

        expect(response.status).toStrictEqual(500)
        expect(errorMessage.error).toStrictEqual('Server error, please try again later!')
    })

    it('should return status 422 when there is a missing request parameter', async () => {
        const requestBody = {
            username: 'henry_cavill',
        }

        const response = await makeLoginRequest(requestBody)

        expect(response.status).toStrictEqual(422)
    })
})