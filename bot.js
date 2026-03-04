const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const cron = require("node-cron");
const fs = require("fs");

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on("qr", (qr) => {
    qrcode.generate(qr, { small: true });
    console.log("📱 | Escanie o QR Code com seu Whatsapp!")
});

const lembretesPendentes = {}
const estados = {}
const lembreteTemp = {}

const salvarLembretes = () => {
    fs.writeFileSync("lembretes.json", JSON.stringify(lembretes));
}

const carregarLembretes = () => {
    if (fs.existsSync("lembretes.json")) {
        const dados = fs.readFileSync("lembretes.json");
        const lembretesCarregados = JSON.parse(dados);

        return lembretesCarregados;
    } else {
        return [];
    }
}

const lembretes = carregarLembretes();

const formatarNumero = (destino) => {
    return destino + "@c.us"
}

const converterHorario = (horario) => {
    const [hora, minuto] = horario.split(":");
    return `0 ${minuto} ${hora} * * *`;
}

const esperar = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const agendarLembrete = (lembrete) => {
    cron.schedule(converterHorario(lembrete.horario), async () => {
        await client.sendMessage(lembrete.destino, `⏰ Lembrete: *${lembrete.mensagem}*\nPara continuar escolha uma opção abaixo:\n\n[1] Confirmar ✅\n[2] Cancelar ❌\n[3] Adiar 30 minutos ⏳`);

        lembretesPendentes[lembrete.destino] = lembrete;
        estados[lembrete.destino] = "aguardando_confirmacao";
    });
}

client.on("ready", async () => {
    console.log("✅ | Bot conectado!");
    lembretes.forEach(lembrete => {
        agendarLembrete(lembrete);
    });
})

client.on("message_create", async (msg) => {   
    if (msg.fromMe) return;

    if (estados[msg.from] === "aguardando_nome") {

        lembreteTemp[msg.from] = { nome: msg.body };
        estados[msg.from] = "aguardando_horario";
        await esperar(2000);
        await msg.reply("⏰ Qual o horário? (ex: 08:00)");

    } else if (estados[msg.from] === "aguardando_horario") {

        lembreteTemp[msg.from].horario = msg.body;
        estados[msg.from] = "aguardando_mensagem";
        await esperar(2000);
        await msg.reply("📃 Qual a mensagem do lembrete?");

    } else if (estados[msg.from] === "aguardando_mensagem") {

        lembreteTemp[msg.from].mensagem = msg.body;
        lembreteTemp[msg.from].destino = msg.from;
        lembretes.push(lembreteTemp[msg.from]);
        agendarLembrete(lembreteTemp[msg.from]);
        estados[msg.from] = null;
        salvarLembretes();
        await esperar(2000);
        await msg.reply("✅ Lembrete criado com sucesso!");

    } else if (estados[msg.from] === "aguardando_confirmacao") {
        
        if (msg.body === "1") {
            await esperar(2000);
            await msg.reply("✅ Lembrete confirmado!");
        } else if (msg.body === "2") {
            await esperar(2000);
            await msg.reply("❌ Lembrete cancelado!");
        } else if (msg.body === "3") {
            const agora = new Date();
            agora.setMinutes(agora.getMinutes() + 30);
            const novoLembrete = { ...lembretesPendentes[msg.from], horario: `${agora.getHours()}:${agora.getMinutes().toString().padStart(2, "0")}` };
            lembretes.push(novoLembrete);
            agendarLembrete(novoLembrete);
            await esperar(2000);
            await msg.reply("⏳ Lembrete adiado 30 minutos!");
        }
        delete lembretesPendentes[msg.from];
        estados[msg.from] = null;

    } else if (estados[msg.from] === "deletando") {
        const index = parseInt(msg.body) - 1;
        if (index >= 0 && index < lembretes.length) {
            const lembrete = lembretes[index];
            lembretes.splice(index, 1);
            salvarLembretes();
            await esperar(2000);
            await msg.reply(`🗑️ Lembrete ${lembrete.nome} deletado com sucesso!`);
        } else {
            await esperar(2000);
            await msg.reply("❌ Número inválido!");
        }
        estados[msg.from] = null;

    } else {

        if (msg.body.toLowerCase() === "lembretes") {

            let lista = "📋 Meus lembretes ativos:\n\n";
            lembretes.forEach( async (lembrete) => {
                lista += `${lembrete.nome} - ${lembrete.horario}\n`;
            })
            await esperar(2000);
            await msg.reply(lista);

        } else if (msg.body.toLowerCase() === "criar lembrete") {

            estados[msg.from] = "aguardando_nome";
            await esperar(2000);
            await msg.reply("📌 Qual o nome do lembrete?");

        } else if (msg.body.toLowerCase() === "deletar lembrete") {
            let lista = "🗑️ Lembretes ativos:\n";
            lembretes.forEach( async (lembrete, index) => {
                lista += `${index + 1}. ${lembrete.nome} - ${lembrete.horario}\n`;
            })
            estados[msg.from] = "deletando";
            await esperar(2000);
            await msg.reply(lista + "\nDigite o número do lembrete que deseja deletar.");

        } else if (msg.body.toLowerCase() === "ajuda") {
            await esperar(2000);
            await msg.reply("📋 Comandos disponíveis:\n\n- Criar lembrete\n- Deletar lembrete\n- Lembretes\n- Ajuda");
        }
    }
});

client.initialize();