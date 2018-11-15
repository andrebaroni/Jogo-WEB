//variaves do jogo
var canvas, ctx, altura = 700, largura = 1400, frames = 0, tecla = 0, limPulos = 3, velocidade = 7, estadoAtual, recorde, img, musicaFundo = new Audio('musicadurante.mp3'), musicaPerdeu = new Audio('quandomorre.mp3'), musicaComeco = new Audio ('oldspice.mp3'), bloqueia = new Audio('bloqueia.mp3'), bloqueia2 = new Audio('bloqueia2.mp3'),

    //estados do jogo: tela antes de jogar, tela enquanto o jogo roda, tela quando perdeu
    estados = {
        jogar: 0,
        jogando: 1,
        perdeu: 2,
    },

//fazer e desenhar o chão
chao = {
    x: 0,
    y: 600,
    largura: 1400,
    altura: 100,
    cor: "#363636",

    desenhar: function() {
        ctx.fillStyle = this.cor;
        ctx.fillRect(this.x, this.y, this.largura, this.altura);
    }
};



// toda a criação e "fisica" do personagem
personagem = {
    x: 100,
    y: 150,
    largura: 48,
    altura: 70,
    //cor: "#8c110c",
    gravidade: 1.4,
    velocidade: 0,
    pulo: 23,
    abaixa: -50,
    pontos: 0,
    txtPontos: "Pontos",
    txtPontosPerdeu: "Sua pontuação foi:",
    moedas: 0,
    txtMoedas: "Centavos",
    txtMoedasPerdeu: "Esse jogo me custou",
    txtRecorde: "O recorde até agora é de:",
    quantidadePulos: 0,
    //quantAbaixamentos: 0,

//função que atualiza o personagem
    atualiza: function () {
        this.velocidade = this.velocidade + this.gravidade;
        this.y = this.y + this.velocidade;

        if (personagem.y > 530 && estadoAtual != estados.perdeu) {
            personagem.y = 530;
            this.quantidadePulos = 0;
            this.velocidade = 0;
        }
    },

    pular: function () {
        if (this.quantidadePulos < limPulos) {
            personagem.velocidade = -this.pulo;
            this.quantidadePulos++;
        }

    },
    //volta os atributos do personagem
    reset: function () {
        //velocidade do personagem zera
        personagem.velocidade = 0;
        //personagem volta no ponto inicial quando perde
        personagem.y = -100;
        //zera as moedas quando perde
        personagem.moedas = 0;

        if (personagem.pontos > recorde){
            localStorage.setItem("recorde", this.pontos);
            recorde = this.pontos;
        }
        //pontuação zera quando perde
        personagem.pontos = 0;
        
    },
    //faz personagem "pular" para baixo
    abaixar: function () {
        personagem.velocidade = -this.abaixa;
        //faz voce perder moedas quando "pula" para baixo
        personagem.moedas--;
    },

    //desenha o personagem
    desenhar: function() {
        personagemJulius.desenhar(this.x, this.y)
    }

};

//criação e colisão das moedas(centavos)
moedas = {
    _moedas: [],
    cor: "#2dff00",
    sons: [bloqueia, bloqueia2],
    tempInserir: 0,

    //insere as moedas
    inserir: function () {
        this._moedas.push({
            x: largura,
            y: 400,
            largura: 15,
            altura: 35,
            cor: this.cor,
        });
        this.tempInserir = 5 + Math.floor(50 * Math.random());

    },

    //atualiza as moedas
    atualiza: function () {

        if (this.tempInserir == 0)
            this.inserir();
        else
            this.tempInserir--;

        for (var i = 0, tam = this._moedas.length; i < tam; i++){
            var mds = this._moedas[i];

            mds.x -= velocidade;

            //colisão
            if (personagem.x + personagem.largura + 10 > mds.x && personagem.x < mds.x + mds.largura + 10 && personagem.y + personagem.altura + 40 > mds.y && personagem.y > 400 && personagem.y < 430){
                personagem.moedas++;
                this.sons.push()
                    som = this.sons[Math.floor(2 * Math.random())]
                som.play();
                this._moedas.splice(i, 1);
                tam--;
                i--;
            }
        }

    },

    apaga: function () {
        this._moedas = [];

    },

    desenhar: function () {
        for (var i = 0, tam = this._moedas.length; i < tam; i++){
            var mds = this._moedas[i];
            ctx.fillStyle = this.cor;
            ctx.fillRect(mds.x, mds.y, mds.largura, mds.altura);

        }
    }

};

