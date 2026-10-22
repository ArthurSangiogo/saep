// ============================================================
// exemplos/exemplo-fetch.js
// ============================================================
// EXEMPLO DE REFERÊNCIA - não faz parte do sistema e NÃO deve ser
// incluído em nenhum .html (é só para consulta e para copiar).
//
// Mostra, num cenário FICTÍCIO (livros), os 6 usos do fetch que
// aparecem num sistema desse tipo:
//
//   1) listar                      (GET)
//   2) listar com termo de busca   (GET com parâmetro na URL)
//   3) buscar um item pelo id      (GET com id na URL)
//   4) cadastrar                   (POST enviando JSON)
//   5) atualizar                   (PUT enviando JSON)
//   6) excluir                     (DELETE)
//
// Para usar no sistema de vocês: troquem '/api/livros' e os nomes
// dos campos pelos do sistema de vocês.
//
// ------------------------------------------------------------
// 3 REGRAS QUE EVITAM A MAIORIA DOS ERROS
// ------------------------------------------------------------
// 1) O fetch só cai no catch quando a REDE falha. Se o servidor
//    responder 400, 401, 404 ou 500, ele NÃO cai no catch - por
//    isso é preciso conferir "resposta.ok" depois.
// 2) Para ENVIAR dados (POST/PUT) são obrigatórios três itens:
//    method, headers com Content-Type e body com JSON.stringify().
// 3) resposta.json() também é assíncrono: precisa de await.
//
// ------------------------------------------------------------
// COMO CADA FETCH "CONVERSA" COM O BACK-END (routes/*.js)
// ------------------------------------------------------------
// Lembrem: dentro do arquivo de rota o caminho NÃO repete o
// prefixo ('/api/livros'), ele já vem do app.js.
//
//  Front-end                                 Back-end (router)           Onde chega o dado
//  ----------------------------------------  --------------------------  -----------------
//  fetch('/api/livros')                      router.get('/')
//  fetch('/api/livros?busca=dun')            router.get('/')             req.query.busca
//  fetch('/api/livros/5')                    router.get('/:id')          req.params.id
//  fetch('/api/livros', {method:'POST',...}) router.post('/')            req.body
//  fetch('/api/livros/5', {method:'PUT',...}) router.put('/:id')         req.params.id + req.body
//  fetch('/api/livros/5', {method:'DELETE'}) router.delete('/:id')       req.params.id
// ============================================================


// ------------------------------------------------------------
// 1) GET - listar
// ------------------------------------------------------------
async function listarLivros() {
    try {
        const resposta = await fetch('/api/livros');

        // sessão expirada ou usuário não logado: volta para o login
        if (resposta.status === 401) {
            window.location.href = '/login.html';
            return;
        }

        // 400, 404, 500... (o fetch não avisa sozinho, é preciso conferir)
        if (!resposta.ok) {
            throw new Error('Erro ao buscar livros.');
        }

        const livros = await resposta.json(); // vira um array de objetos

        // aqui vocês entregam os dados para a função que desenha a
        // tela (ver exemplo-montar-tela.js)
        renderizarLivros(livros);

    } catch (erro) {
        console.error(erro);
        alert('Erro ao carregar livros.');
    }
}


// ------------------------------------------------------------
// 2) GET com parâmetro na URL - busca
// ------------------------------------------------------------
// O termo vai DEPOIS do "?" no formato  chave=valor.
// encodeURIComponent protege caracteres especiais (espaço, &, ç...).
// Se o termo estiver vazio, chamamos a URL sem parâmetro (lista tudo).
async function buscarLivros(termo) {
    try {
        const url = termo
            ? `/api/tutores?busca=${encodeURIComponent(termo)}`
            : '/api/tutores';

        const resposta = await fetch(url);

        if (resposta.status === 401) {
            window.location.href = '/login.html';
            return;
        }

        if (!resposta.ok) {
            throw new Error('Erro ao buscar tutores.');
        }

        const tutores = await resposta.json();
        renderizarTutores(tutores); // a mesma função que desenha a lista completa

    } catch (erro) {
        console.error(erro);
        alert('Erro ao buscar tutores.');
    }
}


