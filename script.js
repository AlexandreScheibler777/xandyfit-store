'use strict';

// XandyFit Store - Trabalho de Desenvolvimento Web
// Dados fictícios: este projeto não realiza cobranças ou pedidos reais.

const produtos = [
  { id: 1, nome: 'Halter Emborrachado 5 kg', categoria: 'Força', preco: 89.90, descricao: 'Pegada firme para evoluir no treino de força.', imagem: 'assets/halter.svg', selo: 'MAIS VENDIDO' },
  { id: 2, nome: 'Corda de Pular Speed', categoria: 'Acessórios', preco: 39.90, descricao: 'Leve e ajustável para treinos de condicionamento.', imagem: 'assets/corda.svg', selo: 'ESSENCIAL' },
  { id: 3, nome: 'Kit Faixas Elásticas', categoria: 'Força', preco: 64.90, descricao: 'Três resistências para variar seus exercícios.', imagem: 'assets/faixas.svg', selo: 'VERSÁTIL' },
  { id: 4, nome: 'Garrafa Térmica 750 ml', categoria: 'Acessórios', preco: 59.90, descricao: 'Hidratação sempre por perto durante o treino.', imagem: 'assets/garrafa.svg', selo: 'PRÁTICO' },
  { id: 5, nome: 'Rolo de Liberação', categoria: 'Recuperação', preco: 79.90, descricao: 'Um aliado para a rotina de mobilidade.', imagem: 'assets/rolo.svg', selo: 'RECUPERAÇÃO' },
  { id: 6, nome: 'Tapete de Exercícios', categoria: 'Recuperação', preco: 109.90, descricao: 'Superfície confortável para exercícios no solo.', imagem: 'assets/tapete.svg', selo: 'CONFORTO' }
];

const VALOR_FRETE = 14.90;
const FRETE_GRATIS_A_PARTIR = 200;
const CUPOM = 'XANDY10';
const TAXA_DESCONTO = 0.10;

// Array de objetos: cada item guarda o ID do produto e sua quantidade.
let carrinho = [];
let cupomAtivo = false;
let categoriaSelecionada = 'Todos';
let tempoAviso;
let focoAnterior = null;

const $ = (seletor) => document.querySelector(seletor);
const formatarMoeda = (valor) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function exibirProdutos() {
  const termo = $('#pesquisa').value.trim().toLocaleLowerCase('pt-BR');
  // Estrutura de repetição + condição lógica para pesquisa e categorias.
  const encontrados = produtos.filter((produto) =>
    (categoriaSelecionada === 'Todos' || produto.categoria === categoriaSelecionada) &&
    produto.nome.toLocaleLowerCase('pt-BR').includes(termo)
  );

  // DOM: cards são gerados com os dados de um array e inseridos na página.
  $('#lista-produtos').innerHTML = encontrados.map((produto) => `
    <article class="product-card">
      <div class="product-image">
        <span class="product-tag">${produto.selo}</span>
        <img src="${produto.imagem}" alt="Ilustração de ${produto.nome}" width="320" height="220" loading="lazy">
      </div>
      <div class="product-body">
        <span class="product-category">${produto.categoria}</span>
        <h3>${produto.nome}</h3>
        <p>${produto.descricao}</p>
        <div class="product-bottom">
          <strong class="product-price">${formatarMoeda(produto.preco)}</strong>
          <button class="add-btn" type="button" data-add="${produto.id}" aria-label="Adicionar ${produto.nome} ao carrinho">+ Adicionar</button>
        </div>
      </div>
    </article>
  `).join('');
  $('#sem-resultados').hidden = encontrados.length !== 0;
}

function adicionarAoCarrinho(id) {
  const produto = produtos.find((item) => item.id === id);
  if (!produto) return;
  const existente = carrinho.find((item) => item.id === id);
  if (existente) {
    existente.quantidade += 1;
  } else {
    carrinho.push({ id, quantidade: 1 });
  }
  atualizarCarrinho();
  mostrarAviso(`${produto.nome} adicionado ao carrinho!`);
}

function alterarQuantidade(id, variacao) {
  const item = carrinho.find((produto) => produto.id === id);
  if (!item) return;
  item.quantidade += variacao;
  if (item.quantidade <= 0) {
    carrinho = carrinho.filter((produto) => produto.id !== id);
  }
  atualizarCarrinho();
}

function removerProduto(id) {
  carrinho = carrinho.filter((produto) => produto.id !== id);
  atualizarCarrinho();
  mostrarAviso('Produto removido do carrinho.');
}

