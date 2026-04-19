// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    // Select Elements
    const btnGenerate = document.getElementById('btn-generate');
    const btnDebug = document.getElementById('btn-debug');
    const btnCopy = document.getElementById('btn-copy');
    
    const userInput = document.getElementById('user-input');
    const languageSelect = document.getElementById('language-select');
    
    const outputContent = document.getElementById('output-content');
    const loader = document.getElementById('loader');
    const placeholder = document.querySelector('.placeholder-text');

    // Make API request helper
    async function callApi(endpoint, data) {
        try {
            const response = await fetch(`/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'API Error');
            }
            
            return await response.json();
            
        } catch (error) {
            throw error;
        }
    }

    // Process State Management
    function startLoading(message) {
        // Hide placeholder and previous content
        placeholder.classList.add('hidden');
        outputContent.classList.add('hidden');
        
        // Show loader
        loader.classList.remove('hidden');
        document.getElementById('loader-text').innerText = message;
        
        // Disable buttons
        btnGenerate.disabled = true;
        btnDebug.disabled = true;
        btnGenerate.style.opacity = 0.5;
        btnDebug.style.opacity = 0.5;
    }

    function stopLoading() {
        loader.classList.add('hidden');
        
        btnGenerate.disabled = false;
        btnDebug.disabled = false;
        btnGenerate.style.opacity = 1;
        btnDebug.style.opacity = 1;
    }

    function handleResult(result) {
        // We expect result to be Markdown from OpenAI.
        // Use marked.js to convert to HTML, then highlight formatting.
        outputContent.innerHTML = marked.parse(result);
        
        // Apply Syntax Highlighting to all pre>code blocks
        document.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
        });

        outputContent.classList.remove('hidden');
    }

    function handleError(errorMessage) {
        outputContent.innerHTML = `<div style="color: #ff5555; font-family: var(--font-ui); background: rgba(255,0,0,0.1); padding: 15px; border-radius: var(--radius-sm); border: 1px solid #ff5555;">
            <strong>Error:</strong> ${errorMessage}
        </div>`;
        outputContent.classList.remove('hidden');
    }

    // --- Event Listeners ---

    // 1. Generate Code
    btnGenerate.addEventListener('click', async () => {
        const prompt = userInput.value.trim();
        const language = languageSelect.value;
        
        if (!prompt) {
            alert('Please enter a query or problem description.');
            return;
        }
        
        startLoading('Generating code logic...');
        
        try {
            const res = await callApi('generate', { prompt, language });
            handleResult(res.result);
        } catch (err) {
            console.error(err);
            handleError(err.message);
        } finally {
            stopLoading();
        }
    });

    // 2. Debug Code
    btnDebug.addEventListener('click', async () => {
        const code = userInput.value.trim();
        
        if (!code) {
            alert('Please paste the code you want to debug in the input box.');
            return;
        }
        
        startLoading('Analyzing and fixing code errors...');
        
        try {
            const res = await callApi('debug', { code });
            handleResult(res.result);
        } catch (err) {
            console.error(err);
            handleError(err.message);
        } finally {
            stopLoading();
        }
    });

    // 3. Copy Output to Clipboard
    btnCopy.addEventListener('click', () => {
        // If there are code blocks, copy just the code, else copy all text
        const codeBlocks = outputContent.querySelectorAll('code');
        let textToCopy = '';
        
        if (codeBlocks.length > 0) {
            // Combine all code blocks logic just in case there are multiple
            textToCopy = Array.from(codeBlocks).map(cb => cb.innerText).join('\n\n');
        } else {
            textToCopy = outputContent.innerText;
        }
        
        if (!textToCopy) return;

        navigator.clipboard.writeText(textToCopy).then(() => {
            // Little feedback animation
            const origIcon = btnCopy.innerHTML;
            btnCopy.innerHTML = '<i class="fa-solid fa-check" style="color: #4caf50;"></i>';
            setTimeout(() => {
                btnCopy.innerHTML = origIcon;
            }, 2000);
        }).catch(err => {
            console.error("Failed to copy", err);
        });
    });

});
