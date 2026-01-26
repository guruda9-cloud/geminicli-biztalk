document.addEventListener('DOMContentLoaded', () => {
    const inputText = document.getElementById('inputText');
    const currentChar = document.getElementById('currentChar');
    const convertButton = document.getElementById('convertButton');
    const resultText = document.getElementById('resultText');
    const copyButton = document.getElementById('copyButton');
    const targetAudience = document.getElementById('targetAudience');
    const fetchTimeButton = document.getElementById('fetchTimeButton');
    const currentTimeDisplay = document.getElementById('currentTimeDisplay');

    const MAX_CHARS = 500;

    // FR-04: 입력 편의성 - 글자 수 실시간 카운트
    inputText.addEventListener('input', () => {
        const textLength = inputText.value.length;
        currentChar.textContent = textLength;

        if (textLength > MAX_CHARS) {
            inputText.value = inputText.value.substring(0, MAX_CHARS);
            currentChar.textContent = MAX_CHARS;
            // 시각적 경고 (예: 색상 변경)
            currentChar.parentElement.style.color = '#D0021B'; // Error color
        } else {
            currentChar.parentElement.style.color = '#888'; // Default color
        }
    });

    // FR-01: 핵심 말투 변환 - 변환 버튼 클릭 이벤트
    convertButton.addEventListener('click', async () => {
        const textToConvert = inputText.value.trim();
        const audience = targetAudience.value;

        if (textToConvert.length === 0) {
            alert('변환할 텍스트를 입력해주세요.');
            return;
        }

        // 로딩 상태 시작
        convertButton.classList.add('loading');
        convertButton.disabled = true;
        resultText.innerHTML = '<p>변환 중입니다...</p>';

        try {
            // 2단계: 백엔드 API와의 비동기 통신 로직 구현 (Fetch API)
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

            // 응답 본문을 JSON으로 파싱
            const data = await response.json();

            // FR-05: 오류 처리 (개선)
            if (!response.ok) {
                // 백엔드에서 보낸 구체적인 에러 메시지를 사용
                const errorMessage = data.error || '알 수 없는 서버 오류가 발생했습니다.';
                throw new Error(errorMessage);
            }
            
            // 성공 시 결과 표시
            if(data.convertedText) {
                resultText.innerHTML = `<p>${data.convertedText.replace(/\n/g, '<br>')}</p>`;
            } else {
                 throw new Error('변환된 텍스트가 없습니다.');
            }

        } catch (error) {
            console.error('Error during conversion:', error);
            // 사용자에게 구체적인 에러 메시지 표시
            resultText.innerHTML = `<p style="color: #D0021B;">오류: ${error.message}</p>`;
        } finally {
            // 로딩 상태 종료
            convertButton.classList.remove('loading');
            convertButton.disabled = false;
        }
    });

    // FR-03: 결과 활용 - 복사하기 버튼
    copyButton.addEventListener('click', () => {
        const textToCopy = resultText.innerText;

        if (!textToCopy || textToCopy === '변환 결과가 여기에 표시됩니다.' || resultText.querySelector('p[style*="color: #D0021B"]')) {
            alert('복사할 내용이 없습니다.');
            return;
        }

        navigator.clipboard.writeText(textToCopy).then(() => {
            // 복사 성공 시 시각적 피드백
            copyButton.textContent = '✅ 복사 완료!';
            copyButton.classList.add('success');
            
            setTimeout(() => {
                copyButton.textContent = '📄 복사하기';
                copyButton.classList.remove('success');
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            alert('텍스트 복사에 실패했습니다.');
        });
    });

    // 서버 시간 가져오기 버튼 클릭 이벤트
    fetchTimeButton.addEventListener('click', async () => {
        currentTimeDisplay.textContent = '가져오는 중...';
        try {
            const response = await fetch('/api/time');
            if (!response.ok) {
                throw new Error('서버 시간을 가져오지 못했습니다.');
            }
            const data = await response.json();
            currentTimeDisplay.textContent = `현재 서버 시간: ${data.currentTime}`;
        } catch (error) {
            console.error('Error fetching time:', error);
            currentTimeDisplay.textContent = `시간을 가져오는 데 실패했습니다: ${error.message}`;
            currentTimeDisplay.style.color = '#D0021B';
        }
    });
});

