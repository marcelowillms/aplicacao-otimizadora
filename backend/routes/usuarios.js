const express = require("express");
const router = express.Router();
const db = require("../db");

// cadastra novo usuário
router.post("/", async (req, res) => {
    try {
        const { nome, email, senha } = req.body;

        if (!nome || !email || !senha) {
            return res.status(400).json({ erro: "Nome, email e senha são obrigatórios" });
        }

        // Verifica se email já está cadastrado
        const emailExistente = await db.query(
            "SELECT id FROM usuarios WHERE email = $1",
            [email]
        );

        if (emailExistente.rows.length > 0) {
            return res.status(409).json({ erro: "Email já cadastrado" });
        }

        const result = await db.query(
            `INSERT INTO usuarios (nome, email, senha)
             VALUES ($1, $2, $3)
             RETURNING id, nome, email, pontuacao, perfil`,
            [nome, email, senha]
        );

        res.status(201).json({
            mensagem: "Usuário cadastrado com sucesso",
            usuario: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro ao cadastrar usuário" });
    }
});

// busca dados do usuário
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(
            "SELECT id, nome, email, pontuacao, perfil FROM usuarios WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ erro: "Usuário não encontrado" });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro ao buscar usuário" });
    }
});

module.exports = router;