const { describe, it, expect, jest } = require('@jest/globals')

describe('Auth Controller Test Suite', () => {
    
    it('should return true', async () => {
        const response = true; 

        expect(response).toStrictEqual(true)
    })
})