//criação dos obstaculos e colisão
obstaculos = {
    _obs: [],
    cores: ["#c20010", "#77001e", "#ff6900", "#72bd66","#230", "#4b2500"],
    //texturaObs: obsSpice,
    tempInserir: 0,

    //insere os obstaculos
    inserir: function () {
        this._obs.push({
            x: largura,
            //y: chao.y - 208,
            largura: 55,
            altura: 40 + Math.floor(120 * Math.random()),
            cor: this.cores[Math.floor(6 * Math.random())],
        });
        this.tempInserir = 40 + Math.floor(20 * Math.random());

    },


//função que atualiza os obstaculos
    atualiza: function () {
        if (this.tempInserir == 0)
            this.inserir();
        else
            this.tempInserir--;

        for (var i = 0, tam = this._obs.length; i < tam; i++){
            var obs = this._obs[i];

            obs.x -= velocidade;

            //colisão
            if (personagem.x < obs.x + obs.largura && personagem.x + personagem.largura >= obs.x && personagem.y + personagem.altura >= chao.y - obs.altura) {
                estadoAtual = estados.perdeu;
                musicaPerdeu.play();
            }

            else if (obs.x == 0)
                personagem.pontos++;


            else if (obs.x <= -obs.largura){
                this._obs.splice(i, 1);
                tam--;
                i--;
            }
        }

    },
    
    apaga: function () {
        this._obs = [];
        
    },


    desenhar: function () {
        for (var i = 0, tam = this._obs.length; i < tam; i++){
            var obs = this._obs[i];

            ctx.fillStyle = obs.cor;
            ctx.fillRect(obs.x, chao.y - obs.altura, obs.largura, obs.altura);
        }
    }


};

//função principal
function main() {

    canvas = document.createElement("Canvas");
    canvas.width = largura;
    canvas.height = altura;
    canvas.style.border = "5px solid #000";

    ctx = canvas.getContext("2d");
    document.body.appendChild(canvas);

    //movimentação do personagem
    document.addEventListener("keydown", function(evento) {
        tecla = evento.keyCode;
        if (tecla == 32){
            personagem.pular()
        }
        if (tecla == 38) {
            personagem.pular()
            //personagem.y = -1;
        }
        if (tecla == 40) {
            personagem.abaixar()
        }
    }),

        //clique para começar o jogo
    document.addEventListener("mousedown", function (evento) {
        if (estadoAtual == estados.jogar) {
            estadoAtual = estados.jogando;
        }
        else if (estadoAtual == estados.perdeu){
            estadoAtual = estados.jogar;
            obstaculos.apaga();
            personagem.reset();
            moedas.apaga();
        }

    });

    estadoAtual = estados.jogar;

    //grava a pontuação mais alta na memoria
    recorde = localStorage.getItem("recorde");

    //imagem cenario
    img = new Image();
    img.src = "cenario.jpg";

    //imagem personagem
    img1 = new Image();
    img1.src = "bravo.png";

    //imagem final
    img3 = new Image;
    img3.src = "juliusbravo1.png";

    loop();
}

//looping do jogo
function loop() {
    atualiza();
    desenhar();

    window.requestAnimationFrame(loop);
}

