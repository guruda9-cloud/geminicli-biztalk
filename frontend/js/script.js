document.addEventListener('DOMContentLoaded', () => {
    const inputText = document.getElementById('inputText');
    const currentCharSpan = document.getElementById('currentChar');
    const convertButton = document.getElementById('convertButton');
    const resultText = document.getElementById('resultText');
    const copyButton = document.getElementById('copyButton');
    const targetAudience = document.getElementById('targetAudience');
    const feedbackMessage = document.createElement('div'); // Create feedback message element
    feedbackMessage.classList.add('feedback-message');
    resultText.parentNode.insertBefore(feedbackMessage, resultText.nextSibling); // Insert after resultText

    const MAX_CHARS = 500;

    // Helper function to show feedback messages
    function showFeedback(message, type) {
        feedbackMessage.textContent = message;
        feedbackMessage.className = `feedback-message ${type}`;
        feedbackMessage.style.display = 'block';
        setTimeout(() => {
            feedbackMessage.style.display = 'none';
        }, 3000);
    }

    // Update copy button state
    function updateCopyButtonState() {
        const hasConvertedText = resultText.textContent.trim() !== '' && resultText.textContent.trim() !== '변환 결과가 여기에 표시됩니다.' && !resultText.querySelector('.error');
        copyButton.disabled = !hasConvertedText;
        copyButton.style.display = hasConvertedText ? 'block' : 'none'; // Only show copy button if there is text to copy
    }

    // FR-04: 입력 편의성 - 글자 수 실시간 카운트 및 입력 제한
    inputText.addEventListener('input', () => {
        let textLength = inputText.value.length;

        if (textLength > MAX_CHARS) {
            inputText.value = inputText.value.substring(0, MAX_CHARS);
            textLength = MAX_CHARS;
            currentCharSpan.parentElement.style.color = 'var(--error-color)';
            convertButton.disabled = true;
        } else {
            currentCharSpan.parentElement.style.color = '#888';
            convertButton.disabled = false;
        }
        currentCharSpan.textContent = textLength;
    });

    inputText.dispatchEvent(new Event('input')); // Trigger input event to set initial count and button state
    updateCopyButtonState(); // Initialize copy button state

    convertButton.addEventListener('click', async () => {
        const textToConvert = inputText.value.trim();
        const audience = targetAudience.value;

        if (textToConvert.length === 0) {
            showFeedback('변환할 텍스트를 입력해주세요.', 'error');
            return;
        }

        convertButton.classList.add('loading');
        convertButton.disabled = true;
        copyButton.disabled = true; // Disable copy button during conversion
        resultText.innerHTML = '<p class="placeholder-text">변환 중입니다...</p>';
        feedbackMessage.style.display = 'none'; // Hide any previous feedback

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
            resultText.innerHTML = `<p class="placeholder-text error">오류: ${error.message}</p>`; // Use class for error text
            showFeedback(`변환 실패: ${error.message}`, 'error');
        } finally {
            convertButton.classList.remove('loading');
            convertButton.disabled = false;
            updateCopyButtonState(); // Update copy button state after conversion
        }
    });

    copyButton.addEventListener('click', () => {
        const textToCopy = resultText.textContent; // Use textContent to avoid HTML tags

        if (!textToCopy || resultText.querySelector('.placeholder-text.error')) { // Check for error placeholder
            showFeedback('복사할 내용이 없습니다.', 'error');
            return;
        }

        navigator.clipboard.writeText(textToCopy).then(() => {
            showFeedback('✅ 복사 완료!', 'success');
            copyButton.textContent = '✅ 복사 완료!'; // Visual feedback on the button
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

