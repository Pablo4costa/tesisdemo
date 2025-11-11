You are assisting in connecting this static frontend (repo: tesisdemo) to a backend API hosted at:
https://housegur-api.up.railway.app

The project is part of a thesis named "Housegur" — a tokenized real estate investment simulator.
The goal is to integrate these HTML pages with the FastAPI backend, preserving all existing styles.

### BACKEND ENDPOINTS
- POST /auth/login  → body: { "nombre": "Pablo", "email": "pablo@example.com" }
  returns: { "status": "ok", "usuario_id": 3, "nombre": "Pablo" }

- GET /properties
  returns: list of properties [{ id, nombre, ubicacion, precio_token, tokens_disponibles }]

- POST /transactions/buy
  body: { "user_id": 3, "property_id": 1, "tokens": 10 }

- POST /transactions/sell
  body: { "user_id": 3, "property_id": 1, "tokens": 5 }

- GET /holdings?user_id=3
  returns: user’s holdings with property and token count

### FRONTEND REQUIREMENTS
1. `login.html`
   - On submit, call POST /auth/login using fetch()
   - Save usuario_id and nombre in localStorage
   - Redirect to propiedades.html

2. `propiedades.html`
   - On load, fetch /properties and show them in cards
   - Each card: property name, location, price per token, tokens available
   - Add “Buy tokens” button → goes to confirm.html?action=buy&id={property_id}

3. `mis-tokens.html`
   - On load, fetch /holdings?user_id={from localStorage}
   - Display list of owned properties and token counts

4. `confirm.html`
   - Depending on query param “action” (buy/sell),
     show message of success or failure after calling the respective endpoint.

5. Use async/await and modern JavaScript syntax.
6. Add descriptive console logs.
7. All comments in English.
8. Never break or remove existing CSS/HTML structure from the repo.
9. Create a new JS file `/js/api.js` if not present,
   export helper functions like `loginUser()`, `getProperties()`, `buyTokens()`, etc.
10. Test locally using Live Server or any local static server.

### Example fetch template
```js
async function loginUser(nombre, email) {
  const res = await fetch('https://housegur-api.up.railway.app/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, email })
  });
  return await res.json();
}

Implement and wire up the JS scripts into each HTML page accordingly.