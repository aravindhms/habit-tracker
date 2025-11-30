// const fetch = require('node-fetch'); // Using native fetch

const BASE_URL = 'http://localhost:5001/api';

async function testPersistence() {
    // 1. Create a dummy habit
    console.log("Creating habit...");
    const habitRes = await fetch(`${BASE_URL}/habits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test Weekly', frequency: 'weekly', icon: '🧪' })
    });
    const habit = await habitRes.json();
    console.log("Created habit:", habit);

    // 2. Toggle it for 2025-11-W1
    const dateKey = '2025-11-W1';
    console.log(`Toggling habit ${habit.id} for ${dateKey}...`);
    const toggleRes = await fetch(`${BASE_URL}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habit_id: habit.id, date: dateKey, status: 1 })
    });
    console.log("Toggle response:", await toggleRes.json());

    // 3. Fetch for 2025-12 (simulate navigation)
    console.log("Fetching Dec 2025...");
    await fetch(`${BASE_URL}/data?month=2025-12`);

    // 4. Fetch for 2025-11 (navigate back)
    console.log("Fetching Nov 2025...");
    const dataRes = await fetch(`${BASE_URL}/data?month=2025-11`);
    const data = await dataRes.json();

    // 5. Check if log exists
    const log = data.logs.find(l => l.habit_id === habit.id && l.date === dateKey);
    if (log && log.status === 1) {
        console.log("SUCCESS: Log found and status is 1");
    } else {
        console.log("FAILURE: Log not found or status incorrect", log);
    }
}

testPersistence().catch(console.error);
