const D = require("better-sqlite3");
const db = new D("./studyhub.db", { readonly: true });
console.log(db.prepare("SELECT name, sql FROM sqlite_master WHERE type = ?").all("table"));
db.close();
