const fetch = require('node-fetch'); // Ensure node-fetch is available or use native fetch if node 18+

const API_URL = 'http://localhost:5000/api/restaurant';

const testApi = async () => {
    try {
        console.log('🧪 Testing GET /api/restaurant...');
        const res = await fetch(API_URL);
        const data = await res.json();
        console.log('Response:', data);

        if (!data.name) throw new Error("GET failed or data missing");

        console.log('✅ GET passed');

        console.log('🧪 Testing PUT /api/restaurant...');
        const updatePayload = {
            ...data,
            name: "Moonstone Café (Updated)",
            updated_at: undefined // Don't send this
        };

        const res2 = await fetch(API_URL, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatePayload)
        });
        const data2 = await res2.json();
        console.log('Response:', data2);

        if (!data2.success) throw new Error("PUT failed");

        console.log('✅ PUT passed');

        // Revert
        console.log('Reverting name...');
        await fetch(API_URL, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...updatePayload, name: "Moonstone Café" })
        });
        console.log('✅ Revert passed');

    } catch (error) {
        console.error('❌ Test Failed:', error);
    }
};

testApi();
