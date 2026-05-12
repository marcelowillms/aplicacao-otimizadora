const express = require("express");
const router = express.Router();
const db = require("../db");

// busca tarefas de um usuário
router.get("/usuario/:usuario_id", async (req, res) => {
    try {
        const { usuario_id } = req.params;

        const result = await db.query(
            `SELECT * FROM tarefas
             WHERE usuario_id = $1
             ORDER BY prioridade DESC, data_criacao DESC`,
            [usuario_id]
        );

        res.json(result.rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro ao buscar tarefas" });
    }
});

// cria nova tarefa
router.post("/", async (req, res) => {
    try {
        const { usuario_id, titulo, prioridade, tempo_estimado, categoria } = req.body;

        if (!usuario_id || !titulo) {
            return res.status(400).json({ erro: "usuario e titulo são obrigatórios" });
        }

        const result = await db.query(
            `INSERT INTO tarefas (usuario_id, titulo, prioridade, tempo_estimado, categoria)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [usuario_id, titulo, prioridade ?? 1, tempo_estimado, categoria]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro ao criar tarefa" });
    }
});

// conclui tarefa e pontua o usuário
router.patch("/:id/concluir", async (req, res) => {
    const client = await db.connect();

    try {
        const { id } = req.params;

        // Busca a tarefa
        const tarefaResult = await client.query(
            "SELECT * FROM tarefas WHERE id = $1",
            [id]
        );

        if (tarefaResult.rows.length === 0) {
            return res.status(404).json({ erro: "Tarefa não encontrada" });
        }

        const tarefa = tarefaResult.rows[0];

        if (tarefa.status === "concluida") {
            return res.status(400).json({ erro: "Tarefa já foi concluída" });
        }

        // Calcula pontos
        const pontos = (tarefa.prioridade ?? 1) * 10;

        await client.query("BEGIN");

        // Atualiza status da tarefa
        const tarefaAtualizada = await client.query(
            `UPDATE tarefas SET status = 'concluida'
             WHERE id = $1 RETURNING *`,
            [id]
        );

        // Soma pontos ao usuário
        await client.query(
            `UPDATE usuarios SET pontuacao = pontuacao + $1
             WHERE id = $2`,
            [pontos, tarefa.usuario_id]
        );

        // Registra recompensa
        await client.query(
            `INSERT INTO recompensas (usuario_id, tipo, descricao)
             VALUES ($1, 'pontos', $2)`,
            [tarefa.usuario_id, `+${pontos} pontos por concluir: "${tarefa.titulo}"`]
        );

        await client.query("COMMIT");

        res.json({
            mensagem: "Tarefa concluída!",
            pontos_ganhos: pontos,
            tarefa: tarefaAtualizada.rows[0]
        });

    } catch (error) {
        await client.query("ROLLBACK");
        console.error(error);
        res.status(500).json({ erro: "Erro ao concluir tarefa" });
    } finally {
        client.release();
    }
});

// remove tarefa
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(
            "DELETE FROM tarefas WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ erro: "Tarefa não encontrada" });
        }

        res.json({ mensagem: "Tarefa removida com sucesso" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro ao remover tarefa" });
    }
});

module.exports = router;