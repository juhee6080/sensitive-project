document.addEventListener('DOMContentLoaded', () => {
    const analyzeBtn = document.getElementById('analyzeBtn');
    const inputText = document.getElementById('inputText');
    const loadingArea = document.getElementById('loadingArea');
    const errorArea = document.getElementById('errorArea');
    const errorMessage = document.getElementById('errorMessage');
    const resultArea = document.getElementById('resultArea');
    
    const resultSentiment = document.getElementById('resultSentiment');
    const confidenceFill = document.getElementById('confidenceFill');
    const confidenceValue = document.getElementById('confidenceValue');
    const resultReason = document.getElementById('resultReason');

    const sentimentMap = {
        'positive': '긍정',
        'negative': '부정',
        'neutral': '중립'
    };

    const sentimentColorMap = {
        'positive': '#fff176', // Using point color for positive
        'negative': '#ff6b6b', // Error color for negative
        'neutral': '#777777'   // Muted for neutral
    };

    analyzeBtn.addEventListener('click', async () => {
        const text = inputText.value.trim();

        // 1. Validation
        if (!text) {
            showError('분석할 문장을 입력해주세요.');
            return;
        }

        // 2. UI Reset
        hideError();
        hideResult();
        setLoading(true);

        try {
            // 3. API Request
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || '분석 중 문제가 발생했습니다.');
            }

            // 4. Show Result
            displayResult(data);

        } catch (error) {
            console.error('Fetch error:', error);
            showError(error.message);
        } finally {
            setLoading(false);
        }
    });

    function setLoading(isLoading) {
        if (isLoading) {
            analyzeBtn.disabled = true;
            analyzeBtn.innerText = '분석 중...';
            loadingArea.classList.remove('hidden');
        } else {
            analyzeBtn.disabled = false;
            analyzeBtn.innerText = '분석하기';
            loadingArea.classList.add('hidden');
        }
    }

    function showError(message) {
        errorMessage.innerText = message;
        errorArea.classList.remove('hidden');
    }

    function hideError() {
        errorArea.classList.add('hidden');
    }

    function displayResult(data) {
        const { sentiment, confidence, reason } = data;

        // Set text
        resultSentiment.innerText = sentimentMap[sentiment] || '결과 없음';
        resultReason.innerText = reason;
        confidenceValue.innerText = `${confidence}%`;

        // Set color
        resultSentiment.style.color = sentimentColorMap[sentiment] || '#ffffff';
        
        // Animate bar
        confidenceFill.style.width = '0%';
        setTimeout(() => {
            confidenceFill.style.width = `${confidence}%`;
        }, 100);

        resultArea.classList.remove('hidden');
        
        // Scroll to result
        resultArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function hideResult() {
        resultArea.classList.add('hidden');
    }
});