// ------------------------------------------------------------
// 3) GET com id na URL - buscar um item só
// ------------------------------------------------------------
async function buscarTutorPorId(id) {
    try {
        const resposta = await fetch(`/api/tutores/${id}`);

        if (resposta.status === 401) {
            window.location.href = '/login.html';
            return;
        }

        const tutor = await resposta.json(); // aqui é UM objeto, não um array

        if (!resposta.ok) {
            alert(tutor.erro); // o back-end devolve { erro: '...' }
            return;
        }

        console.log(tutor.nome);

    } catch (erro) {
        console.error(erro);
        alert('Erro ao buscar o tutor.');
    }
}


// ------------------------------------------------------------
// 4) POST - cadastrar (enviando JSON)
// ------------------------------------------------------------
async function cadastrarTutor() {
    // 1º: montar o objeto com o que está nos campos do formulário.
    // .trim() tira espaços sobrando; "|| null" manda null se estiver vazio.
    const tutor = {
        nome: document.getElementById('tutor-nome').value.trim(),
        cpf: document.getElementById('tutor-cpf').value.trim() || null,
        telefone: document.getElementById('tutor-telefone').value.trim() 
    };

    try {
        // 2º: enviar. Repare nos 3 itens obrigatórios.
        const resposta = await fetch('/api/tutores', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tutor)
        });

        if (resposta.status === 401) {
            window.location.href = '/login.html';
            return;
        }

        // 3º: ler a resposta (o back-end devolve o registro criado
        // ou { erro: '...' })
        const dados = await resposta.json();

        if (!resposta.ok) {
            alert(dados.erro || 'Erro ao cadastrar.');
            return;
        }

        alert(`"${dados.titulo}" cadastrado com sucesso!`);
        document.getElementById('form-tutor').reset(); // limpa o formulário
        await listarTutores();                           // atualiza a lista na tela

    } catch (erro) {
        console.error(erro);
        alert('Erro ao cadastrar tutor.');
    }
}


// ------------------------------------------------------------
// 5) PUT - atualizar (igual ao POST, mas com id na URL)
// ------------------------------------------------------------
// O id costuma ficar guardado num <input type="hidden"> do
// formulário, preenchido quando o usuário clica em "Editar".
async function atualizarTutor() {
    const id = document.getElementById('tutor-id').value;

    const livro = {
        nome: document.getElementById('tutor-nome').value.trim(),
        cpf: document.getElementById('tutor-cpf').value.trim() || null,
        telefone: document.getElementById('tutor-telefone').value
    };

    try {
        const resposta = await fetch(`/api/livros/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(livro)
        });

        if (resposta.status === 401) {
            window.location.href = '/login.html';
            return;
        }

        const dados = await resposta.json();

        if (!resposta.ok) {
            alert(dados.erro || 'Erro ao atualizar.');
            return;
        }

        alert('Livro atualizado com sucesso!');
        await listarTutores();

    } catch (erro) {
        console.error(erro);
        alert('Erro ao atualizar tutor.');
    }
}


// ------------------------------------------------------------
// 6) DELETE - excluir (não envia body, só o id na URL)
// ------------------------------------------------------------
async function excluirTutores(id) {
    if (!confirm('Deseja realmente excluir este tutor?')) return;

    try {
        const resposta = await fetch(`/api/tutores/${id}`, { method: 'DELETE' });

        if (resposta.status === 401) {
            window.location.href = '/login.html';
            return;
        }

        if (!resposta.ok) {
            const dados = await resposta.json();
            alert(dados.erro || 'Erro ao excluir.');
            return;
        }

        await listarTutores(); // recarrega a lista, agora sem o item excluído

    } catch (erro) {
        console.error(erro);
        alert('Erro ao excluir tutor.');
    }
}


// ------------------------------------------------------------
// MOLDE PARA COPIAR E ADAPTAR
// ------------------------------------------------------------
// async function fazerAlgo() {
//     try {
//         const resposta = await fetch(URL, { method, headers, body });   // method/headers/body só em POST e PUT
//
//         if (resposta.status === 401) {                                  // sessão expirada
//             window.location.href = '/login.html';
//             return;
//         }
//
//         const dados = await resposta.json();
//
//         if (!resposta.ok) {                                             // o servidor respondeu com erro
//             alert(dados.erro);
//             return;
//         }
//
//         // deu certo: usar "dados" e atualizar a tela
//
//     } catch (erro) {                                                    // a rede falhou
//         console.error(erro);
//         alert('Erro de comunicação com o servidor.');
//     }
// }
