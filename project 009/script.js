document.getElementById('searchButton').addEventListener('click', async () => {
    const query = document.getElementById('searchInput').value.trim();

    if (query) {
        try {
            const response = await fetch(`http://localhost:3001/search?query=${encodeURIComponent(query)}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            const resultElement = document.getElementById('result');
            
            if (data.data && data.data.length > 0) {
                resultElement.textContent = `Results: ${data.data.join(', ')}`;
            } else {
                resultElement.textContent = 'No results found.';
            }

        } catch (error) {
            console.error('Error fetching data:', error);
            document.getElementById('result').textContent = 'Error fetching data.';
        }
    } else {
        document.getElementById('result').textContent = 'Please enter a search term.';
    }
});
