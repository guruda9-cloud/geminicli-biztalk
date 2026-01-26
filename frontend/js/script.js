document.addEventListener('DOMContentLoaded', () => {
    const inputText = document.getElementById('inputText');
    const currentCharSpan = document.getElementById('currentChar');
    const convertButton = document.getElementById('convertButton');
    const resultText = document.getElementById('resultText');
    const copyButton = document.getElementById('copyButton');
    const targetAudience = document.getElementById('targetAudience');
    const feedbackMessage = document.createElement('div');
    feedbackMessage.classList.add('feedback-message');
    resultText.parentNode.insertBefore(feedbackMessage, resultText.nextSibling);

    const MAX_CHARS = 500;
    let lastRequest = { text: '', audience: '' };

    function showFeedback(message, type) {
        feedbackMessage.textContent = message;
        feedbackMessage.className = `feedback-message ${type}`;
        feedbackMessage.style.display = 'block';
        setTimeout(() => {
            feedbackMessage.style.display = 'none';
        }, 3000);
    }

    function updateCopyButtonState() {
        const hasConvertedText = resultText.textContent.trim() !== '' && !resultText.querySelector('.placeholder-text.error') && resultText.innerHTML.indexOf('변환 중입니다') === -1;
        copyButton.disabled = !hasConvertedText;
        copyButton.style.display = hasConvertedText ? 'block' : 'none';
    }

    async function performConversion(textToConvert, audience) {
        lastRequest = { text: textToConvert, audience: audience }; // Store last request

        convertButton.classList.add('loading');
        convertButton.disabled = true;
        copyButton.disabled = true;
        resultText.innerHTML = '<p class="placeholder-text">변환 중입니다...</p>';
        feedbackMessage.style.display = 'none';
        
        // Remove retry button if it exists
        const oldRetryButton = resultText.parentNode.querySelector('.retry-button');
        if (oldRetryButton) {
            oldRetryButton.remove();
        }

        try {
            const response = await fetch('/convert', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: textToConvert,
                    targetAudience: audience,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMessage = data.error || '알 수 없는 서버 오류가 발생했습니다.';
                throw new Error(errorMessage);
            }
            
            if(data.convertedText) {
                resultText.innerHTML = `<p>${data.convertedText.replace(/\n/g, '<br>')}</p>`;
                showFeedback('텍스트 변환 성공!', 'success');
            } else {
                 throw new Error('변환된 텍스트가 없습니다.');
            }

        } catch (error) {
            console.error('Error during conversion:', error);
            resultText.innerHTML = `<p class="placeholder-text error">오류: ${error.message}</p>`;
            showFeedback(`변환 실패: ${error.message}`, 'error');

            // Add retry button
            const retryButton = document.createElement('button');
            retryButton.textContent = '재시도';
            retryButton.classList.add('retry-button');
            retryButton.classList.add('convert-button'); // Reuse button style
            retryButton.style.marginTop = '10px';
            retryButton.addEventListener('click', () => performConversion(lastRequest.text, lastRequest.audience));
            resultText.parentNode.insertBefore(retryButton, feedbackMessage); // Insert before feedback message

        } finally {
            convertButton.classList.remove('loading');
            convertButton.disabled = false;
            updateCopyButtonState();
        }
    }

    inputText.addEventListener('input', () => {
        let textLength = inputText.value.length;

        if (textLength > MAX_CHARS) {
            inputText.value = inputText.value.substring(0, MAX_CHARS);
            textLength = MAX_CHARS;
            currentCharSpan.parentElement.style.color = 'var(--error-color)';
            convertButton.disabled = true;
        } else {
            currentCharSpan.parentElement.color = '#888';
            convertButton.disabled = false;
        }
        currentCharSpan.textContent = textLength;
    });

    inputText.dispatchEvent(new Event('input'));
    updateCopyButtonState();

    convertButton.addEventListener('click', () => {
        const textToConvert = inputText.value.trim();
        const audience = targetAudience.value;

        if (textToConvert.length === 0) {
            showFeedback('변환할 텍스트를 입력해주세요.', 'error');
            return;
        }
        performConversion(textToConvert, audience);
    });

    copyButton.addEventListener('click', () => {
        const textToCopy = resultText.textContent;

        if (!textToCopy || resultText.querySelector('.placeholder-text.error')) {
            showFeedback('복사할 내용이 없습니다.', 'error');
            return;
        }

        navigator.clipboard.writeText(textToCopy).then(() => {
            showFeedback('✅ 복사 완료!', 'success');
            copyButton.textContent = '✅ 복사 완료!';
            copyButton.classList.add('success');
            
            setTimeout(() => {
                copyButton.textContent = '📄 복사하기';
                copyButton.classList.remove('success');
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            showFeedback('텍스트 복사에 실패했습니다.', 'error');
        });
    });
});

