// ============================================================
// public/js/tutores.js
// ============================================================
// ESTE ARQUIVO É COM VOCÊ (ALUNO DESENVOLVE).
//
// A estrutura abaixo (elementos, eventos já conectados, nomes de
// função) já está pronta para vocês seguirem o mesmo padrão usado
// em outros projetos do curso (inicializar() no topo, funções
// carregarX() e renderizarX() separadas). O que falta é o conteúdo
// de cada função marcada com TODO.
//
// EXEMPLOS DE APOIO (pasta exemplos/):
//   - exemplo-montar-tela.js : desenhar a tabela, botões Editar e
//                              Excluir, levar os dados para o formulário
//   - exemplo-fetch.js       : todos os tipos de fetch (GET, busca,
//                              POST, PUT e DELETE)
//
// Requisitos envolvidos neste arquivo: RF-12, RF-13, RF-14, RF-15, RF-17
// ============================================================

const corpoTabela = document.getElementById('corpo-tabela-tutores');
const tabela = document.getElementById('tabela-tutores');
const mensagemTutores = document.getElementById('mensagem-tutores');

const inputBusca = document.getElementById('input-busca');
const btnBuscar = document.getElementById('btn-buscar');

const formTutor = document.getElementById('form-tutor');
const tutorIdInput = document.getElementById('tutor-id');
const tutorNomeInput = document.getElementById('tutor-nome');
const tutorCpfInput = document.getElementById('tutor-cpf');
const tutorTelefoneInput = document.getElementById('tutor-telefone');
const btnCancelarEdicao = document.getElementById('btn-cancelar-edicao');

inicializar();

async function inicializar() {
    await carregarTutores();
}

// ------------------------------------------------------------
// RF-12: listar tutore
// RF-14: também é usada para a busca (aceita um termo opcional)
// ------------------------------------------------------------
async function carregarTutores(termoBusca = '') {
    try {
        // TODO: monte a URL da requisição. Se termoBusca não for
        // vazio, inclua como query string, ex:
        //   /api/tutores?busca=' + encodeURIComponent(termoBusca)
        // Se for vazio, chame só /api/tutores

        const url = termoBusca.trim()
            ? `/api/tutores?busca=${encodeURIComponent(termoBusca.trim())}`
            : '/api/tutores';

        const resposta = await fetch(url);

        if (resposta.status === 401) {
            window.location.href = '/login.html';
            return;
        }

        if (!resposta.ok) {
            throw new Error('Erro ao carregar tutores.');
        }

        const tutores = await resposta.json();

        // TODO: faça o fetch, trate resposta.status === 401
        // (redirecionar para /login.html), depois pegue o JSON

        // TODO: chame renderizarTutores(tutores) com o resultado
        renderizarTutores(tutores);

    } catch (erro) {
        mensagemTutores.textContent = 'Erro ao carregar tutores.';
        mensagemTutores.classList.remove('d-none');
        tabela.classList.add('d-none');
        console.error(erro);
    }
}

// ------------------------------------------------------------
// Desenha a tabela de tutores na tela
// ------------------------------------------------------------
function renderizarTutores(tutores) {

    // TODO: se a lista estiver vazia, mantenha mensagemTutores
    // visível com um texto tipo "Nenhum tutor encontrado." e a
    // tabela escondida (classe d-none)

    if (!Array.isArray(tutores) || tutores.length === 0) {
        corpoTabela.innerHTML = '';
        mensagemTutores.textContent = 'Nenhum tutor encontrado.';
        mensagemTutores.classList.remove('d-none');
        tabela.classList.add('d-none');
        return;
    }

    // TODO: caso contrário, esconda mensagemTutores, mostre a
    // tabela (remova d-none) e monte uma linha <tr> para cada
    // tutor dentro de corpoTabela.innerHTML, com:
    //   - nome, cpf (já vindo pronto para exibição - ver rota),
    //     telefone
    //   - um botão "Editar" com data-id="${tutor.id}"
    //   - um botão "Excluir" com data-id="${tutor.id}"
    //
    // Depois de montar o innerHTML, é necessário adicionar os
    // addEventListener nos botões recém-criados (igual ao exemplo
    // de "Remover" visto em aula) - eles ainda não existem no HTML
    // até esse innerHTML ser inserido.

    mensagemTutores.classList.add('d-none');
    tabela.classList.remove('d-none');

    corpoTabela.innerHTML = tutores.map(tutor => `
        <tr>
            <td>${escaparHTML(tutor.nome)}</td>
            <td>${escaparHTML(tutor.cpf)}</td>
            <td>${escaparHTML(tutor.telefone)}</td>
            <td>
                <button
                    type="button"
                    class="btn btn-primary btn-sm btn-editar"
                    data-id="${escaparHTML(tutor.id)}">
                    Editar
                </button>

                <button
                    type="button"
                    class="btn btn-danger btn-sm btn-excluir"
                    data-id="${escaparHTML(tutor.id)}">
                    Excluir
                </button>
            </td>
        </tr>
    `).join('');

    corpoTabela.querySelectorAll('.btn-editar').forEach(botao => {
        botao.addEventListener('click', async () => {
            const id = botao.dataset.id;

            try {
                const resposta = await fetch(
                    `/api/tutores/${encodeURIComponent(id)}`
                );

                if (resposta.status === 401) {
                    window.location.href = '/login.html';
                    return;
                }

                if (!resposta.ok) {
                    throw new Error('Erro ao buscar tutor para edição.');
                }

                const tutor = await resposta.json();
                preencherFormularioParaEdicao(tutor);

            } catch (erro) {
                alert('Erro ao carregar dados do tutor.');
                console.error(erro);
            }
        });
    });

    corpoTabela.querySelectorAll('.btn-excluir').forEach(botao => {
        botao.addEventListener('click', () => {
            excluirTutor(botao.dataset.id);
        });
    });
}

