import { CreateMLCEngine } from "https://esm.run/@mlc-ai/web-llm";

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(err => console.log("SW Register Error:", err));
}

const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const statusDiv = document.getElementById('status');

let engine;
const MODEL_NAME = "Llama-3.2-1B-Instruct-q4f16_1-MLC"; 

async function initAI() {
    try {
        statusDiv.innerText = "Đang chuẩn bị tải Model về bộ nhớ đệm iPhone...";
        engine = await CreateMLCEngine(MODEL_NAME, {
            initProgressCallback: (progress) => {
                statusDiv.innerText = `Đang tải dữ liệu AI: ${Math.round(progress.progress * 100)}% (Vui lòng không tắt màn hình)`;
            }
        });
        statusDiv.innerText = "AI Cục Bộ Đã Sẵn Sàng (Offline Mode)";
        userInput.disabled = false;
        sendBtn.disabled = false;
        userInput.placeholder = "Hỏi gì đó với AI local...";
    } catch (error) {
        statusDiv.innerText = "Lỗi khởi tạo: Thiết bị không hỗ trợ WebGPU hoặc vượt giới hạn RAM.";
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
    statusDiv.innerText = "AI đang xử lý trên chip A15 Bionic...";

    const messages = [
        { role: "system", content: "Bạn là một trợ lý AI chạy local hoàn toàn trên điện thoại người dùng. Hãy trả lời ngắn gọn, rõ ràng bằng tiếng Việt." },
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