function calcularTotais() {
  // Operações matemáticas: somar preços, aplicar desconto e acrescentar frete.
  const subtotal = carrinho.reduce((soma, item) => {
    const produto = produtos.find((p) => p.id === item.id);
    return soma + produto.preco * item.quantidade;
  }, 0);
  const desconto = cupomAtivo ? subtotal * TAXA_DESCONTO : 0;
  const frete = subtotal === 0 || subtotal >= FRETE_GRATIS_A_PARTIR ? 0 : VALOR_FRETE;
  const total = Math.max(0, subtotal - desconto + frete);
  return { subtotal, desconto, frete, total };
}

function atualizarCarrinho() {
  const quantidadeTotal = carrinho.reduce((soma, item) => soma + item.quantidade, 0);
  $('#contador-carrinho').textContent = quantidadeTotal;
  $('#contador-painel').textContent = `(${quantidadeTotal})`;
  $('#abrir-carrinho').setAttribute('aria-label', `Abrir carrinho de compras, ${quantidadeTotal} itens`);
  $('#finalizar-compra').disabled = quantidadeTotal === 0;

  if (carrinho.length === 0) {
    $('#itens-carrinho').innerHTML = '<div class="cart-empty"><span aria-hidden="true">🛍️</span><strong>Seu carrinho está vazio.</strong><p>Adicione um produto para começar.</p></div>';
  } else {
    $('#itens-carrinho').innerHTML = carrinho.map((item) => {
      const produto = produtos.find((p) => p.id === item.id);
      return `<div class="cart-line">
        <img src="${produto.imagem}" alt="" width="78" height="82">
        <div><strong>${produto.nome}</strong><small>${formatarMoeda(produto.preco)}</small>
          <div class="cart-line-footer"><div class="quantity">
            <button type="button" data-qty="-1" data-id="${produto.id}" aria-label="Diminuir quantidade de ${produto.nome}">−</button>
            <span>${item.quantidade}</span>
            <button type="button" data-qty="1" data-id="${produto.id}" aria-label="Aumentar quantidade de ${produto.nome}">+</button>
          </div><strong>${formatarMoeda(produto.preco * item.quantidade)}</strong></div>
          <button class="remove-btn" type="button" data-remove="${produto.id}">Remover</button>
        </div></div>`;
    }).join('');
  }
  const { subtotal, desconto, frete, total } = calcularTotais();
  $('#valor-subtotal').textContent = formatarMoeda(subtotal);
  $('#valor-desconto').textContent = `− ${formatarMoeda(desconto)}`;
  $('#valor-frete').textContent = subtotal === 0 ? formatarMoeda(0) : frete === 0 ? 'Grátis' : formatarMoeda(frete);
  $('#valor-total').textContent = formatarMoeda(total);
}

function mostrarMensagem(elemento, texto, erro = false) {
  elemento.textContent = texto;
  elemento.classList.toggle('error', erro);
}

function mostrarAviso(texto) {
  $('#aviso').textContent = texto;
  $('#aviso').classList.add('is-visible');
  clearTimeout(tempoAviso);
  tempoAviso = setTimeout(() => $('#aviso').classList.remove('is-visible'), 2700);
}

function abrirCarrinho() {
  focoAnterior = document.activeElement;
  $('#overlay').hidden = false;
  $('#painel-carrinho').classList.add('is-open');
  $('#painel-carrinho').setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  $('#fechar-carrinho').focus();
}

function fecharCarrinho() {
  $('#overlay').hidden = true;
  $('#painel-carrinho').classList.remove('is-open');
  $('#painel-carrinho').setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  if (focoAnterior && typeof focoAnterior.focus === 'function') focoAnterior.focus();
}

function abrirFinalizacao() {
  if (carrinho.length === 0) return;
  fecharCarrinho();
  focoAnterior = $('#abrir-carrinho');
  $('#modal-compra').hidden = false;
  document.body.style.overflow = 'hidden';
  $('#nome-cliente').focus();
}

function fecharFinalizacao() {
  $('#modal-compra').hidden = true;
  document.body.style.overflow = '';
  $('#abrir-carrinho').focus();
}

function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Eventos de clique e de envio de formulários.
$('#lista-produtos').addEventListener('click', (evento) => {
  const botao = evento.target.closest('[data-add]');
  if (botao) adicionarAoCarrinho(Number(botao.dataset.add));
});