//função que atualiza o jogo
function atualiza() {
    frames++;

    personagem.atualiza();
    if (estadoAtual == estados.jogar){
        musicaComeco.play();
        musicaPerdeu.pause();

    }

    if (estadoAtual == estados.jogando) {
        musicaFundo.play();
        musicaFundo.volume = 0.6;
        musicaComeco.pause();
        moedas.atualiza();
        obstaculos.atualiza();

    }
    if (estadoAtual == estados.perdeu) {
        musicaFundo.pause();
    }

}

//desenha tudo na tela
function desenhar() {
    background.desenhar(0, 0);



    if (estadoAtual == estados.jogar) {
        ctx.fillStyle = "#2dff00";
        ctx.fillRect(500, 320, 400, 70);
        ctx.fillText(recorde, 770,250);
        ctx.fillStyle = "#fff";
        ctx.fillText("Jogar!", 640, 370);
        ctx.fillStyle = "#ff000b";
        ctx.fillText("Use as setas para pular ou abaixar o Julius, porém se você", 80, 100);
        ctx.fillText(" abaixar você perde um centavo!", 80, 180);

        //mostrar record
        ctx.fillStyle = "#fff";
        ctx.font = "50px Segoe UI Light";
        ctx.fillText(personagem.txtRecorde, 200, 250)
    }
    else if (estadoAtual == estados.perdeu) {
        juliusperdeu.desenhar(400, 110);
        ctx.fillStyle = "#ff0a00";
        ctx.fillRect(245, 480, 900, 70);
        ctx.fillStyle = "#fff";
        ctx.fillText("Perdeu! Clique para jogar novamente!", 300, 530);

        //textos de pontuação
        ctx.fillStyle = "#fff";
        ctx.font = "50px Segoe UI Light";
        ctx.fillText(personagem.txtPontosPerdeu, 850, 205);
        ctx.fillText(personagem.pontos, 1270, 205);

        //textos de centavos
        ctx.fillStyle = "#fff";
        ctx.font = "50px Segoe UI Light";
        ctx.fillText(personagem.txtMoedasPerdeu, 50, 205);
        ctx.fillText("centavos", 50, 260);
        ctx.fillText(personagem.moedas, 510, 205);


    }
    else if (estadoAtual == estados.jogando) {
        obstaculos.desenhar();
        moedas.desenhar();

        //textos de pontuação
        ctx.fillStyle = "#fff";
        ctx.font = "50px Segoe UI Light";
        ctx.fillText(personagem.txtPontos, 1150, 80);
        ctx.fillText(personagem.pontos, 1210, 140);

        //textos de centavos
        ctx.fillStyle = "#1e9c00";
        ctx.font = "50px Segoe UI Light";
        ctx.fillText(personagem.txtMoedas, 70, 80);
        ctx.fillText(personagem.moedas, 120, 140);
    }

    chao.desenhar();
    personagem.desenhar();

}

//background
function sprite(x, y, largura, altura) {
    this.x = x;
    this.y = y;
    this.largura = largura;
    this.altura = altura;

    this.desenhar = function(xCanvas, yCanvas) {
        ctx.drawImage(img, this.x, this.y, this.largura, this.altura, xCanvas, yCanvas, this.largura, this.altura);
        
    }

}

var background = new sprite(800, 1300, 1400, 700);


//personagem
function sprite1(x, y, largura, altura) {
    this.x = x;
    this.y = y;
    this.largura = largura;
    this.altura = altura;

    this.desenhar = function (xCanvas, yCanvas) {
        ctx.drawImage(img1, this.x, this.y, this.largura, this.altura, xCanvas, yCanvas, this.largura, this.altura);

    }
}

var personagemJulius = new sprite1(0, 0, 48, 70);


//julius perdeu
function sprite3(x, y, largura, altura) {
    this.x = x;
    this.y = y;
    this.largura = largura;
    this.altura = altura;

    this.desenhar = function (xCanvas, yCanvas) {
        ctx.drawImage(img3, this.x, this.y, this.largura, this.altura, xCanvas, yCanvas, this.largura, this.altura);

    }
}

var juliusperdeu = new sprite3(0, 0, 620, 372);



//inicia o jogo
main();