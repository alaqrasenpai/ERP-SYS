async function test() {
    try {
        const response = await fetch('http://localhost:5000/api/super/tenants', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test Tenant 2',
                tenantId: 'test_tenant_2',
                dbName: 'test_tenant_db_2',
                adminName: 'Test Admin',
                adminEmail: 'test2@admin.com',
                adminPassword: 'password123'
            })
        });
        const data = await response.json();
        console.log(data);
    } catch (e) {
        console.error(e.message);
    }
}
test();
