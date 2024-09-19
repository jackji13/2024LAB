function analyzeFile() {
    const fileInput = document.getElementById('fileInput');
    const output = document.getElementById('output');

    if (fileInput.files.length === 0) {
        output.textContent = 'Please select the chat.txt file.';
        return;
    }

    const file = fileInput.files[0];

    if (file.name !== 'chat.txt') {
        output.textContent = 'Please upload a file named "chat.txt".';
        return;
    }

    const reader = new FileReader();

    reader.onload = function(event) {
        let text = event.target.result;

        text = text.replace(/kd比gpa高:/g, '');
        text = text.replace(/AAA渐冻症患者马姐:/g, '');

        const topWords = getTopWords(text);
        
        console.log('Top 50 Most Frequent Words:');
        output.textContent = 'Top 50 Most Frequent Words:\n';
        topWords.forEach(([word, count], index) => {
            const result = `${index + 1}. ${word}: ${count}`;
            console.log(result);
            output.textContent += result + '\n';
        });
    };

    reader.readAsText(file);
}

function getTopWords(text) {

    const words = text.match(/[\u4e00-\u9fff\w'-]+/g);

    const wordCount = {};
    words.forEach(word => {

        const cleanedWord = word.trim();
        
        if (cleanedWord.length === 1 && /^[a-zA-Z]$/.test(cleanedWord)) {
            return;
        }

        if (cleanedWord) {

            const wordCountExact = (text.match(new RegExp(cleanedWord, 'g')) || []).length;
            wordCount[cleanedWord] = wordCountExact;
        }
    });

    const sortedWords = Object.entries(wordCount).sort((a, b) => b[1] - a[1]);

    return sortedWords.slice(0, 50);
}