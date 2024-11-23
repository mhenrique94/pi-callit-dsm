let logado = false

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
  }

  await carregarQuestoes()
  carregarQuestao()
  const thirtyMinutes = 30 * 60
  const display = document.getElementById('timer')
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

let questoes = []
let questaoAtual = 0
let numQuestoesSimulado = 10
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
  document.getElementById("enunciado").innerText = questao.enunciado
  const opcoes = document.querySelector(".opcoes")
  opcoes.innerHTML = ""
  for (const [key, value] of Object.entries(questao.opcoes)) {
    const li = document.createElement("li")
    li.innerHTML = `<label><input type="radio" name="resposta" value="${key}"> ${value}</label>`
    opcoes.appendChild(li)
  }
}

function desabilitarBotaoResponder() {
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
  salvarInformacao(
    `resposta_${questaoAtual}`,
    respostaSelecionada === questao.resposta_correta ? 1 : 0,
  )
  desabilitarBotaoResponder()
}
function proximaQuestao() {
  if (questaoAtual < numQuestoesSimulado) {
    questaoAtual++
    carregarQuestao()
    habilitarBotaoResponder()
  } else {
    calcularNota()
  }
}

function sumirComQuestoes() {
  document.getElementById("quiz-form").style.display = 'none'
}

function calcularNota() {
  let nota = 0
  desabilitarBotaoResponder()
  sumirComQuestoes()
  for (let i = 0; i < numQuestoesSimulado; i++) {
    nota += parseInt(recuperarInformacao(`resposta_${i}`), 10)
  }
  document.getElementById("resultado-valor").innerText =
    `${nota}/${numQuestoesSimulado}`

    document.querySelector('.resultado').style.display = "block"
}

