let RunQ =  async (query) => await (new Client({secret: 'fnAF1LlG-fAAQiSiyTR_I23rhEFg8xZgUWgLDs7p'})).query(query)


// EXPORT FUNCTIONS
let DB = {
    'user': {
        'create': async (email, pass) => await RunQ(fql`users.create({ email: ${email}, pass: ${pass} })`),
        'get': async (email) => await RunQ(fql`users.byEmail(${email}).first()`),
        'update': async (email, updates) => await RunQ(fql`users.byEmail(${email}).first()?.update(${updates})`),
        'exists': async (email) => await RunQ(fql`users.byEmail(${email}).first()?.exists()`),
        'delete': async (email) => await RunQ(fql`users.byEmail(${email}).first()?.delete()`)
    },
    'u': {
        'create': async (email, pass) => await RunQ(fql`users.create({ email: ${email}, pass: ${pass} })`).then(x=> x.data),
        'get': async (email) => await RunQ(fql`users.byEmail(${email}).first()`).then(x=> x.data),
        'update': async (email, updates) => await RunQ(fql`users.byEmail(${email}).first()?.update(${updates})`).then(x=> x.data),
        'exists': async (email) => await RunQ(fql`users.byEmail(${email}).first()?.exists()`).then(x=> x.data || false),
        'delete': async (email) => await RunQ(fql`users.byEmail(${email}).first()?.delete()`).then(_=> null)
    },
    'runQ': RunQ
}

window.DB = DB

/**
 * About this file: fauna.js
 * 
 * This file is a snippet of code that is used to interact with FaunaDB.
 * 
 * Functions:
 * 
 * - RunQ(query): Executes a FaunaDB query using the provided secret.
 * 
 * - DB.user.create(email, pass): Creates a new user with the given email and password.
 * - DB.user.get(email): Retrieves a user by their email.
 * - DB.user.update(email, updates): Updates a user's information based on their email.
 * - DB.user.exists(email): Checks if a user exists by their email.
 * - DB.user.delete(email): Deletes a user by their email.
 * 
 * - DB.u.create(email, pass): Creates a new user and returns the user data.
 * - DB.u.get(email): Retrieves a user by their email and returns the user data.
 * - DB.u.update(email, updates): Updates a user's information and returns the updated data.
 * - DB.u.exists(email): Checks if a user exists and returns a boolean.
 * - DB.u.delete(email): Deletes a user and returns null.
 * 
 * - DB.runQ(query): Executes a FaunaDB query.
 * 
 * Usage:
 * 
 * To use this file, include it in your project and call the functions as needed.
 * 
 * Example:
 * 
 * DB.user.create('example@example.com', 'password123')
 *   .then(user => console.log('User created:', user))
 *   .catch(err => console.error('Error creating user:', err));
 * 
 */