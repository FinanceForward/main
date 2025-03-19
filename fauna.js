let RunQ =  async (query) => await (new Client({secret: 'fnAF1LlG-fAAQiSiyTR_I23rhEFg8xZgUWgLDs7p'})).query(query)

// EXPORT FUNCTIONS
let DB = {
    'user': {
        'create': async (hash) => await RunQ(fql`users.create({ hash: ${hash} })`),
        'get': async (hash) => await RunQ(fql`users.byHash(${hash}).first()`),
        'update': async (hash, updates) => await RunQ(fql`users.byHash(${hash}).first()?.update(${updates})`),
        'exists': async (hash) => await RunQ(fql`users.byHash(${hash}).first()?.exists()`),
        'delete': async (hash) => await RunQ(fql`users.byHash(${hash}).first()?.delete()`)
    },
    'u': {
        'create': async (hash) => await RunQ(fql`users.create({ hash: ${hash} })`).then(x=> x.data),
        'get': async (hash) => await RunQ(fql`users.byHash(${hash}).first()`).then(x=> x.data),
        'update': async (hash, updates) => await RunQ(fql`users.byHash(${hash}).first()?.update(${updates})`).then(x=> x.data),
        'exists': async (hash) => await RunQ(fql`users.byHash(${hash}).first()?.exists()`).then(x=> x.data || false),
        'delete': async (hash) => await RunQ(fql`users.byHash(${hash}).first()?.delete()`).then(_=> null)
    },
    'runQ': RunQ
}

let version = "BETA 1.2"

window.DB = DB
window.version = version
window.RunQ = RunQ

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