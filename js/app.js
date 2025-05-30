$(document).ready(function () {
    cardapio.eventos.init();
})

var cardapio = {};

var MEU_CARRINHO = [];
var MEU_ENDERECO = null;
var VALOR_CARRINHO = 0;
var VALOR_ENTREGA = 5;
var CELULAR = '';

cardapio.eventos = {

    init: () => {
       cardapio.metodos.obterItensCardapio();
       cardapio.metodos.carregarBotaoLigar();
       cardapio.metodos.ligarHeader();
       cardapio.metodos.carregarBotaoReserva();
    }
}

cardapio.metodos = {
    // obtem a lista de itens do cardápio
    obterItensCardapio: (categoria = 'burgers', vermais = false) => {
        
        var filtro = MENU[categoria];
        console.log(filtro);
        if(!vermais){
            $("#itensCardapio").html('');
            $("#btnVerMais").removeClass('hidden');

        }
       

        $.each(filtro,(i,e) => {
            let temp = cardapio.templates.item.replace(/\${img}/g, e.img)
            .replace(/\${name}/g, e.name)
            .replace(/\${id}/g, e.id)
            .replace(/\${price}/g, e.price.toFixed(2).replace('.',','));
            
            // botao ver mais foi clicado (12 itens)
            if(vermais && i >= 8 && i < 12){
                
                $("#itensCardapio").append(temp)
            }

            //paginaçao inicial (8 itens)
            if(!vermais && i < 8)
                $("#itensCardapio").append(temp)
           
        })

        //remove o active
        $(".container-menu a").removeClass('active');
        //seta o menu para ativo
        $("#menu-"+ categoria).addClass('active');
    },
    //clique no botao ver mais
    verMais: () => {

        var ativo = $(".container-menu a.active").attr('id').split('menu-')[1];
        
        cardapio.metodos.obterItensCardapio(ativo, true);

        $("#btnVerMais").addClass('hidden');
    },
    //diminuir qubatidade do item no cardápio
    diminuirQuantidade: (id) => {
        let quantidadeAtual = parseInt($('#qntd-' + id).text());

        if( quantidadeAtual > 0){
            $('#qntd-' + id).text(quantidadeAtual - 1);
        }
    },
    //aumentar a quantidade do item no cardápio
    aumentarQuantidade: (id) => {
        let quantidadeAtual = parseInt($('#qntd-' + id).text());
        
        $('#qntd-' + id).text(quantidadeAtual + 1);
        
    },
    //adicionar ao carrinho item do cardapio
    adicionarAoCarrinho: (id) => {
        let quantidadeAtual = parseInt($('#qntd-' + id).text());

        if (quantidadeAtual > 0){
            //obter categoria ativa
            var categoria = $(".container-menu a.active").attr('id').split('menu-')[1];
            //obtem a lista de itens
            let filtro = MENU[categoria];
            //obtem o item
            let item = $.grep(filtro, (e, i) => { return e.id == id});
            
            if(item.length > 0){
                // validar se ja existe esse item no carrinho
                let existe = $.grep(MEU_CARRINHO, (elem, index) => {return elem.id == id});
                //caso exista alterar apenas a quantidade
                if(existe.length > 0){
                    let objIndex = MEU_CARRINHO.findIndex((obj => obj.id == id));
                    MEU_CARRINHO[objIndex].qntd = MEU_CARRINHO[objIndex].qntd + quantidadeAtual;
                    
                }       
                // caso nao exista o item add um novo item
                else{
                        
                    item[0].qntd = quantidadeAtual;
                    MEU_CARRINHO.push(item[0])
                }

                cardapio.metodos.mensagem('Item adicionado ao carrinho!', 'green')
                $('#qntd-' + id).text(0)

                cardapio.metodos.atualizarBadgeTotal();
            }
        }
    },
    //atualiza número de compras no carrinho
    atualizarBadgeTotal: () => {
        var total = 0;
        $.each(MEU_CARRINHO, (i, e) => {
            total += e.qntd
        })

        if(total > 0){
            $(".botao-carrinho").removeClass('hidden');
            $(".container-total-carrinho").removeClass('hidden');
        }
        else{
            $(".botao-carrinho").addClass('hidden');
            $(".container-total-carrinho").addClass('hidden');

        }

        $(".badge-total-carrinho").html(total);
    },
    // abrir e fechar modal do carrinho
    abrirCarrinho: (abrir) => { 
        if(abrir){
            
            $("#modalCarrinho").removeClass('hidden');
            cardapio.metodos.carregarCarrinho();
            
        }
        else{
            $("#modalCarrinho").addClass('hidden');

        }
    },
    //altera texto e exibe botões das etapas
    carregarEtapa: (etapa) => {
        if (etapa == 1) {
            $("#lblTituloEtapa").text('Seu carrinho: ');
            $("#itensCarrinho").removeClass('hidden');
            $("#localEntrega").addClass('hidden');
            $("#resumoCarrinho").addClass('hidden');

            $(".etapa").removeClass('active');
            $(".etapa1").addClass('active');


            $("#btnEtapaPedido").removeClass('hidden');
            $("#btnEtapaEndereco").addClass('hidden');
            $("#btnEtapaResumo").addClass('hidden');
            $("#btnVoltar").addClass('hidden');
        }
        if(etapa == 2){

            $("#lblTituloEtapa").text('Endereço de entrega: ');
            $("#itensCarrinho").addClass('hidden');
            $("#localEntrega").removeClass('hidden');
            $("#resumoCarrinho").addClass('hidden');

            $(".etapa").removeClass('active');
            $(".etapa1").addClass('active');
            $(".etapa2").addClass('active');

            $("#btnEtapaPedido").addClass('hidden');
            $("#btnEtapaEndereco").removeClass('hidden');
            $("#btnEtapaResumo").addClass('hidden');
            $("#btnVoltar").removeClass('hidden');

        }
        if(etapa == 3){

            $("#lblTituloEtapa").text('Resumo do pedido: ');
            $("#itensCarrinho").addClass('hidden');
            $("#localEntrega").addClass('hidden');
            $("#resumoCarrinho").removeClass('hidden');

            $(".etapa").removeClass('active');
            $(".etapa1").addClass('active');
            $(".etapa2").addClass('active');
            $(".etapa3").addClass('active');


            $("#btnEtapaPedido").addClass('hidden');
            $("#btnEtapaEndereco").addClass('hidden');
            $("#btnEtapaResumo").removeClass('hidden');
            $("#btnVoltar").removeClass('hidden');

        }
    },
    // botao volta etapa
    voltarEtapa: () => {

        let etapa = $(".etapa.active").length;
        cardapio.metodos.carregarEtapa(etapa -1);

    },
    //carrega lista de itens do carrinho
    carregarCarrinho: () => {
        cardapio.metodos.carregarEtapa(1);

        if(MEU_CARRINHO.length > 0){

            $("#itensCarrinho").html('');

            $.each(MEU_CARRINHO, (i, e) => {
                let temp = cardapio.templates.itemCarrinho.replace(/\${img}/g, e.img)
                .replace(/\${name}/g, e.name)
                .replace(/\${id}/g, e.id)
                .replace(/\${price}/g, e.price.toFixed(2).replace('.',','))
                .replace(/\${qntd}/g, e.qntd)

                $("#itensCarrinho").append(temp);

                if ((i +1) == MEU_CARRINHO.length){
                    cardapio.metodos.carregaValores();
                }
            })

        }
        else{  

            $("#itensCarrinho").html('<p class="carrinho-vazio"><i class="fa fa-shopping-bag"></i> Seu Carrinho está vazio.</p>');
            cardapio.metodos.carregaValores();

        }
    },
    // diminui quantidade de item no carrinho
    diminuirQuantidadeCarrinho: (id) => {

        let quantidadeAtual = parseInt($('#qntd-carrinho-' + id).text());

        if( quantidadeAtual > 1){
            $('#qntd-carrinho-' + id).text(quantidadeAtual - 1);
            cardapio.metodos.atualizarCarrinho(id, quantidadeAtual - 1);
        }
        else{
            cardapio.metodos.removerItemCarrinho(id);
        }

    },
    // aumenta quantidade de item no carrinho
    aumentarQuantidadeCarrinho: (id) => {
        let quantidadeAtual = parseInt($('#qntd-carrinho-' + id).text());
        $('#qntd-carrinho-' + id).text(quantidadeAtual + 1);
        cardapio.metodos.atualizarCarrinho(id, quantidadeAtual + 1);

    },
    //remove item do carrinho
    removerItemCarrinho: (id) => {
        MEU_CARRINHO = $.grep(MEU_CARRINHO, (e, i) => { return e.id != id });
        cardapio.metodos.carregarCarrinho();
        cardapio.metodos.atualizarBadgeTotal();

    },  
    // atualiza o carrinho com quantidade atual
    atualizarCarrinho: (id, qntd) => {
        let objIndex = MEU_CARRINHO.findIndex((obj => obj.id == id));
        MEU_CARRINHO[objIndex].qntd = qntd;

        cardapio.metodos.atualizarBadgeTotal();
        cardapio.metodos.carregaValores();
    },    
    //carrega valores de subtotal entrega e total
    carregaValores: () =>{
        VALOR_CARRINHO = 0;

        $("#lblSubTotal").text('R$ 0,00');
        $("#lblValorEntrega").text('+ R$ 0,00');
        $("#lblValorTotal").text('R$ 0,00');

        $.each(MEU_CARRINHO,(i, e) => {
            VALOR_CARRINHO += parseFloat(e.price * e.qntd);

            if((i + 1) == MEU_CARRINHO.length){
                $("#lblSubTotal").text(`R$ ${VALOR_CARRINHO.toFixed(2).replace(',','.')}`);
                $("#lblValorEntrega").text(`+ R$ ${VALOR_ENTREGA.toFixed(2).replace(',','.')}`);
                $("#lblValorTotal").text(`R$ ${(VALOR_CARRINHO + VALOR_ENTREGA).toFixed(2).replace(',','.')}`);
            }
        })


    },
    // carregar a etapa de endereços 
    carregarEndereco: () => {
        if(MEU_CARRINHO.length <= 0){
            cardapio.metodos.mensagem('Seu carrinho está vazio.')
            return;
        }
        cardapio.metodos.carregarEtapa(2);
    },
    //API ViaCEP
    buscarCep: () => {

        var cep = $("#txtCEP").val().trim().replace(/\D/g,''); // remove as pontuações do cep

        if(cep != ""){
            // expressão regular para validar o cep
            var validacep = /^[0-9]{8}$/;

            if(validacep.test(cep)){
                
                $.getJSON("https://viacep.com.br/ws/" + cep + "/json/?callback=?",function (dados) {
                    if(!("erro" in dados)){
                        // atualiza campos com valores retornados
                        $("#txtEndereco").val(dados.logradouro);
                        $("#txtBairro").val(dados.bairro);                        
                        $("#txtCidade").val(dados.localidade);
                        $("#ddlUf").val(dados.uf);
                        $("#txtNumero").focus();

                    }
                    else{
                        cardapio.metodos.mensagem("CEP não encontrado, preencha as informações manualmente.");
                        $("#txtEndereco").focus();
                    }
                })

            }
            else{
                cardapio.metodos.mensagem("Formato do CEP inválido.");
                $("#txtCEP").focus();
            }
        }
        else{
            cardapio.metodos.mensagem("Informe o CEP, por favor.");
            $("#txtCEP").focus();
        }
    },
    //validação para prosseguir nas etapas
    resumoPedido: () => {
        let cep = $("#txtCEP").val().trim();
        let endereco = $("#txtEntereco").val();
        let bairro = $("#txtBairro").val().trim();
        let cidade = $("#txtCidade").val().trim();
        let uf = $("#ddlUF").val();
        let numero = $("#txtNumero").val().trim();;
        let complemento = $("#txtComplemento").val().trim();
        
        if (cep.length <= 0 ){
            cardapio.metodos.mensagem("Informe o CEP, por favor.");
            $("#txtCEP").focus();
            $("#CEP").css("color", "red");
                setTimeout(() => {
                    $("#CEP").css("color", "black");
                }, 3000);
           
            return;
        }

        if (endereco.length <= 0 ){
            cardapio.metodos.mensagem("Informe o encereço, por favor.");
            $("#txtEntereco").focus();
            $("#endereco").css("color", "red");
                setTimeout(() => {
                    $("#endereco").css("color", "black");
                }, 3000);
                        
            return;
        }
        if (bairro.length <= 0 ){
            cardapio.metodos.mensagem("Informe o Bairro, por favor.");
            $("#txtBairro").focus();  
            $("#bairro").css("color", "red");
                setTimeout(() => {
                    $("#bairro").css("color", "black");
                }, 3000);          
            return;
        }

        if (cidade.length <= 0 ){
            cardapio.metodos.mensagem("Informe o cidade, por favor.");
            $("#txtCidade").focus();  
            $("#cidade").css("color", "red");
                setTimeout(() => {
                    $("#cidade").css("color", "black");
                }, 3000);          
            return;
        }

        if (uf == -1 ){
            cardapio.metodos.mensagem("Informe a uf, por favor.");
            $("#ddlUf").focus();  
            $("#uf").css("color", "red");
                setTimeout(() => {
                    $("#uf").css("color", "black");
                }, 3000);          
            return;
        }
        if (numero.length <= 0 ){
            cardapio.metodos.mensagem("Informe o Número, por favor.");
            $("#txtNumero").focus(); 
            $("#numero").css("color", "red");
                setTimeout(() => {
                    $("#numero").css("color", "black");
                }, 3000);           
            return;
        }

        MEU_ENDERECO = {
            cep: cep,
            endereco: endereco,
            bairro: bairro,
            cidade: cidade,
            uf: uf,
            numero: numero,
            complemento: complemento,

        }                    
        cardapio.metodos.carregarEtapa(3);
        cardapio.metodos.carregarResumo();
    },
    //carrega a etapa de resumo do pedido
    carregarResumo: () => {

        $("#listaItensResumo").html('');
        
        $.each(MEU_CARRINHO, (i, e) => {
            let temp = cardapio.templates.itemResumo.replace(/\${img}/g, e.img)
            .replace(/\${name}/g, e.name)            
            .replace(/\${price}/g, e.price.toFixed(2).replace('.',','))
            .replace(/\${qntd}/g, e.qntd)

            $("#listaItensResumo").append(temp);
        });

        $("#resumoEndereco").html(`${MEU_ENDERECO.endereco}, ${MEU_ENDERECO.numero}, ${MEU_ENDERECO.bairro}`);
        $("#cidadeEndereco").html(`${MEU_ENDERECO.cidade}, ${MEU_ENDERECO.uf} / ${MEU_ENDERECO.cep} - ${MEU_ENDERECO.complemento}`);
        cardapio.metodos.finalizarPedido();
    },
    //atualiza o link do whatsApp
    finalizarPedido: () => {
        if (MEU_CARRINHO.length > 0 && MEU_ENDERECO != null){
            var texto = 'Olá gostaria de fazer um pedido: ';
            texto += `\n*Itens do pedido:* \n\n\${itens}`;
            texto += '\n*Endereço de entrega:*';
            texto += `\n${MEU_ENDERECO.endereco}, ${MEU_ENDERECO.numero}, ${MEU_ENDERECO.bairro}`;
            texto += `\n${MEU_ENDERECO.cidade}, ${MEU_ENDERECO.uf} / ${MEU_ENDERECO.cep} - ${MEU_ENDERECO.complemento}`;
            texto += `\n\n*Total (com entrega): RS ${(VALOR_CARRINHO + VALOR_ENTREGA).toFixed(2).replace('.',',')}*`; 

            var itens = '';

            $.each(MEU_CARRINHO, (i, e) => {
                itens += `*${e.qntd}x* ${e.name} ....... R$ ${e.price.toFixed(2).replace('.',',')}\n`;

                if((i + 1) == MEU_CARRINHO.length){
                    texto = texto.replace(/\${itens}/g, itens);

                    // converte texto para URL

                    let encode = encodeURI(texto);
                    let URL = `https://wa.me/${CELULAR}?text=${encode}`;

                    $("#btnEtapaResumo").attr('href', URL);
                }


            })

           

        }
    },
    // carrega o link do botao fazer reserva
    carregarBotaoReserva: () => {
        var texto = 'Olá! gostaria de fazer uma *reserva*.';

        let encode = encodeURI(texto);
        let URL = `https://wa.me/${CELULAR}?text=${encode}`;

        $("#btnReserva").attr('href', URL);
    },
    // carrega botao de ligar
    carregarBotaoLigar: () => {
        $("#btnLigar").attr('href',`tel:${CELULAR}`);
    },
    //abre depoimentos
    abrirDepoimento: (depoimento) => {
        $("#depoimento-1").addClass('hidden');
        $("#depoimento-2").addClass('hidden');
        $("#depoimento-3").addClass('hidden');

        $("#btnDepoimento-1").removeClass('active');
        $("#btnDepoimento-2").removeClass('active');
        $("#btnDepoimento-3").removeClass('active');

        $("#depoimento-" + depoimento).removeClass('hidden');
        $("#btnDepoimento-" + depoimento).addClass('active');

    },
    //botão ligar
    ligarHeader: () => {
        var texto = 'Olá! gostaria de conhcer seus serviços.';

        let encode = encodeURI(texto);
        let URL = `https://wa.me/${CELULAR}?text=${encode}`;

        $("#btnWhats").attr('href', URL);
        $("#btnWhatsfooter").attr('href', URL);


        
    },





    // mensagens
    mensagem: (texto, cor = 'red', tempo = 3500) => {

        let id = Math.floor(Date.now() * Math.random()).toString();//cria Id único para saber qual div remover

        let msg = `<div id="msg-${id}" class="animated fadeInDown toast ${cor}">${texto}</div>`;


        $("#container-mensagens").append(msg);

        setTimeout(() => {
            $("#msg-"+id).removeClass('fadeInDown');
            $("#msg-"+id).addClass('fadeOutUp');
            setTimeout(() => {
                $("#msg-"+id).remove();
            }, 800);
        }, tempo);
    },


}

