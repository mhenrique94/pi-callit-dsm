let logado = false
let questoes = []
let questaoAtual = 0
let numQuestoesSimulado = 10
let continuarTimer = true

salvarInformacao("respostasQuestoes", {})

function embaralhar(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));[array[i], array[j]] = [array[j], array[i]]
  }
}

function pararTimer() {
  continuarTimer = false
}

function startTimer(duration, display) {
  let timer = duration, minutes, seconds
  const interval = setInterval(() => {
    minutes = Math.floor(timer / 60)
    seconds = timer % 60
    seconds = seconds < 10 ? '0' + seconds : seconds

    display.textContent = `${minutes}:${seconds}`

    if (--timer < 0) {
      clearInterval(interval)
      calcularNota()
    }

    if (!continuarTimer) {
      clearInterval(interval)
      return
    }

  }, 1000)

}

function processarLogado() {
  const banner = document.querySelector("#botao-cadastro-banner")
  if (banner) {
    banner.style.display = "none"
  }

  const barraBotoes = document.querySelector(".ms-buttons")
  if (barraBotoes) {
    barraBotoes.style.display = "none"
  }

  const preFooter = document.querySelector("#pre-footer")
  if (preFooter) {
    preFooter.style.display = "none"
  }

  const atalhoAreaEstudante = document.getElementById("atalho-area-estudante")
  if (atalhoAreaEstudante) {
    atalhoAreaEstudante.style.display = "list-item"
  }

}

// Inicializa a primeira questão ao carregar a página
document.addEventListener('DOMContentLoaded', async (event) => {
  if (isLoggedIn()) {
    processarLogado()
    carregarDadosEstudante()
    criarLinhaDoTempoNotas()
    exibirPerformance()
  }

  await carregarQuestoes()
  carregarQuestao()
  const thirtyMinutes = 30 * 60
  const display = document.getElementById('timer')
  if (display)
    startTimer(thirtyMinutes, display)
})

// Função Genérica de Recuperação de Informação
function recuperarInformacao(chave) {
  return JSON.parse(localStorage.getItem(chave))
}

// Função Genérica de Salvamento de Informação
function salvarInformacao(chave, valor) {
  localStorage.setItem(chave, JSON.stringify(valor))
}

function setLogado() {
  salvarInformacao("logado", true)
}

// Função de Login
function entrar() {
  const email = document.getElementById('email').value
  const senha = document.getElementById('senha').value
  const dadosUsuario = recuperarInformacao("userData")
  if (dadosUsuario?.email !== email) {
    alert("Errou email cadastrado!: ", dadosUsuario.email)
    return
  }

  if (dadosUsuario?.password !== senha) {
    alert("Errou a senha!!", dadosUsuario.password)
    return
  }
  logado = true

  setLogado()
  window.location.href = '/'
}

function cadastro(fullName, email, password) {
  let userData = {
    fullName: fullName,
    email: email,
    password: password
  }
  // Salvando os dados no localStorage
  salvarInformacao("userData", userData)
  logado = true
}

function cadastrar() {
  // Preencher os campos do formulário com os dados recuperados
  const nome = document.getElementById('nome').value
  const email = document.getElementById('email').value
  const senha = document.getElementById('senha').value
  const confSenha = document.getElementById('conf_senha').value

  if (senha !== confSenha) {
    alert("As senhas não são iguais.")
    return
  }
  // Chamar a função cadastrar com os dados recuperados
  cadastro(nome, email, senha)
  window.location.href = '/'
}


// Função de Verificação se Está Logado
function isLoggedIn() {
  // Verificando se os dados do usuário estão no localStorage
  const dadosUsuario = recuperarInformacao("userData")
  let fullName = dadosUsuario?.fullName
  if (fullName) {
    return true
  }
  return false
}



async function carregarQuestoes() {
  try {
    const response = await fetch("./assets/questoes.json")
    if (!response.ok) {
      throw new Error("Erro ao carregar questões")
    }
    questoes = await response.json()
  } catch (error) {
    console.error("Erro:", error)
  }
}

function carregarQuestao() {
  const questao = questoes.questoes[questaoAtual]
  const enunciado = document.getElementById("enunciado")
  if (enunciado) {
    enunciado.innerText = `Questão ${questaoAtual + 1} - ${questao.enunciado}`
    const opcoes = document.querySelector(".opcoes")
    opcoes.innerHTML = ""
    for (const [key, value] of Object.entries(questao.opcoes)) {
      const li = document.createElement("li")
      li.innerHTML = `<label><input type="radio" name="resposta" value="${key}"> ${value}</label>`
      opcoes.appendChild(li)
    }
  }
}

