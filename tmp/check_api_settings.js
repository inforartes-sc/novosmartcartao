async function checkApi() {
  const res = await fetch('http://localhost:3000/api/settings');
  const data = await res.json();
  console.log('API Response:', JSON.stringify(data, null, 2));
}

checkApi();