cardapio.templates = {

    item: `

    <div class="col-12 col-lg-3 col-md-3 col-sm-6 mb-5 animated fadeInUp">
        <div class="card card-item" id="\${id}">
            <div class="img-produto">
                <img src="\${img}"/>
                
            </div>
            <p class="title-produto text-center mt-4">
                <b>\${name}</b>
            </p>
            <p class="price-produto text-center">
                <b>R$ \${price}</b>
            </p>

            <div class="add-carrinho">
                <span class="btn-menos" onclick="cardapio.metodos.diminuirQuantidade('\${id}')"><i class="fas fa-minus"></i></span>
                <span class="add-numero-itens" id="qntd-\${id}">0</span>
                <span class="btn-mais" onclick="cardapio.metodos.aumentarQuantidade('\${id}')"><i class="fas fa-plus"></i></span>
                <span class="btn btn-add" onclick="cardapio.metodos.adicionarAoCarrinho('\${id}')"><i class="fas fa-shopping-bag"></i></span>

            </div>
        </div>
    
    </div>

    `,

    itemCarrinho: `
    <div class="col-12 item-carrinho">
    <div class="img-produto">
        <img src="\${img}">
    </div>
    <div class="dados-produto">
        <p class="title-produto"><b>\${name}</b></p>
        <p class="price-produto"><b>R$\${price}</b></p>
    </div>
    <div class="add-carrinho">
        <span class="btn-menos" onclick="cardapio.metodos.diminuirQuantidadeCarrinho('\${id}')"><i class="fas fa-minus"></i></span>
        <span class="add-numero-itens" id="qntd-carrinho-\${id}">\${qntd}</span>
        <span class="btn-mais" onclick="cardapio.metodos.aumentarQuantidadeCarrinho('\${id}')"><i class="fas fa-plus"></i></span>
        <span class="btn btn-remove no-mobile" onclick="cardapio.metodos.removerItemCarrinho('\${id}')"><i class="fas fa-times"></i></span>

    </div>
    </div>
    `,

    itemResumo:`
    <div class="col-12 item-carrinho resumo">
        <div class="img-produto-resumo">
            <img src="\${img}" alt="">
        </div>
        <div class="dados-produto">
            <p class="title-produto-resumo">
                <b>\${name}</b>
            </p>
            <p class="price-produto-resumo">
                <b>R$ \${price}</b>
            </p>
        </div>
        <p class="quantidade-produto-resumo">
            x <b>\${qntd}</b>
        </p>

    </div>                


    `,
}
