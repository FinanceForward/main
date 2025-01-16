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