function desabilitarBotaoResponder () {
  const botao = document.querySelector('#btn-responder')
  botao.style.display = 'none'
}

function habilitarBotaoResponder() {
  const botao = document.querySelector('#btn-responder')
  botao.style.display = 'block'
}

function verificarResposta() {
  const opcoes = document.getElementsByName("resposta")
  let respostaSelecionada
  for (const opcao of opcoes) {
    if (opcao.checked) {
      respostaSelecionada = opcao.value
      break
    }
  }
  if (!respostaSelecionada) {
    alert("Por favor, selecione uma resposta!")
    return
  }
  const questao = questoes.questoes[questaoAtual]
  // Recuperar as respostas salvas no localStorage
  let respostasQuestoes = recuperarInformacao("respostasQuestoes")
  let historicoQuestoes = recuperarInformacao("historicoQuestoes") || {}
  // Atualizar ou adicionar a resposta atual

  const respostaDada = respostaSelecionada === questao.resposta_correta ? 1 : 0
  respostasQuestoes[questaoAtual] = respostaDada
  historicoQuestoes[questaoAtual] = respostaDada
  salvarInformacao("respostasQuestoes", respostasQuestoes)
  salvarInformacao("historicoQuestoes", historicoQuestoes)
  desabilitarBotaoResponder()
}

function proximaQuestao() {
  if (questaoAtual < numQuestoesSimulado - 1) {
    ++questaoAtual
    carregarQuestao()
    habilitarBotaoResponder()
  } else {
    calcularNota()
  }
}

function prepararResultados() {
  document.getElementById("quiz-form").style.display = 'none'
  document.getElementById("btn-minha-area").style.display = 'flex'
}

function calcularNota() {
  let nota = 0
  desabilitarBotaoResponder()
  prepararResultados()
  pararTimer()

  const respostasQuestoes = recuperarInformacao("respostasQuestoes")
  const resultadoDetalhado = document.getElementById("resultado-detalhado")
  const tituloResultado = document.createElement("h3")
  const divisoria = document.createElement("hr")
  tituloResultado.innerText = "Resultado detalhado"
  tituloResultado.className = "my-2"
  resultadoDetalhado.appendChild(tituloResultado)
  resultadoDetalhado.appendChild(divisoria)
  for (const chaveQuestao in respostasQuestoes) {
    const respostaUsuario = respostasQuestoes[chaveQuestao]
    const questao = questoes.questoes[chaveQuestao]
    const respostaCorreta = questao.resposta_correta
    if (respostaUsuario !== undefined) {
      nota += respostaUsuario
    }
    const questaoContainer = document.createElement("div")
    const tituloContainer = document.createElement("div")
    tituloContainer.className = "d-inline-flex gap-2"
    questaoContainer.className = "questao-container"
    const questaoTitulo = document.createElement("h4")
    questaoTitulo.innerText = `Questão ${Number(chaveQuestao) + 1}: ${questao.enunciado}`
    questaoTitulo.className = "mt-2"
    tituloContainer.appendChild(questaoTitulo)
    questaoContainer.appendChild(tituloContainer)
    if (respostaUsuario) {
      const icon = document.createElement("i")
      icon.className = "fa-solid fa-check text-success"
      tituloContainer.appendChild(icon)
    }
    const respostaCorretaParagrafo = document.createElement("p")
    respostaCorretaParagrafo.innerText = `Resposta Correta: ${questao.opcoes[respostaCorreta]}`

    questaoContainer.appendChild(respostaCorretaParagrafo)
    const respostaUsuarioParagrafo = document.createElement("p")
    respostaUsuarioParagrafo.innerText = `Sua Resposta: ${questao.opcoes[Object.keys(questao.opcoes)[respostaUsuario === 1 ? Object.values(questao.opcoes).indexOf(questao.opcoes[respostaCorreta]) : respostaUsuario] || respostaUsuario]}`
    respostaUsuarioParagrafo.className =
      respostaUsuario ? "resposta-correta" : "resposta-errada"
    questaoContainer.appendChild(respostaUsuarioParagrafo)
    resultadoDetalhado.appendChild(questaoContainer)
  }
  const notasAnteriores = recuperarInformacao("notasAnteriores") || []
  const agora = new Date()
  notasAnteriores.push({ data: agora, nota })
  salvarInformacao("notasAnteriores", notasAnteriores)
  document.getElementById("resultado-valor").innerText =
    `${nota}/${Object.entries(respostasQuestoes).length}`
  document.querySelector(".resultado").style.display = "block"
}

