const express = require("express");

const router = express.Router();

const db = require("../db");



router.post("/", async (req, res) => {

    try {

        const {
            email,
            senha
        } = req.body;



        const result = await db.query(
            `
            SELECT *
            FROM usuarios
            WHERE email = $1
            `,
            [email]
        );



        if (result.rows.length === 0) {

            return res.status(401).json({
                erro: "Usuário não encontrado"
            });

        }



        const usuario = result.rows[0];



        if (usuario.senha !== senha) {

            return res.status(401).json({
                erro: "Senha inválida"
            });

        }



        res.json({
            mensagem: "Login realizado com sucesso",
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                pontuacao: usuario.pontuacao,
                perfil: usuario.perfil
            }
        });



    } catch (error) {

        console.error(error);

        res.status(500).json({
            erro: "Erro ao realizar login"
        });

    }

});



module.exports = router;