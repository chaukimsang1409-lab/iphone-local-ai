```javascript
import { CreateMLCEngine } from "https://esm.run/@mlc-ai/web-llm";

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(err => console.log("SW Register Error:", err));
}

const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const statusDiv = document.getElementById('status');

let engine;

// Vẫn giữ mô hình Qwen 0.5B siêu nhẹ
const MODEL_NAME = "Qwen2-0.5B-Instruct-q4f16_1-MLC";

async function initAI() {
    try {
        statusDiv.innerText = "Đang tải mô hình Qwen 0.5B...";
        
        engine = await CreateMLCEngine(
            MODEL_NAME, 
            {
                initProgressCallback: (progress) => {
                    statusDiv.innerText = `Đang tải dữ liệu: ${Math.round(progress.progress * 100)}%`;
                }
            },
            // BỘ THAM SỐ CỐT LÕI ĐỂ VƯỢT RÀO IOS SAFARI
            {
                context_window_size: 512,  // Giới hạn bộ nhớ tổng
                prefill_chunk_size: 128,   // CHÌA KHÓA: Cắt nhỏ dữ liệu đầu vào thành từng đoạn 128 tokens để iOS không chặn cấp RAM
                max_tokens: 150            // Ép AI trả lời ngắn gọn, không nhai hết RAM giữa chừng
            }
        );
        
        statusDiv.innerText = "AI Cục Bộ Đã Sẵn Sàng (Offline Mode)";
        userInput.disabled = false;
        sendBtn.disabled = false;
        userInput.placeholder = "Hỏi gì đó với AI local...";
    } catch (error) {
        statusDiv.innerText = "Lỗi khởi tạo: " + error.message;
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
    
    statusDiv.innerText = "AI đang suy nghĩ (Xử lý từng mảnh nhỏ)...";
    userInput.disabled = true;
    sendBtn.disabled = true;

    const messages = [
        { role: "system", content: "Bạn là trợ lý AI siêu nhỏ gọn chạy trên điện thoại. Hãy trả lời cực kỳ ngắn gọn bằng tiếng Việt, dưới 2 câu." },
        { role: "user", content: text }
    ];

    try {
        // Gửi yêu cầu với cấu hình an toàn
        const reply = await engine.chat.completions.create({ messages });
        appendMessage(reply.choices[0].message.content, 'ai');
    } catch (error) {
        appendMessage("Lỗi xử lý: " + error.message, 'ai');
        // Nếu vẫn lỗi, thử reset lại engine (hiếm khi xảy ra nếu đã cấu hình prefill_chunk_size)
        console.error("Inference Error:", error);
    } finally {
        userInput.disabled = false;
        sendBtn.disabled = false;
        statusDiv.innerText = "AI Cục Bộ Sẵn Sàng";
        userInput.focus();
    }
}

sendBtn.addEventListener('click', handleSend);
userInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSend(); });

window.addEventListener('DOMContentLoaded', initAI);


```