function carregarDadosEstudante() {
  const dadosContainer = document.getElementById("dados-estudante")
  if (!dadosContainer) return

  const dadosUsuario = recuperarInformacao("userData")

  let fullName = dadosUsuario?.fullName
  const nomeContainer = document.createElement("h3")
  nomeContainer.className = "mt-4 mb-0 fw-bold"
  nomeContainer.innerText = fullName

  let email = dadosUsuario?.email
  const emailContainer = document.createElement("span")
  emailContainer.className = "email-usuario"
  emailContainer.innerText = email

  dadosContainer.appendChild(nomeContainer)
  dadosContainer.appendChild(emailContainer)
}

function criarLinhaDoTempoNotas() {
  const notasAnteriores = recuperarInformacao("notasAnteriores")
  const linhaDoTempoContainer = document.getElementsByClassName("linha-do-tempo")[0]

  if (!linhaDoTempoContainer) return

  if (!notasAnteriores) {
    const dataTitulo = document.createElement("h4")
    dataTitulo.innerText = "Você ainda não possui notas registradas."
    linhaDoTempoContainer.appendChild(dataTitulo)
    return
  }

  // Agrupa as notas por data
  const notasPorData = notasAnteriores.reduce((acc, item) => {
    const dataCompleta = new Date(item.data)
    const data = dataCompleta.toLocaleDateString()
    const horario = dataCompleta.toLocaleTimeString()

    if (!acc[data]) {
      acc[data] = []
    }
    acc[data].push({ nota: item.nota, horario })
    return acc
  }, {})

  // Limpa o conteúdo anterior
  linhaDoTempoContainer.innerHTML = ""

  // Adiciona as notas agrupadas por data ao container
  for (const [data, notas] of Object.entries(notasPorData)) {
    const dataContainer = document.createElement("div")
    dataContainer.className = "data-container mb-3"
    const dataTitulo = document.createElement("h3")
    dataTitulo.innerText = data
    dataContainer.appendChild(dataTitulo)

    notas.forEach((item, index) => {
      const notaParagrafo = document.createElement("p")
      notaParagrafo.innerText = `Nota ${index + 1}: ${item.nota.toFixed(2)} - ${item.horario}`
      // Estiliza as notas com uma barra de progresso
      const notaBarraContainer = document.createElement("div")
      notaBarraContainer.className = "nota-barra-container"
      const notaBarra = document.createElement("div")
      notaBarra.className = "nota-barra"
      notaBarra.style.width = `${item.nota * 10}%`
      notaBarra.style.backgroundColor = `hsl(${(1 - item.nota) * 120}, 100%, 50%)`
      notaBarraContainer.appendChild(notaBarra)
      dataContainer.appendChild(notaParagrafo)
      dataContainer.appendChild(notaBarraContainer)
    })

    linhaDoTempoContainer.appendChild(dataContainer)
  }
}


async function calcularPerformance() {
  await carregarQuestoes()
  let historicoQuestoes = recuperarInformacao("historicoQuestoes")
  if (!historicoQuestoes) return

  const desempenhoPorEixo = questoes.questoes.reduce((acc, questao, index) => {
    const acertou = historicoQuestoes[index]
    const { eixo_tecnologico } = questao
    if (acertou !== undefined) {
      acc[eixo_tecnologico] = acc[eixo_tecnologico] || {
        total: 0,
        corretas: 0,
      };
      acc[eixo_tecnologico].total++
      if (acertou) {
        acc[eixo_tecnologico].corretas++
      }
    }
    return acc
  }, {})
  const performanceFinal = {}
  Object.keys(desempenhoPorEixo).forEach((eixo) => {
    const { total, corretas } = desempenhoPorEixo[eixo]
    performanceFinal[eixo] = (corretas / total) * 10.0
  });
  return performanceFinal
}

async function exibirPerformance() {
  const performance = await calcularPerformance()
  const performanceResult = document.getElementById("performance-result")

  if (!performanceResult) {
    return
  }

  if (!performance) {
    performanceResult.innerText = "Você ainda não possui notas registradas."
    return
  }

  Object.keys(performance).forEach((eixo) => {
    const itemDiv = document.createElement("div")
    itemDiv.className = "performance-item"

    const itemTitulo = document.createElement("h3")
    itemTitulo.innerText = eixo
    itemDiv.appendChild(itemTitulo)

    const itemValor = document.createElement("h5")
    itemValor.className = "fw-bold"
    itemValor.innerText = performance[eixo].toFixed(2)
    itemDiv.appendChild(itemValor)
    performanceResult.appendChild(itemDiv)
  })
}