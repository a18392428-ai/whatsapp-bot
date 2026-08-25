const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');

async function startBot() {
    // حفظ جلسة تسجيل الدخول عشان متمسحش كل ما البوت يعيد تشغيل
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true
    });

    sock.udarstven = saveCreds;

    // الاستماع لحفظ بيانات الاعتماد
    sock.ev.on('creds.update', saveCreds);

    // التعامل مع الرسائل الواردة
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];
        if (!m.message || m.key.fromMe) return;

        const messageContent = m.message.conversation || m.message.extendedTextMessage?.text;
        const sender = m.key.remoteJid;

        console.log(`رسالة جديدة من ${sender}: ${messageContent}`);

        // الرد التلقائي البسيط
        if (messageContent === 'مرحبا' || messageContent === 'سلام') {
            await sock.sendMessage(sender, { text: 'أهلاً بك! أنا بوت واتساب شغال بلغة Node.js 🤖' });
        }
    });

    // حالة الاتصال
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            console.log('انقطع الاتصال، جاري إعادة المحاولة...');
            startBot();
        } else if (connection === 'open') {
            console.log('✨ تم الاتصال بالواتساب بنجاح!');
        }
    });
}

startBot();