$('#itens-carrinho').addEventListener('click', (evento) => {
  const ajuste = evento.target.closest('[data-qty]');
  const remover = evento.target.closest('[data-remove]');
  if (ajuste) alterarQuantidade(Number(ajuste.dataset.id), Number(ajuste.dataset.qty));
  if (remover) removerProduto(Number(remover.dataset.remove));
});

document.querySelectorAll('[data-category]').forEach((botao) => {
  botao.addEventListener('click', () => {
    categoriaSelecionada = botao.dataset.category;
    document.querySelectorAll('[data-category]').forEach((outro) => {
      const ativo = outro === botao;
      outro.classList.toggle('is-active', ativo);
      outro.setAttribute('aria-pressed', String(ativo));
    });
    exibirProdutos();
  });
});

$('#pesquisa').addEventListener('input', exibirProdutos);
$('#abrir-carrinho').addEventListener('click', abrirCarrinho);
$('#fechar-carrinho').addEventListener('click', fecharCarrinho);
$('#overlay').addEventListener('click', fecharCarrinho);
$('#finalizar-compra').addEventListener('click', abrirFinalizacao);
$('#fechar-modal').addEventListener('click', fecharFinalizacao);
$('#modal-compra').addEventListener('click', (evento) => {
  if (evento.target === $('#modal-compra')) fecharFinalizacao();
});

document.addEventListener('keydown', (evento) => {
  if (evento.key === 'Escape') {
    if (!$('#modal-compra').hidden) fecharFinalizacao();
    else if ($('#painel-carrinho').classList.contains('is-open')) fecharCarrinho();
  }
});

$('#form-cupom').addEventListener('submit', (evento) => {
  evento.preventDefault();
  const digitado = $('#campo-cupom').value.trim().toUpperCase();
  if (digitado === CUPOM) {
    cupomAtivo = true;
    mostrarMensagem($('#mensagem-cupom'), 'Cupom aplicado! 10% de desconto nos produtos.');
  } else {
    // Um cupom inválido não deve cancelar um cupom válido aplicado anteriormente.
    mostrarMensagem($('#mensagem-cupom'), 'Cupom inválido. Experimente XANDY10.', true);
  }
  atualizarCarrinho();
});

$('#form-novidades').addEventListener('submit', (evento) => {
  evento.preventDefault();
  const email = $('#email-novidades').value.trim();
  if (!emailValido(email)) {
    mostrarMensagem($('#mensagem-novidades'), 'Digite um e-mail válido.', true);
    return;
  }
  mostrarMensagem($('#mensagem-novidades'), 'Cadastro demonstrativo concluído! Nenhum e-mail foi enviado.');
  $('#form-novidades').reset();
});

$('#form-compra').addEventListener('submit', (evento) => {
  evento.preventDefault();
  const nome = $('#nome-cliente').value.trim();
  const email = $('#email-cliente').value.trim();
  if (nome.length < 3 || !nome.includes(' ')) {
    mostrarMensagem($('#erro-compra'), 'Informe seu nome e sobrenome.', true);
    return;
  }
  if (!emailValido(email)) {
    mostrarMensagem($('#erro-compra'), 'Informe um e-mail válido.', true);
    return;
  }
  const { total } = calcularTotais();
  const quantidade = carrinho.reduce((soma, item) => soma + item.quantidade, 0);
  $('#conteudo-finalizacao').innerHTML = `<div class="confirmation"><span class="success-symbol" aria-hidden="true">✓</span>
    <h2 id="titulo-finalizacao">Simulação concluída!</h2>
    <p>Obrigado, <strong id="nome-confirmacao"></strong>! Você simulou a compra de <strong>${quantidade}</strong> item(ns), no total de <strong>${formatarMoeda(total)}</strong>.</p>
    <p><strong>Nenhum pagamento foi processado e nenhum pedido real foi criado.</strong></p>
    <button id="reiniciar-compra" type="button" class="btn btn-primary checkout-btn">Fazer outra simulação</button></div>`;
  // textContent evita interpretar o nome digitado como HTML.
  $('#nome-confirmacao').textContent = nome;
  carrinho = [];
  cupomAtivo = false;
  $('#campo-cupom').value = '';
  mostrarMensagem($('#mensagem-cupom'), '');
  atualizarCarrinho();
  $('#reiniciar-compra').addEventListener('click', () => window.location.reload());
});

$('#ano-atual').textContent = String(new Date().getFullYear());
exibirProdutos();
atualizarCarrinho();
