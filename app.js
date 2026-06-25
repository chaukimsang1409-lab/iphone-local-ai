import { CreateMLCEngine } from "https://esm.run/@mlc-ai/web-llm";

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(err => console.log("SW Register Error:", err));
}

const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const statusDiv = document.getElementById('status');

let engine;
// Đổi sang mô hình TinyLlama siêu nhẹ để không bị Apple chặn RAM
const MODEL_NAME = "TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC"; 

async function initAI() {
    try {
        statusDiv.innerText = "Đang chuẩn bị tải Model siêu nhẹ (TinyLlama)...";
        engine = await CreateMLCEngine(MODEL_NAME, {
            initProgressCallback: (progress) => {
                statusDiv.innerText = `Đang tải dữ liệu: ${Math.round(progress.progress * 100)}% (Xin đừng tắt màn hình)`;
            }
        });
        statusDiv.innerText = "AI Cục Bộ Đã Sẵn Sàng (Offline Mode)";
        userInput.disabled = false;
        sendBtn.disabled = false;
        userInput.placeholder = "Hỏi gì đó với AI local...";
    } catch (error) {
        statusDiv.innerText = "Lỗi khởi tạo: Vượt quá giới hạn RAM của iOS.";
        console.error(error);
    }
}

function appendMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', sender === 'user' ? 'user-msg' : 'ai-msg');
    msgDiv.innerText = text;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function handleSend() {
    const text = userInput.value.trim();
    if (!text || !engine) return;

    appendMessage(text, 'user');
    userInput.value = '';
    statusDiv.innerText = "AI đang xử lý...";

    const messages = [
        { role: "system", content: "Bạn là một trợ lý AI nhỏ gọn." },
        { role: "user", content: text }
    ];

    try {
        const reply = await engine.chat.completions.create({ messages });
        appendMessage(reply.choices[0].message.content, 'ai');
    } catch (error) {
        appendMessage("Lỗi xử lý: " + error.message, 'ai');
    }
    statusDiv.innerText = "AI Cục Bộ Sẵn Sàng";
}

sendBtn.addEventListener('click', handleSend);
userInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSend(); });

window.addEventListener('DOMContentLoaded', initAI);
