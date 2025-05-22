const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');

const app = express();
const port = 3000;

let fornecedores = [];
const usuario = { username: "admin", password: "1234" };

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'segredo',
    resave: false,
    saveUninitialized: true
}));

function autenticar(req, res, next) {
    if (req.session.logado) {
        next();
    } else {
        res.send('<h2>Você precisa estar logado. <a href="/login">Login</a></h2>');
    }
}

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/home.html');
});

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/views/login.html');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === usuario.username && password === usuario.password) {
        req.session.logado = true;
        res.send('<h2>Login realizado com sucesso! <a href="/">Ir para Home</a></h2>');
    } else {
        res.send('<h2>Falha no login! <a href="/login">Tentar novamente</a></h2>');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.send('<h2>Logout efetuado com sucesso! <a href="/">Home</a></h2>');
});

app.get('/fornecedor', autenticar, (req, res) => {
    res.sendFile(__dirname + '/views/fornecedor.html');
});

app.post('/fornecedor', autenticar, (req, res) => {
    const { cnpj, razao, fantasia, endereco, cidade, uf, cep, email, telefone } = req.body;
    let erros = [];

    if (!cnpj) erros.push("CNPJ é obrigatório.");
    if (!razao) erros.push("Razão Social é obrigatória.");
    if (!fantasia) erros.push("Nome Fantasia é obrigatório.");
    if (!endereco) erros.push("Endereço é obrigatório.");
    if (!cidade) erros.push("Cidade é obrigatória.");
    if (!uf) erros.push("UF é obrigatório.");
    if (!cep) erros.push("CEP é obrigatório.");
    if (!email) erros.push("Email é obrigatório.");
    if (!telefone) erros.push("Telefone é obrigatório.");

    if (erros.length > 0) {
        res.send(`<h2>Erros encontrados:</h2><ul>${erros.map(e => `<li>${e}</li>`).join('')}</ul><a href="/fornecedor">Voltar</a>`);
    } else {
        fornecedores.push({ cnpj, razao, fantasia, endereco, cidade, uf, cep, email, telefone });
        res.redirect('/lista_fornecedores');
    }
});

app.get('/lista_fornecedores', autenticar, (req, res) => {
    let lista = fornecedores.map(f => `
        <li>${f.razao} (${f.fantasia}) - CNPJ: ${f.cnpj}, ${f.endereco}, ${f.cidade}-${f.uf}, CEP: ${f.cep}, Email: ${f.email}, Tel: ${f.telefone}</li>
    `).join('');
    res.send(`
        <h1>Lista de Fornecedores</h1>
        <ul>${lista}</ul>
        <a href="/fornecedor">Cadastrar outro fornecedor</a> | <a href="/">Home</a>
    `);
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});