// Função auxiliar para evitar que os dados recebidos sejam
// interpretados como HTML ao serem inseridos na tabela.
function escaparHTML(valor) {
    return String(valor ?? '').replace(/[&<>"']/g, caractere => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[caractere]);
}

// ------------------------------------------------------------
// RF-14: busca
// ------------------------------------------------------------
btnBuscar.addEventListener('click', () => {
    // TODO: pegue o valor de inputBusca.value e chame
    // carregarTutores(termo)
    const termo = inputBusca.value.trim();
    carregarTutores(termo);
});

// Permite realizar a busca pressionando Enter no campo de busca.
inputBusca.addEventListener('keydown', evento => {
    if (evento.key === 'Enter') {
        evento.preventDefault();
        carregarTutores(inputBusca.value.trim());
    }
});

// ------------------------------------------------------------
// RF-15 / RF-17: salvar (inserir novo ou editar existente)
// ------------------------------------------------------------
formTutor.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const tutor = {
        nome: tutorNomeInput.value.trim(),
        cpf: tutorCpfInput.value.trim(),
        telefone: tutorTelefoneInput.value.trim()
    };

    const id = tutorIdInput.value;

    try {
        // TODO: se "id" estiver preenchido, é uma edição (RF-17) ->
        //   fetch PUT /api/tutores/{id}
        // Se estiver vazio, é um novo cadastro (RF-15) ->
        //   fetch POST /api/tutores
        // Em ambos os casos: enviar "tutor" como JSON no body,
        // conferir resposta.ok, e se der certo:
        //   - limpar o formulário (formTutor.reset())
        //   - esconder o botão de cancelar edição
        //   - chamar carregarTutores() de novo para atualizar a lista

        const url = id
            ? `/api/tutores/${encodeURIComponent(id)}`
            : '/api/tutores';

        const metodo = id ? 'PUT' : 'POST';

        const resposta = await fetch(url, {
            method: metodo,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(tutor)
        });

        if (resposta.status === 401) {
            window.location.href = '/login.html';
            return;
        }

        if (!resposta.ok) {
            const detalhe = await resposta.text();
            throw new Error(
                detalhe || 'Erro ao salvar tutor.'
            );
        }

        formTutor.reset();
        tutorIdInput.value = '';
        btnCancelarEdicao.classList.add('d-none');

        await carregarTutores();

    } catch (erro) {
        alert('Erro ao salvar tutor.');
        console.error(erro);
    }
});

btnCancelarEdicao.addEventListener('click', () => {
    formTutor.reset();
    tutorIdInput.value = '';
    btnCancelarEdicao.classList.add('d-none');
});

// ------------------------------------------------------------
// Chamada pelos botões "Editar" criados em renderizarTutores()
// ------------------------------------------------------------
function preencherFormularioParaEdicao(tutor) {
    // TODO: preencher tutorIdInput, tutorNomeInput, tutorCpfInput,
    // tutorTelefoneInput com os dados de "tutor", e mostrar o
    // botão btnCancelarEdicao (remover a classe d-none)

    tutorIdInput.value = tutor.id ?? '';
    tutorNomeInput.value = tutor.nome ?? '';
    tutorCpfInput.value = tutor.cpf ?? '';
    tutorTelefoneInput.value = tutor.telefone ?? '';

    btnCancelarEdicao.classList.remove('d-none');

    // Leva o formulário para a área visível da tela.
    formTutor.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

// ------------------------------------------------------------
// RF-13: excluir tutor
// Chamada pelos botões "Excluir" criados em renderizarTutores()
// ------------------------------------------------------------
async function excluirTutor(id) {
    if (!confirm('Deseja realmente excluir este tutor?')) return;

    try {
        // TODO: fetch DELETE /api/tutores/{id}, conferir resposta.ok,
        // e se der certo, chamar carregarTutores() de novo

        const resposta = await fetch(
            `/api/tutores/${encodeURIComponent(id)}`,
            {
                method: 'DELETE'
            }
        );

        if (resposta.status === 401) {
            window.location.href = '/login.html';
            return;
        }

        if (!resposta.ok) {
            const detalhe = await resposta.text();
            throw new Error(
                detalhe || 'Erro ao excluir tutor.'
            );
        }

        await carregarTutores();

    } catch (erro) {
        alert('Erro ao excluir tutor.');
        console.error(erro);
    }
}   