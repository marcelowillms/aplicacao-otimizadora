const BASE_URL = window.location.hostname === "localhost" 
    ? "http://localhost:3000" 
    : "https://aplicacao-otimizadora-production.up.railway.app";


function mostrarMsg(texto, tipo) {
    const el = document.getElementById("msg");
    if (!el) return;
    el.textContent = texto;
    el.style.color = tipo === "erro" ? "red" : "green";
}



async function cadastrar() {
    const nome  = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();

    if (!nome || !email || !senha) {
        mostrarMsg("Preencha todos os campos.", "erro");
        return;
    }

    if (senha.length < 6) {
        mostrarMsg("A senha deve ter no mínimo 6 caracteres.", "erro");
        return;
    }

    try {
        const res = await fetch(`${BASE_URL}/usuarios`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome, email, senha })
        });

        const data = await res.json();

        if (!res.ok) {
            mostrarMsg(data.erro || "Erro ao criar conta.", "erro");
            return;
        }

        localStorage.setItem("usuario", JSON.stringify(data.usuario));
        window.location.href = "tarefas.html";

    } catch (err) {
        mostrarMsg("Não foi possível conectar ao servidor.", "erro");
    }
}



async function fazerLogin() {
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();

    if (!email || !senha) {
        mostrarMsg("Preencha e-mail e senha.", "erro");
        return;
    }

    try {
        const res = await fetch(`${BASE_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, senha })
        });

        const data = await res.json();

        if (!res.ok) {
            mostrarMsg(data.erro || "Erro ao fazer login.", "erro");
            return;
        }

        localStorage.setItem("usuario", JSON.stringify(data.usuario));
        window.location.href = "tarefas.html";

    } catch (err) {
        mostrarMsg("Não foi possível conectar ao servidor.", "erro");
    }
}


const usuario = JSON.parse(localStorage.getItem("usuario"));
let tarefasCache = [];


function atualizarRelogio() {
    const el = document.getElementById("data-hora");
    if (!el) return;
    const agora = new Date();
    const dia  = agora.toLocaleDateString("pt-BR");
    const hora = agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    el.textContent = `⏱ Agora: ${dia} - ${hora}`;
}

setInterval(atualizarRelogio, 1000);
atualizarRelogio();


if (usuario && document.getElementById("pontuacao")) {
    document.getElementById("pontuacao").textContent = usuario.pontuacao || 0;
}


const cores = {
    "Estudos": "estudos",
    "Atividades domésticas": "domesticas",
    "Entretenimento": "entretenimento",
    "Compras": "compras",
    "Outros": "outros"
};

let tarefaAtual = null;


async function carregarTarefas() {
    if (!usuario) return;
    const res = await fetch(`${BASE_URL}/tarefas/usuario/${usuario.id}`);
    tarefasCache = await res.json();
    renderizar(tarefasCache);
}


function renderizar(tarefas) {
    const lista = document.getElementById("lista-tarefas");
    if (!lista) return;

    const pendentes = tarefas.filter(t => t.status !== "concluida");

    if (pendentes.length === 0) {
        lista.innerHTML = "<p style='text-align:center; color:#888; padding:24px'>Nenhuma atividade cadastrada.</p>";
        return;
    }

    const ordemEl = document.querySelector('input[name="ordem"]:checked');
    const ordem = ordemEl ? ordemEl.value : "peps";

    const ordenadas = [...pendentes];

    if (ordem === "rapidos") {
        ordenadas.sort((a, b) => (a.tempo_estimado || 999) - (b.tempo_estimado || 999));
    } else if (ordem === "prioridade") {
        ordenadas.sort((a, b) => b.prioridade - a.prioridade);
    } else {
        ordenadas.sort((a, b) => a.id - b.id);
    }

    lista.innerHTML = ordenadas.map(t => {
        const data = new Date(t.data_criacao);
        data.setHours(data.getHours() + 3);
        const dataStr = data.toLocaleDateString("pt-BR");
        const horaStr = data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

        return `
        <div class="tarefa-item ${cores[t.categoria] || 'outros'}" onclick="clicarTarefa(${t.id})">
            <div>
                <strong>${t.id}/2026 - ${t.titulo}</strong><br>
                <small>entrada: ${dataStr} ${horaStr}</small>
            </div>
            <span class="tarefa-duracao">${t.tempo_estimado || "--"} min</span>
        </div>`;
    }).join("");
}


function abrirModal() {
    const el = document.getElementById("modal-criar");
    if (el) el.classList.remove("escondido");
}

function fecharModal() {
    const el = document.getElementById("modal-criar");
    if (el) el.classList.add("escondido");
}

async function criarTarefa() {
    const titulo     = document.getElementById("nome-tarefa").value.trim();
    const duracao    = document.getElementById("duracao-tarefa").value;
    const categoria  = document.getElementById("tipo-tarefa").value;
    const prioridade = document.getElementById("prioridade-tarefa").value;

    if (!titulo || !categoria) {
        alert("Preencha o nome e o tipo da atividade.");
        return;
    }

    await fetch(`${BASE_URL}/tarefas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            usuario_id: usuario.id,
            titulo,
            tempo_estimado: duracao ? parseInt(duracao) : null,
            categoria,
            prioridade: parseInt(prioridade)
        })
    });

    fecharModal();
    document.getElementById("nome-tarefa").value = "";
    document.getElementById("duracao-tarefa").value = "";
    document.getElementById("tipo-tarefa").value = "";
    document.getElementById("prioridade-tarefa").value = "1";
    await carregarTarefas();
}



function clicarTarefa(id) {
    tarefaAtual = id;
    const el = document.getElementById("modal-concluir");
    if (el) el.classList.remove("escondido");
}

function fecharModalConcluir() {
    const el = document.getElementById("modal-concluir");
    if (el) el.classList.add("escondido");
    tarefaAtual = null;
}

async function confirmarConclusao() {
    const res  = await fetch(`${BASE_URL}/tarefas/${tarefaAtual}/concluir`, { method: "PATCH" });
    const data = await res.json();

    fecharModalConcluir();

    usuario.pontuacao = (usuario.pontuacao || 0) + data.pontos_ganhos;
    localStorage.setItem("usuario", JSON.stringify(usuario));

    const el = document.getElementById("pontuacao");
    if (el) el.textContent = usuario.pontuacao;

    const msg = document.getElementById("msg-parabens");
    if (msg) msg.innerHTML = `Parabéns!<br>Você ganhou ${data.pontos_ganhos} pontos!<br>Continue assim!`;

    const modal = document.getElementById("modal-parabens");
    if (modal) modal.classList.remove("escondido");

    await carregarTarefas();
}



function fecharParabens() {
    const el = document.getElementById("modal-parabens");
    if (el) el.classList.add("escondido");
}



if (document.getElementById("lista-tarefas")) {
    if (!usuario) {
        window.location.href = "login.html";
    } else {
        document.querySelectorAll('input[name="ordem"]').forEach(radio => {
            radio.addEventListener("change", () => renderizar(tarefasCache));
        });
        carregarTarefas();
    }
}
function sair() {
    localStorage.removeItem("usuario");
    window.location.href = "login.html";
}